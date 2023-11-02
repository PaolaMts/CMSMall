"use strict";
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Spinner, Container } from "react-bootstrap";
import "./myForm.css";
import { findVectorsBlocks } from "../helper";
import API from "../../API";
import { BlockForm, SeeBlocks } from "./blockForm";
import dayjs from "dayjs";

function MyForm(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { pathname } = useLocation();
  const { user, setError } = props;
  const [newPage, setNewPage] = useState({
    title: "",
    createDate: dayjs().format("YYYY-MM-DD"),
    pubDate: "",
    author: user && user.name,
    userId: user && user.id,
  });
  const [newBlocks, setNewBlocks] = useState([]);
  const [newSingleBlock, setNewSingleBlock] = useState({
    type: "header",
    internal: "",
  });

  const [users, setUsers] = useState();
  const [images, setImages] = useState();
  const [send, setSend] = useState(false);

  useEffect(() => {
    if (id) {
      API.getPageById(id)
        .then((q) => {
          setNewPage({
            ...q.page,
            pubDate: q.page.pubDate ? q.page.pubDate : "",
            blocks: q.contents,
          });
          setNewBlocks(q.contents);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
    API.getUsersAndImages()
      .then((q) => {
        q.users && setUsers(q.users);
        setImages(q.images);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  function handleAddBlock() {
    if (newSingleBlock.internal !== "") {
      if (newSingleBlock.pOrder)
        setNewBlocks((old) =>
          old.map((x) =>
            x.pOrder == newSingleBlock.pOrder ? newSingleBlock : x
          )
        );
      else
        setNewBlocks((old) => [
          ...old,
          { ...newSingleBlock, pOrder: newBlocks.length + 1 },
        ]);
      setNewSingleBlock({
        type: "header",
        internal: "",
      });
    } else setSingleBlockError("error");
  }

  function handleChangeOrder(id, ind, dir) {
    setNewBlocks((old) =>
      old.map((x, i) => {
        let change = dir == "up" ? -1 : +1;
        return i == ind + change
          ? { ...x, pOrder: x.pOrder - change }
          : i == ind
          ? { ...x, pOrder: x.pOrder + change }
          : x;
      })
    );
  }

  function handleDeleteBlock(ind) {
    setNewBlocks((old) => {
      return old
        .filter((x, i) => i !== ind)
        .map((x, i) => {
          return i >= ind ? { ...x, pOrder: x.pOrder - 1 } : x;
        });
    });
    setNewSingleBlock((old) => ({ ...old, pOrder: old.pOrder - 1 }));
  }

  function handleEditBlock(ind) {
    setNewSingleBlock(newBlocks[ind]);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (dayjs(newPage.pubDate).isBefore(dayjs(newPage.createDate), "days")) {
      setError("Publication date is before the creation date");
      return;
    }

    if (newBlocks.length < 2) {
      setError("At least two contents ");
      return;
    }
    if (!newBlocks.find((x) => x.type == "header")) {
      setError("At least one header ");
      return;
    }
    if (!newBlocks.find((x) => x.type != "header")) {
      setError("At least another not header content ");
      return;
    }
    setSend(true);

    if (id) {
      let vect = findVectorsBlocks(newPage.blocks, newBlocks);

      API.editPage(
        {
          ...newPage,
          pubDate: newPage.pubDate != "" ? newPage.pubDate : undefined,
        },
        vect.add,
        vect.del,
        vect.up
      )
        .then((q) => navigate("/backOffice"))
        .catch((err) => {
          event.preventDefault();
          setError(err.message);
          setSend(false);
        });
    } else {
      API.createPage(
        {
          ...newPage,
          pubDate: newPage.pubDate != "" ? newPage.pubDate : undefined,
        },
        newBlocks
      )
        .then((q) => navigate("/backOffice"))
        .catch((err) => {
          event.preventDefault();
          setError(err.message);
          setSend(false);
        });
    }
  }

  return (
    <div>
      <Form onSubmit={handleSubmit} className="allForm">
        <h1>{pathname == "/add" ? "Add new Page" : "Edit page"}</h1>
        {(!id || (id && newPage.id)) && user ? (
          <div>
            <Form.Group className="mb-5 d-flex" id="main">
              <Form.Group id="author" className="d-flex flex-column">
                <Form.Label>Author</Form.Label>
                {user.role == "Regular" ? (
                  <h5>{newPage.author}</h5>
                ) : users ? (
                  <Form.Select
                    onChange={(e) =>
                      setNewPage((old) => ({
                        ...old,
                        author: e.target.value,
                        userId: users.find((x) => x.name == e.target.value).id,
                      }))
                    }
                    value={newPage.author}
                  >
                    {users &&
                      users.map((u, ind) => {
                        return <option key={ind}>{u.name}</option>;
                      })}
                  </Form.Select>
                ) : (
                  <Spinner animation="border" variant="primary" />
                )}
              </Form.Group>

              <Form.Group id="title">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Page Title"
                  value={newPage.title}
                  onChange={(e) =>
                    setNewPage((old) => ({ ...old, title: e.target.value }))
                  }
                  required={true}
                />
              </Form.Group>
            </Form.Group>
            <Form.Group className="mb-5 d-flex" id="date">
              <Form.Group id="create">
                <Form.Label>Creation Date</Form.Label>
                <h5>{dayjs(newPage.createDate).format("DD/MM/YYYY")}</h5>
              </Form.Group>
              <Form.Group id="pub">
                <Form.Label>Publication Date</Form.Label>
                <Form.Control
                  type="date"
                  value={newPage.pubDate}
                  onChange={(e) =>
                    setNewPage((old) => ({ ...old, pubDate: e.target.value }))
                  }
                />
              </Form.Group>
            </Form.Group>
            <Form.Group className="d-flex" id="allBlocks">
              <SeeBlocks
                newBlock={newSingleBlock}
                changeOrder={handleChangeOrder}
                blocks={newBlocks}
                deleteBlock={handleDeleteBlock}
                editBlock={handleEditBlock}
              />

              <BlockForm
                setNewBlock={setNewSingleBlock}
                newBlock={newSingleBlock}
                images={images}
                addBlock={handleAddBlock}
              />
            </Form.Group>
          </div>
        ) : (
          <Container id="loading">
            <Spinner animation="grow" variant="primary" size="xxl" />
          </Container>
        )}

        <Link to={"/backOffice"}>
          <Button variant="danger" id="delete" onClick={() => setError()}>
            Cancel
          </Button>
        </Link>
        {user && (!id || (id && newPage.id)) && (
          <Button
            type="submit"
            variant="primary"
            id="ok"
            onClick={() => setError()}
          >
            {!send ? (
              id ? (
                "Save"
              ) : (
                "Add"
              )
            ) : (
              <Spinner animation="border" variant="primary" />
            )}
          </Button>
        )}
      </Form>
    </div>
  );
}

export default MyForm;
