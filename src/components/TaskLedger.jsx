import { useState } from "react";
import { getActiveChildId } from "../db.js";
import ChildProgressSheet from "./ChildProgressSheet.jsx";

export default function TaskLedger({ children, className = "", childId }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open ? <ChildProgressSheet childId={childId || getActiveChildId()} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export { default as TaskLedgerSheet } from "./ChildProgressSheet.jsx";
