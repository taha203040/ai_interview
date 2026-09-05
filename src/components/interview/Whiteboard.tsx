"use client";

import { useEffect, useRef, useState } from "react";
import { DiagramEngine } from "@/lib/adapters/diagram/diagram-engine";

interface WhiteboardProps {
  engineRef: { current: DiagramEngine | null };
}

/**
 * Candidate whiteboard backed by the JointJS DiagramEngine. Boxes are
 * draggable and can be linked by dragging from one box to another.
 */
export function Whiteboard({ engineRef }: WhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const engine = new DiagramEngine();
    engine.attach(el, { height: 360 });
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [engineRef]);

  const addBox = () => {
    engineRef.current?.addRectangle({ label: label.trim() || undefined });
    setLabel("");
  };

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addBox();
          }}
          placeholder="Box label (e.g. API)"
          className="h-9 flex-1 rounded-md border border-black/[.12] px-3 text-sm outline-none dark:border-white/[.15]"
        />
        <button
          type="button"
          onClick={addBox}
          className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background"
        >
          Add box
        </button>
      </div>
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.08]"
      />
      <p className="mt-1 text-xs text-zinc-400">
        Drag boxes to move them. Drag from a box to another box to connect them.
      </p>
    </div>
  );
}
