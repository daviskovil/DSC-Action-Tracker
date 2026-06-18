"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { isAfter, parseISO, startOfToday, format } from "date-fns";
import { BUCKET_BADGE, PRIORITY_COLORS } from "@/lib/constants";
import type { Action } from "@/lib/types";

interface Props {
  action: Action;
  onClick: (action: Action) => void;
  isDragging?: boolean;
}

export default function ActionCard({ action, onClick, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  const today = startOfToday();
  const isOverdue =
    action.due_date &&
    action.status !== "Done" &&
    isAfter(today, parseISO(action.due_date));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(action)}
      className={`bg-white rounded-lg border p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow select-none ${
        isDragging ? "shadow-lg rotate-1" : ""
      } ${isOverdue ? "border-red-300" : "border-gray-200"}`}
    >
      {isOverdue && (
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-xs font-medium text-red-600">⚠ Overdue</span>
        </div>
      )}

      <p className="text-sm font-medium text-gray-900 leading-snug mb-2">{action.title}</p>

      <div className="flex flex-wrap gap-1 mb-2">
        <span
          className={`text-xs px-1.5 py-0.5 rounded border font-medium ${
            BUCKET_BADGE[action.bucket] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {action.bucket.replace("Bucket 0", "B").split(" - ")[0]}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[action.priority] ?? ""}`}>
          {action.priority}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{action.owners.join(", ")}</span>
        {action.due_date && (
          <span className={isOverdue ? "text-red-500 font-medium" : ""}>
            {format(parseISO(action.due_date), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}
