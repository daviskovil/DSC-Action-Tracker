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
        className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Action
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
