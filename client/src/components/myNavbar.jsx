"use strict";
import React, { useEffect } from "react";
import {
  Navbar,
  Button,
  Container,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { useState } from "react";
import { BsGearWideConnected } from "react-icons/bs";
import { MdAccountCircle, MdSupervisedUserCircle } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { HiPencil } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { BsHouseDoorFill } from "react-icons/bs";
import API from "../API";

function MyNavbar(props) {
  const [title, setTitle] = useState();
  const [dirty, setDirty] = useState(true);
  const [newTitle, setNewTitle] = useState();
  const [send, setSend] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (dirty)
      API.getTitle()
        .then((q) => {
          setDirty(false);
          setTitle(q.title);
          setNewTitle();
        })
        .catch((err) => {
          props.setError(err.message);
        });
  }, [dirty]);

  function handleChangeTitle(event) {
    event.preventDefault();
    setSend(true);
    API.changeTitle(newTitle)
      .then((q) => {
        props.setError();
        setDirty(true);
        setSend(false);
      })
      .catch((err) => {
        props.setError(err.message);
        setSend(false);
      });
  }

  return (
    <Navbar bg="info" expand="sm" variant="light">
      <Container fluid>
        <Navbar.Brand className="d-flex align-items-center">
          <BsGearWideConnected size={"40px"} style={{ marginRight: "5px" }} />{" "}
          {newTitle || newTitle == "" ? (
            !send ? (
              <Form onSubmit={handleChangeTitle}>
                <InputGroup>
                  <Form.Control
                    placeholder="title"
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <Button onClick={() => setNewTitle()} variant="secondary">
                    x
                  </Button>
                  <Button type="submit">+</Button>
                </InputGroup>
              </Form>
            ) : (
              <Spinner animation="border" variant="primary" size="sm" />
            )
          ) : { title } ? (
            <h4 style={{ margin: "3px 0 0 0" }}>{title}</h4>
          ) : (
            <Spinner animation="border" variant="primary" size="sm" />
          )}
          {props.login &&
            props.login.role == "Admin" &&
            location.pathname == "/backOffice" &&
            !newTitle &&
            newTitle !== "" && (
              <Button variant="info" onClick={() => setNewTitle(title)}>
                <HiPencil />
              </Button>
            )}
        </Navbar.Brand>

        {location.pathname == "/login" ? (
          <Link to={"/"}>
            <Button variant="info" onClick={() => props.setError()}>
              <BsHouseDoorFill size={"35px"} color="black" />
              Home
            </Button>
          </Link>
        ) : (
          (location.pathname == "/" || location.pathname == "/backOffice") &&
          (props.login ? (
            <>
              <Button
                variant="info"
                onClick={() => {
                  setNewTitle();
                  props.logout();
                }}
              >
                <div className="d-flex">
                  <MdAccountCircle size={"50px"} color="black" />
                  <div className="d-flex flex-column text-start">
                    Logout
                    <p style={{ fontSize: "15px" }}>
                      {props.login.name} [{props.login.role}]
                    </p>
                  </div>
                </div>
              </Button>{" "}
              {location.pathname == "/" ? (
                <Link to={"/backOffice"}>
                  <Button variant="info" onClick={() => props.setError()}>
                    <FaRegUserCircle size={"45px"} color="black" /> BackOffice{" "}
                    {">"}
                  </Button>
                </Link>
              ) : (
                <Link to={"/"}>
                  <Button variant="info" onClick={() => props.setError()}>
                    <MdSupervisedUserCircle size={"50px"} color="black" />{" "}
                    FrontOffice {">"}
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <Link to={"/login"}>
              <Button variant="info">
                <MdAccountCircle size={"40px"} color="black" />
                Login
              </Button>
            </Link>
          ))
        )}
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
