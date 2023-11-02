"use strict";
import { Alert } from "react-bootstrap";

function makeOrder(list, order) {
  if (!order) return list.toReversed();
  return list;
}

function findVectorsBlocks(oldBlocks, newBlocks) {
  let up = [];
  let add = [];
  for (let b of newBlocks) {
    if (!b.id) {
      add.push(b);
    } else {
      let i = oldBlocks.findIndex((x) => x.id == b.id);
      if (i >= 0) {
        if (
          oldBlocks[i].type !== b.type ||
          oldBlocks[i].internal !== b.internal ||
          oldBlocks[i].pOrder !== b.pOrder
        )
          up.push(b);
        oldBlocks = oldBlocks.filter((x) => x.id !== b.id);
      }
    }
  }

  return { add: add, del: oldBlocks, up: up };
}

function ErrrorBanner(props) {
  const { error, setError } = props;
  return (
    <Alert
      variant="danger"
      onClose={() => setError()}
      dismissible
      style={{
        position: "fixed",
        width: "-webkit-fill-available",
        textAlignLast: "center",
        bottom: "0px",
        marginBottom: "0px",
      }}
    >
      <Alert.Heading>{error}</Alert.Heading>
    </Alert>
  );
}

export { makeOrder, findVectorsBlocks, ErrrorBanner };
