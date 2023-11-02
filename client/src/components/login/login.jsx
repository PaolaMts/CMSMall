"use strict";
import { useState } from "react";
import { Form, Button, Card, Spinner } from "react-bootstrap";
import "./login.css";

function Login(props) {
  const [username, setUsername] = useState("luigi@test.com");
  const [password, setPassword] = useState("pwd");
  const { login, user, send, setSend } = props;

  const handleSubmit = (event) => {
    event.preventDefault();
    setSend(true);
    login({ username, password });
  };

  return (
    <div id="login">
      <Card id="loginCard">
        <h1>Login</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="username" className="mb-5">
            <Card.Title>Email</Card.Title>
            <Form.Control
              type="email"
              value={username}
              placeholder="Insert email (ex. username@test.com)"
              onChange={(ev) => setUsername(ev.target.value)}
              required={true}
            />
          </Form.Group>

          <Form.Group controlId="password" className="mb-5">
            <Card.Title>Password</Card.Title>
            <Form.Control
              type="password"
              value={password}
              placeholder="Insert password"
              onChange={(ev) => setPassword(ev.target.value)}
              required={true}
              minLength={3}
            />
          </Form.Group>

          <Button type="submit" variant="light">
            {send == false && !user ? (
              "Login"
            ) : (
              <Spinner animation="border" variant="primary" />
            )}
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
