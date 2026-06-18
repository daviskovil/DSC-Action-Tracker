"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { STATUSES } from "@/lib/constants";
import type { Action } from "@/lib/types";
import KanbanColumn from "./KanbanColumn";
import ActionCard from "./ActionCard";
import { createClient } from "@/lib/supabase/client";

interface Props {
  actions: Action[];
  onCardClick: (action: Action) => void;
  onStatusChange: (updated: Action) => void;
}

export default function KanbanBoard({ actions, onCardClick, onStatusChange }: Props) {
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const action = actions.find((a) => a.id === event.active.id);
    if (action) setActiveAction(action);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveAction(null);
    const { active, over } = event;
    if (!over) return;

    const action = actions.find((a) => a.id === active.id);
    if (!action) return;

    const newStatus = over.id as string;
    if (!STATUSES.includes(newStatus as typeof STATUSES[number])) return;
    if (action.status === newStatus) return;

    // Optimistic update
    const updated = { ...action, status: newStatus };
    onStatusChange(updated);

    // Persist
    await supabase
      .from("actions")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", action.id);
  }

  const byStatus = (status: string) => actions.filter((a) => a.status === status);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            actions={byStatus(status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeAction ? (
          <ActionCard action={activeAction} onClick={() => {}} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
