"use strict";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./myTable.css";
import { Button, Spinner, Table } from "react-bootstrap";
import { AiFillEye } from "react-icons/ai";
import { FaTrashAlt, FaEdit, FaCircle } from "react-icons/fa";
import { BsSortUpAlt, BsSortDown } from "react-icons/bs";
import { makeOrder } from "../helper";
import dayjs from "dayjs";
import API from "../../API";

function MyTable(props) {
  const [pages, setPages] = useState();
  const { user, setError, setUser } = props;
  const [dirty, setDirty] = useState(true);
  const [order, setOrder] = useState(true); //true ASC, false DESC
  const [send, setSend] = useState();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      API.getUserInfo()
        .then((actualUser) => {
          actualUser.id !== user.id &&
            setError("User is no more authenticated");
          actualUser.id !== user.id && setUser();
        })
        .catch((err) => {
          setError(err.message);
          setUser();
        });
    }
  }, []);

  useEffect(() => {
    if (dirty || !user || location.pathname == "/backOffice") {
      API.getPages(user)
        .then((q) => {
          setPages(q);
          setDirty(false);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [dirty, user]);

  function handleRemovePage(id) {
    setSend(id);
    API.deletePage(id, user.id)
      .then((q) => {
        setDirty(true);
        setSend(false);
      })
      .catch((err) => {
        setError(err.message);
        setSend(false);
      });
  }

  return (
    <div className="cmsTable">
      <div className="table-responsive">
        {pages ? (
          <Table className="table mb-4" hover>
            <thead>
              <tr>
                <th scope="col">Title </th>
                <th scope="col">Author </th>
                <th scope="col">Creation date </th>
                <th scope="col">
                  Pubblication Date{" "}
                  {order == true ? (
                    <BsSortUpAlt
                      cursor="pointer"
                      onClick={() => setOrder(false)}
                    />
                  ) : (
                    <BsSortDown
                      cursor="pointer"
                      onClick={() => setOrder(true)}
                    />
                  )}
                </th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {makeOrder(pages, order).map((f, ind) => {
                return (
                  <tr
                    key={ind}
                    className={f.id == send ? "table-active deleted" : ""}
                  >
                    <td>{f.title}</td>
                    <td>{f.author}</td>
                    <td>{dayjs(f.createDate).format("DD/MM/YYYY")}</td>
                    <td>
                      {f.pubDate ? dayjs(f.pubDate).format("DD/MM/YYYY") : "-"}
                    </td>
                    <td>
                      {f.pubDate ? (
                        dayjs().isBefore(dayjs(f.pubDate)) ? (
                          <>
                            <FaCircle color="yellow" /> Programmata
                          </>
                        ) : (
                          <>
                            <FaCircle color="green" /> Pubblicata
                          </>
                        )
                      ) : (
                        <>
                          <FaCircle color="red" /> Draft
                        </>
                      )}
                    </td>
                    <td>
                      <Link to={"/pageView/" + f.id} state={location.pathname}>
                        <AiFillEye size="25px" color="blue" />
                      </Link>
                      {user &&
                        (user.id == f.userId || user.role == "Admin") && (
                          <>
                            <FaTrashAlt
                              color="red"
                              cursor="pointer"
                              size="25px"
                              onClick={() => handleRemovePage(f.id)}
                            />
                            <Link to={"/edit/" + f.id}>
                              <FaEdit size="25px" />
                            </Link>
                          </>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <Spinner animation="grow" variant="primary" size="xxl" />
        )}
      </div>
      {pages && user && (
        <Link to="/add">
          <Button variant="info">+</Button>
        </Link>
      )}
    </div>
  );
}

export default MyTable;
