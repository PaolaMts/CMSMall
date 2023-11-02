"use strict";
import React from "react";
import MyNavbar from "./myNavbar";
import { Outlet } from "react-router-dom";
import { ErrrorBanner } from "./helper";

function Menu(props) {
  const { error, setError, login, logout } = props;

  return (
    <>
      <MyNavbar
        login={login}
        logout={logout}
        setError={setError}
        user={login}
      />
      <div>
        <Outlet />
      </div>
      {error && <ErrrorBanner error={error} setError={setError} />}
    </>
  );
}

export default Menu;
