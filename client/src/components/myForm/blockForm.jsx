"use strict";
import React from "react";
import {
  Dropdown,
  DropdownButton,
  Card,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";
import { HiPencil } from "react-icons/hi";
import { TbTrashXFilled } from "react-icons/tb";
import "./blockForm.css";

function SeeBlocks(props) {
  const { changeOrder, blocks, deleteBlock, editBlock, newBlock } = props;
  return (
    <Card id="blocks">
      {blocks ? (
        blocks.length !== 0 ? (
          <>
            <Row id="titles">
              <Col className="h5">Type</Col>
              <Col className="h5">Internal</Col>
              {!newBlock.pOrder && blocks.length > 1 && (
                <Col className="h5" id="action">
                  {" "}
                  Order
                </Col>
              )}
              <Col className="h5" id="action">
                Action
              </Col>
            </Row>
            {blocks
              .sort((a, b) => a.pOrder - b.pOrder)
              .map((b, ind) => {
                return (
                  <Row
                    key={ind}
                    id="singleBlock"
                    className={newBlock.pOrder == b.pOrder && "edit"}
                  >
                    <Col id="type">{b.type}</Col>
                    <Col>
                      {b.type == "image" ? (
                        <Card.Img
                          variant="top"
                          src={`http://localhost:3001/${b.internal}`}
                        />
                      ) : (
                        b.internal
                      )}
                    </Col>
                    {!newBlock.pOrder && blocks.length > 1 && (
                      <Col id="action">
                        {b.pOrder !== blocks.length && (
                          <Button
                            onClick={() => changeOrder(b.id, ind, "down")}
                            variant="outline-warning"
                          >
                            <IoMdArrowRoundDown size={"20px"} />
                          </Button>
                        )}
                        {b.pOrder !== 1 && (
                          <Button
                            onClick={() => changeOrder(b.id, ind, "up")}
                            variant="outline-success"
                          >
                            <IoMdArrowRoundUp size={"20px"} />
                          </Button>
                        )}
                      </Col>
                    )}
                    <Col id="action">
                      <Button
                        variant="outline-primary"
                        onClick={() => editBlock(ind)}
                      >
                        <HiPencil size={"20px"} />
                      </Button>

                      {!newBlock.pOrder && (
                        <Button
                          variant="outline-danger"
                          onClick={() => deleteBlock(ind)}
                        >
                          <TbTrashXFilled size={"20px"} />
                        </Button>
                      )}
                    </Col>
                  </Row>
                );
              })}
          </>
        ) : (
          <Card.Body color="grey">Empty List</Card.Body>
        )
      ) : (
        <Spinner id="loading" animation="grow" variant="primary" size="xxl" />
      )}
    </Card>
  );
}

function BlockForm(props) {
  const { setNewBlock, newBlock, images, addBlock } = props;
  return (
    <div className="d-flex" id="allInputBlocks">
      <Form.Group className="mb-3 d-flex" id="inputGroup">
        <DropdownButton
          variant="outline-secondary"
          title={newBlock.type}
          id="input-group-dropdown-1"
        >
          <Dropdown.Item
            onClick={() =>
              setNewBlock((old) => ({ ...old, type: "header", internal: "" }))
            }
          >
            Header
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() =>
              setNewBlock((old) => ({
                ...old,
                type: "paragraph",
                internal: "",
              }))
            }
          >
            Paragraph
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() =>
              setNewBlock((old) => ({ ...old, type: "image", internal: "" }))
            }
          >
            Image
          </Dropdown.Item>
        </DropdownButton>
        <InputGroup>
          {newBlock.type == "header" ? (
            <Form.Control
              value={newBlock.internal}
              onChange={(e) =>
                setNewBlock((old) => ({ ...old, internal: e.target.value }))
              }
              placeholder={
                "new " + (newBlock.type == "" ? "block" : newBlock.type)
              }
            />
          ) : newBlock.type == "paragraph" ? (
            <Form.Control
              as="textarea"
              value={newBlock.internal}
              onChange={(e) =>
                setNewBlock((old) => ({ ...old, internal: e.target.value }))
              }
              placeholder={
                "new " + (newBlock.type == "" ? "block" : newBlock.type)
              }
            />
          ) : (
            <Card id="images">
              {images &&
                images.map((i, ind) => {
                  return (
                    <Card
                      id={
                        newBlock.internal == i.name
                          ? "selectImage"
                          : "singleCardImage"
                      }
                      key={ind}
                    >
                      <Card.Img
                        id="singleImage"
                        onClick={() =>
                          setNewBlock((old) => ({ ...old, internal: i.name }))
                        }
                        variant="top"
                        src={`http://localhost:3001/${i.name}`}
                      />
                    </Card>
                  );
                })}
            </Card>
          )}
          <Button
            variant="secondary"
            hidden={newBlock.internal == "" && !newBlock.pOrder}
            onClick={() =>
              setNewBlock({
                type: "header",
                internal: "",
              })
            }
          >
            x
          </Button>
        </InputGroup>
      </Form.Group>
      <Button
        id="add"
        cursor="pointer"
        variant="primary"
        onClick={() => addBlock()}
        hidden={newBlock.internal.trim() == ""}
      >
        +
      </Button>
    </div>
  );
}

export { BlockForm, SeeBlocks };
