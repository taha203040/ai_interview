"use client";

import { dia, shapes } from "@joint/core";

type DiagramJSON = ReturnType<dia.Graph["toJSON"]>;

export interface RectangleInput {
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  label?: string;
}

/**
 * Thin, client-only wrapper around the official JointJS core library
 * (@joint/core). Rendering and graph serialization are provided by JointJS.
 *
 * See: https://docs.jointjs.com
 */
export class DiagramEngine {
  private graph: dia.Graph;
  private paper: dia.Paper | null = null;

  constructor() {
    this.graph = new dia.Graph({}, { cellNamespace: shapes });
  }

  attach(
    el: HTMLElement,
    options?: { width?: number | string; height?: number | string }
  ): void {
    this.paper = new dia.Paper({
      el,
      model: this.graph,
      width: options?.width ?? "100%",
      height: options?.height ?? 400,
      background: { color: "#fafafa" },
      cellViewNamespace: shapes,
      defaultLink: () => new shapes.standard.Link(),
    });
  }

  addRectangle(input: RectangleInput = {}): dia.Cell {
    const node = new shapes.standard.Rectangle();
    node.position(input.position?.x ?? 20, input.position?.y ?? 20);
    node.resize(input.size?.width ?? 120, input.size?.height ?? 48);
    node.attr("body/magnet", true);
    if (input.label) {
      node.attr("label", { text: input.label });
    }
    node.addTo(this.graph);
    return node;
  }

  addLink(source: dia.Cell, target: dia.Cell): dia.Cell {
    const link = new shapes.standard.Link();
    link.source(source);
    link.target(target);
    link.addTo(this.graph);
    return link;
  }

  toJSON(): DiagramJSON {
    return this.graph.toJSON();
  }

  fromJSON(json: DiagramJSON): void {
    this.graph.fromJSON(json);
  }

  destroy(): void {
    this.paper?.remove();
    this.paper = null;
  }
}
