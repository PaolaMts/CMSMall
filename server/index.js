"use strict";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { check, validationResult } = require("express-validator");
const dao = require("./dao");
const passport = require("passport"); // auth middleware
const LocalStrategy = require("passport-local").Strategy; // username and password for login
const session = require("express-session"); // enable sessions
const userQuery = require("./userDao"); // module for accessing the user info in the DB

// init express
const app = new express();
const port = 3001;

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(
  new LocalStrategy(function verify(username, password, done) {
    userQuery.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, {
          error: "Incorrect username and/or password.",
        });
      return done(null, user);
    });
  })
);

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userQuery
    .getUserById(id)
    .then((user) => {
      done(null, user); // this will be available in req.user
    })
    .catch((err) => {
      done(err, null);
    });
});

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return next();
};
const verifyAuth = (req, res, need) => {
  if (need.requiredRole == "One") {
    if (req.user.role !== "Admin" && req.user.id !== need.id) {
      return { error: "User not authorized" };
    }
  }
  if (need.requiredRole == "Admin" && req.user.role !== "Admin")
    return { error: "Not an admin" };
};

// set up the session
app.use(
  session({
    secret: "wge8d239bwd93rkskb", 
    resave: false,
    saveUninitialized: false,
  })
);

app.use(morgan("dev"));
app.use(express.json());
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.static("public"));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** APIs ***/

//GET /api/pages
app.get("/api/pages", isLoggedIn, (req, res) => {
  dao
    .listPage()
    .then((page) => res.status(200).json(page))
    .catch(() =>
      res.status(500).json({ error: "Server error during load of pages" })
    );
});

//GET /api/imagesAndUsers
app.get("/api/imagesAndUsers", isLoggedIn, (req, res) => {
  dao
    .listImage()
    .then((image) => {
      if (req.user.role == "Admin") {
        userQuery
          .getUsers()
          .then((users) =>
            res.status(200).json({ users: users, images: image })
          )
          .catch(() =>
            res.status(500).json({ error: "Server error during load of users" })
          );
      }
      else{
      res.status(200).json({ images: image });}
    })
    .catch(() =>
      res.status(500).json({ error: "Server error during load of images" })
    );
});

//GET /api/publicatePages/<id>
app.get("/api/publicatePages", (req, res) => {
  dao
    .listPublicatePage()
    .then((page) => res.status(200).json(page))
    .catch(() =>
      res.status(500).json({ error: "Server error during load of pages" })
    );
});

//GET /api/pages/<id>
app.get("/api/pages/:id", (req, res) => {
  const { id } = req.params;
  dao
    .pageId(id)
    .then((page) => res.status(200).json(page))
    .catch(() =>
      res.status(500).json({ error: "Server error during load of page" })
    );
});

//GET /api/contents/<id>
app.get("/api/pageContents/:id", (req, res) => {
  const { id } = req.params;
  dao
    .contentPageId(id)
    .then((contents) => res.json(contents))
    .catch(() =>
      res.status(500).json({ error: "Server error during load of contents" })
    );
});

//GET /api/title
app.get("/api/title", async (req, res) => {
  dao
    .getTitle()
    .then((title) => res.json(title))
    .catch(() =>
      res.status(500).json({ error: "Server error during load of title" })
    );
});

//PUT /api/title
app.put(
  "/api/title",
  [check("title").isLength({ min: 1 })],
  isLoggedIn,
  async (req, res) => {
    const error = verifyAuth(req, res, { requiredRole: "Admin" });
    if (error) return res.status(401).json(error);

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    dao
      .changeTitle(req.body.title)
      .then((title) => {
        res.status(201).json({});
      })
      .catch(() =>
        res.status(500).json({ error: "Server error during change of title" })
      );
  }
);

// POST /api/page for user
app.post(
  "/api/page",
  [
    check("page.userId").isInt(),
    check("page.title").isLength({ min: 1 }),
    check("page.createDate").isDate({ format: "YYYY-MM-DD", strictMode: true }),
    check("page.pubDate")
      .optional()
      .isDate({ format: "YYYY-MM-DD", strictMode: true }),
    check("blocks").isArray(),
  ],
  isLoggedIn,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } else {
      const error = verifyAuth(req, res, {
        requiredRole: "One",
        id: req.body.page.userId,
      });
      if (error) return res.status(401).json(error);

      try {
        const pageId = await dao.createPage(req.body.page);
        if (pageId) {
          const blocksAdd = await dao.addBlocks(req.body.blocks, pageId);
          res.status(201).json({});
        }
      } catch (err) {
        res
          .status(500)
          .json({
            error: `Database error during the creation of page ${req.body.page.title}.`,
          });
      }
    }
  }
);

// DELETE /api/page/<id>
app.delete("/api/page/:id", isLoggedIn, async (req, res) => {
  try {
    const page = await dao.pageId(req.params.id);
    if (page.length!==0) {
      const error = verifyAuth(req, res, {
        requiredRole: "One",
        id: page[0].userId,
      });
      if (error) return res.status(401).json(error);
    } else return res.status(404).json({ error: "Page not found" });
    const numRowChanges = await dao.deletePage(
      req.params.id,
      req.user.role == "Regular" && req.user.id
    ); // It is WRONG to use something different from req.user.id
    if (numRowChanges > 0) {
      const numDelBlocks = await dao.deleteBlocks(req.params.id);
      res.status(201).json({});
    }
  } catch (err) {
    res
      .status(500)
      .json({
        error: `Database error during the deletion of page ${req.params.id}.`,
      });
  }
});

// PUT /api/page/<id>
app.put(
  "/api/page/:id",
  [
    check("page.userId").isInt(),
    check("page.title").isLength({ min: 1 }),
    check("page.createDate").isDate({ format: "YYYY-MM-DD", strictMode: true }),
    check("page.pubDate")
      .optional()
      .isDate({ format: "YYYY-MM-DD", strictMode: true }),
    check("addBlocks").isArray().optional(),
    check("delBlocks").isArray().optional(),
    check("upBlocks").isArray().optional(),
  ],
  isLoggedIn,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } else {
      const page = await dao.pageId(req.params.id);
      if (page.length!==0) {
        const error = verifyAuth(req, res, {
          requiredRole: "One",
          id: page[0].userId,
        });
        if (error) return res.status(401).json(error);
      } else res.status(404).json({ error: "Page not found" });

      try {
        const change = await dao.updatePage(req.body.page);
        if (change) {
          if (req.body.addBlocks)
            await dao.addBlocks(req.body.addBlocks, req.params.id);
          if (req.body.delBlocks)
            await dao.deleteSomeBlocks(req.body.delBlocks);
          if (req.body.upBlocks)
            await dao.updateBlocks(req.body.upBlocks, req.params.id);
          res.status(201).json({ pageId: req.params.id });
        }
      } catch (err) {
        res
          .status(500)
          .json({
            error: `Database error during the update of page ${req.body.page.title}.`,
          });
      }
    }
  }
);

// POST PER USER LOGIN
app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
  res.status(200).json({id: req.user.id, name: req.user.name, role: req.user.role});}
else
  res.status(401).json({error: 'Unauthenticated user!'});;
});

// DELETE /sessions/current
// logout
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  })
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
