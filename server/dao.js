"use strict";

const sqlite = require("sqlite3");

// open the database
const db = new sqlite.Database("CMS.sqlite", (err) => {
  if (err) throw err;
});

// get all pages
exports.listPage = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM pages ORDER BY pubDate";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }

      resolve(rows);
    });
  });
};

exports.listImage = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT name FROM images";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }

      resolve(rows);
    });
  });
};

exports.listPublicatePage = () => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT * FROM pages WHERE pubDate IS NOT NULL and pubDate<= date('now') ORDER BY pubDate";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }

      resolve(rows);
    });
  });
};

//get a page with the id
exports.pageId = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM pages WHERE id=?";
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
      }

      resolve(rows);
    });
  });
};

exports.contentPageId = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM blocks WHERE pageId=? ORDER BY pOrder ASC";
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
      }

      resolve(rows);
    });
  });
};

//add a page
exports.createPage = (page) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO pages(title, author, createDate, pubDate, userId) VALUES(?, ?, DATE(?), DATE(?), ?)";
    db.run(
      sql,
      [page.title, page.author, page.createDate, page.pubDate, page.userId],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
};

//add blocks
exports.addBlocks = (blocks, pageId) => {
  return new Promise((resolve, reject) => {
    let sql = "INSERT INTO blocks(type, internal, pageId, pOrder) VALUES ";
    let params = [];
    for (const b of blocks) {
      sql += "(?, ?, ?, ?),";
      params.push(b.type);
      params.push(b.internal);
      params.push(pageId);
      params.push(b.pOrder);
    }
    sql = sql.slice(0, sql.length - 1);

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
};

//update blocks
exports.updateBlocks = (blocks, pageId) => {
  return new Promise((resolve, reject) => {
    let sql = "WITH updated(id, type, internal, pageId, pOrder) AS (VALUES ";
    let params = [];
    for (const b of blocks) {
      sql += "(?, ?, ?, ?, ?),";
      params.push(b.id);
      params.push(b.type);
      params.push(b.internal);
      params.push(pageId);
      params.push(b.pOrder);
    }
    sql =
      sql.slice(0, sql.length - 1) +
      ") UPDATE blocks SET type = updated.type, internal = updated.internal, pOrder = updated.pOrder FROM updated WHERE blocks.id = updated.id";
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

//delete blocks
exports.deleteSomeBlocks = (blocks) => {
  return new Promise((resolve, reject) => {
    let sql = "DELETE FROM blocks WHERE id IN ( ";
    let params = [];
    for (const b of blocks) {
      sql += "?,";
      params.push(b.id);
    }
    sql = sql.slice(0, sql.length - 1) + ")";

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
};

//delete page
exports.deletePage = (pageId, userId) => {
  return new Promise((resolve, reject) => {
    let sql = "DELETE FROM pages WHERE id = ?";
    let params = [pageId];
    if (userId) {
      sql += "and userId=?";
      params.push(userId);
    }

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      } else resolve(this.changes); // return the number of affected rows
    });
  });
};

//delete blocks
exports.deleteBlocks = (pageId) => {
  return new Promise((resolve, reject) => {
    let sql = "DELETE FROM blocks WHERE pageId=? ";
    db.run(sql, [pageId], function (err) {
      if (err) {
        reject(err);
        return;
      } else resolve(this.changes); // return the number of affected rows
    });
  });
};

// update an existing page
exports.updatePage = (page) => {
  return new Promise((resolve, reject) => {
    const sql =
      "UPDATE pages SET title=?, author=?, createDate=DATE(?), pubDate=DATE(?), userId=? WHERE id = ?";
    db.run(
      sql,
      [
        page.title,
        page.author,
        page.createDate,
        page.pubDate,
        page.userId,
        page.id,
      ],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes);
      }
    );
  });
};

exports.getTitle = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT title FROM settings WHERE id=1";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }

      resolve(rows);
    });
  });
};

exports.changeTitle = (newTitle) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE settings SET title= ? WHERE id=1";
    db.run(sql, [newTitle], function (err) {
      if (err) {
        reject(err);
      }
      resolve(this.changes);
    });
  });
};
