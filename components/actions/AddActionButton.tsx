"use client";

import { useState } from "react";
import ActionModal from "./ActionModal";
import type { Action } from "@/lib/types";

interface Props {
  ownerNames: string[];
  onCreated?: (action: Action) => void;
}

export default function AddActionButton({ ownerNames, onCreated }: Props) {
  const [open, setOpen] = useState(false);

  function handleSaved(action: Action) {
    onCreated?.(action);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <span className="text-lg leading-none">+</span> Add Action
      </button>

      {open && (
        <ActionModal
          ownerNames={ownerNames}
          onSaved={handleSaved}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
