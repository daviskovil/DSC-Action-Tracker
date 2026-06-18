"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Action } from "@/lib/types";
import ActionCard from "./ActionCard";

const COLUMN_STYLES: Record<string, string> = {
  "Not Started": "bg-gray-50 border-gray-200",
  "In Progress": "bg-blue-50 border-blue-200",
  Blocked: "bg-red-50 border-red-200",
  Done: "bg-green-50 border-green-200",
};

interface Props {
  status: string;
  actions: Action[];
  onCardClick: (action: Action) => void;
}

export default function KanbanColumn({ status, actions, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border p-3 min-h-[200px] transition-colors ${
        COLUMN_STYLES[status] ?? "bg-gray-50 border-gray-200"
      } ${isOver ? "ring-2 ring-indigo-400" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {status}
        </h3>
        <span className="text-xs bg-white border border-gray-200 text-gray-500 rounded-full px-2 py-0.5">
          {actions.length}
        </span>
      </div>

      <SortableContext items={actions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {actions.map((action) => (
            <ActionCard key={action.id} action={action} onClick={onCardClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
