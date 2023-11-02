"use strict";
const URL = "http://localhost:3001/api";

async function logIn(credentials) {
  let response = await fetch(URL + "/sessions", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  }).catch((err) => {
    throw new Error("Cannot communicate with the server.");
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw new Error(user.error);
  }
}

async function getPages(log) {
  let response;
  if (!log)
    response = await fetch(URL + "/publicatePages").catch((err) => {
      throw new Error("Cannot communicate with the server.");
    });
  else
    response = await fetch(URL + "/pages", { credentials: "include" }).catch(
      (err) => {
        throw new Error("Cannot communicate with the server.");
      }
    );
  const pages = await response.json();
  if (response.ok) {
    return pages;
  }
  throw new Error(pages.error);
}

async function getUsersAndImages() {
  const response = await fetch(URL + "/imagesAndUsers", {
    credentials: "include",
  }).catch((err) => {
    throw new Error("Cannot communicate with the server.");
  });
  const imagesAndUsers = await response.json();
  if (response.ok) {
    return imagesAndUsers;
  }
  throw new Error(imagesAndUsers.error);
}

async function getPageById(id) {
  const response = await fetch(URL + "/pages/" + id).catch((err) => {
    throw new Error("Cannot communicate with the server.");
  });
  const pages = await response.json();
  if (response.ok) {
    const response1 = await fetch(URL + "/pageContents/" + id);
    const contents = await response1.json();
    if (response.ok) {
      return { contents: contents, page: pages[0] };
    } else {
      throw new Error(contents.error);
    }
  } else {
    throw new Error(pages.error);
  }
}

async function deletePage(id) {
  const response = await fetch(URL + `/page/${id}`, {
    method: "DELETE",
    credentials: "include",
  }).catch((err) => {
    throw new Error("Cannot communicate with the server.");
  });
  const change = await response.json();
  if (response.ok) {
    return true;
  } else {
    throw new Error(change.error);
  }
}

async function editPage(page, addBlocks, delBlocks, upBlocks) {
  delete page.blocks;
  let body = {
    page: page,
    addBlocks: addBlocks,
    delBlocks: delBlocks,
    upBlocks: upBlocks,
  };
  if (body.addBlocks.length == 0) delete body.addBlocks;
  if (body.delBlocks.length == 0) delete body.delBlocks;
  if (body.upBlocks.length == 0) delete body.upBlocks;
  const response = await fetch(URL + "/page/" + page.id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  }).catch((err) => {
    throw new Error("Cannot communicate with the server.");
  });
  const change = await response.json();
  if (response.ok) {
    return true;
  } else {
    throw new Error(change.error);
  }
}

async function createPage(page, blocks) {
  const resAddPage = await fetch(URL + "/page", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page: page, blocks: blocks }),
  }).catch((err) => {
    throw new Error("Cannot communicate with the server.");
  });
  const change = await resAddPage.json();
  if (resAddPage.ok) {
    return true;
  } else {
    throw new Error(change.error);
  }
}

async function getTitle() {
  const res = await fetch(URL + "/title").catch((err) => {
    throw new Error("Cannot communicate with the server.");
  });
  const title = await res.json();
  if (res.ok) return title[0];
  throw new Error(title.error);
}

async function changeTitle(title) {
  const res = await fetch(URL + "/title", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title }),
  }).catch((err) => {
    throw new Error("Cannot communicate with the server.");
  });
  const newTitle = await res.json();
  if (res.ok) {
    return res.title;
  } else {
    throw new Error(newTitle.error);
  }
}

async function getUserInfo() {
  const response = await fetch(URL + "/sessions/current", {
    credentials: "include",
  }).catch((err) => {
    throw new Error("Cannot communicate with the server.");
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw new Error(userInfo.error);
  }
}

const logOut = async () => {
  const response = await fetch(URL + "/sessions/current", {
    method: "DELETE",
    credentials: "include",
  }).catch((err) => {
    throw new Error("Cannot communicate with the server.");
  });
  const logout = await response.json();
  if (response.ok) return null;
  else throw new Error(logout.error);
};

const API = {
  getPageById,
  getPages,
  logIn,
  logOut,
  deletePage,
  getUsersAndImages,
  createPage,
  editPage,
  changeTitle,
  getTitle,
  getUserInfo,
};
export default API;
