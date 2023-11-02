"use strict";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import API from "../../API";
import {
  Nav,
  Card,
  Button,
  Container,
  Spinner,
  Accordion,
} from "react-bootstrap";
import dayjs from "dayjs";
import "./visualizePage.css";

function VisualizePage(props) {
  const [page, setPage] = useState();
  const { id } = useParams();
  const { setError } = props;
  const location = useLocation();

  useEffect(() => {
    if (id)
      API.getPageById(id)
        .then((q) => setPage(q))
        .catch((err) => setError(err.message));
  }, [id]);

  return (
    <Container fluid className="d-flex">
      <Nav id="contentsMenu">
        <Link to={location.state}>
          <Button variant="danger" onClick={() => setError()}>
            Home
          </Button>
        </Link>
        {page && (
          <Container id="pageContain">
            <Card id="cardContents">
              <Container id="singleContent">
                <Card.Title>Title</Card.Title>
                <Card.Text>{page.page.title}</Card.Text>
                <Card.Title>Author</Card.Title>
                <Card.Text>{page.page.author}</Card.Text>
                <Card.Title>Creation date</Card.Title>
                <Card.Text>
                  {dayjs(page.page.createDate).format("DD/MM/YYYY")}
                </Card.Text>
                {page.page.pubDate && (
                  <>
                    <Card.Title>Pubblication date</Card.Title>
                    <Card.Text>
                      {" "}
                      {dayjs(page.page.pubDate).format("DD/MM/YYYY")}
                    </Card.Text>
                  </>
                )}
                <Card.Title>Status</Card.Title>
                <Card.Text>
                  {page.page.pubDate
                    ? dayjs().isBefore(dayjs(page.page.pubDate))
                      ? "Programmata"
                      : "Pubblicata"
                    : "Draft"}
                </Card.Text>
              </Container>
            </Card>
          </Container>
        )}
      </Nav>
      <Container fluid id="conteninerList">
        {page ? (
          <Accordion id="contentsList" defaultActiveKey={["0"]} alwaysOpen>
            {page.contents.map((c, ind) => (
              <Accordion.Item key={ind} eventKey={c.pOrder}>
                <Accordion.Header>
                  <label className="text-capitalize">{c.type}</label>
                </Accordion.Header>
                <Accordion.Body>
                  {c.type == "image" ? (
                    <Card.Img
                      id="image"
                      height={"500vh"}
                      variant="bottom"
                      src={`http://localhost:3001/${c.internal}`}
                    />
                  ) : (
                    c.internal
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ height: "60vh" }}
          >
            <Spinner
              id="loading"
              animation="grow"
              variant="primary"
              size="xxl"
            />
          </div>
        )}
      </Container>
    </Container>
  );
}

export default VisualizePage;
