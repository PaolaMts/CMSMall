"use strict";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Menu from "./components/Menu";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import MyTable from "./components/myTable/myTable";
import VisualizePage from "./components/myTable/visualizePage";
import { Navigate } from "react-router-dom";
import Login from "./components/login/login";
import API from "./API";
import MyForm from "./components/myForm/myForm";

function App() {
  const [message, setMessage] = useState();
  const [user, setUser] = useState();
  const [send, setSend] = useState(false);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setMessage();
      setSend(false);
    } catch (err) {
      setMessage(err.message);
      setSend(false);
    }
  };

  const handleLogout = async () => {
    try {
      await API.logOut();
      setUser();
      setMessage();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          element={
            <Menu
              login={user}
              logout={handleLogout}
              setError={setMessage}
              error={message}
            />
          }
        >
          <Route path="/" element={<MyTable setError={setMessage} />} />
          <Route
            path="/backOffice"
            element={
              user ? (
                <MyTable user={user} setError={setMessage} setUser={setUser} />
              ) : (
                <Navigate replace to="/" />
              )
            }
          />
          <Route
            path="/pageView/:id"
            element={<VisualizePage setError={setMessage} />}
          />
          <Route
            path="/add"
            element={<MyForm user={user} setError={setMessage} />}
          />
          <Route
            path="/edit/:id"
            element={<MyForm user={user} setError={setMessage} />}
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate replace to="/backOffice" />
              ) : (
                <Login
                  login={handleLogin}
                  user={user}
                  send={send}
                  setSend={setSend}
                />
              )
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
