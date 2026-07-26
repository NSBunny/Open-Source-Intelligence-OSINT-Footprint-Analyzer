"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "motion/react";
import { Shield, Globe, FileText, AlertTriangle, Search, Link2 } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./Icons";
import type { ExposureGraph as ExposureGraphType } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  identity: Shield,
  github: GithubIcon,
  linkedin: LinkedinIcon,
  blog: Globe,
  breach: AlertTriangle,
  document: FileText,
  mention: Search,
  default: Link2,
};

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  identity: { bg: "#06b6d4", border: "#22d3ee", text: "#ffffff", glow: "rgba(6,182,212,0.4)" },
  safe: { bg: "rgba(16,185,129,0.15)", border: "#10b981", text: "#34d399", glow: "rgba(16,185,129,0.2)" },
  moderate: { bg: "rgba(245,158,11,0.15)", border: "#f59e0b", text: "#fbbf24", glow: "rgba(245,158,11,0.2)" },
  high: { bg: "rgba(239,68,68,0.15)", border: "#ef4444", text: "#f87171", glow: "rgba(239,68,68,0.2)" },
  critical: { bg: "rgba(220,38,38,0.15)", border: "#dc2626", text: "#fca5a5", glow: "rgba(220,38,38,0.3)" },
};

function CustomNode({ data }: NodeProps) {
  const nodeType = data.nodeType as string || "default";
  const risk = data.risk as string || "safe";
  const isIdentity = nodeType === "identity";
  const colors = isIdentity ? colorMap.identity : (colorMap[risk] || colorMap.safe);
  const platform = (data.platform as string) || nodeType;
  const IconComponent = iconMap[platform] || iconMap[nodeType] || iconMap.default;
  const details = data.details as string | undefined;

  return (
    <div
      className="relative group"
      style={{
        filter: `drop-shadow(0 0 ${isIdentity ? "12px" : "6px"} ${colors.glow})`,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0 !w-0 !h-0" />

      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300 ${
          isIdentity ? "px-5 py-4" : ""
        }`}
        style={{
          background: isIdentity ? colors.bg : colors.bg,
          borderColor: colors.border,
          minWidth: isIdentity ? 160 : 130,
        }}
      >
        <IconComponent
          className={`shrink-0 ${isIdentity ? "w-6 h-6" : "w-4 h-4"}`}
          style={{ color: isIdentity ? colors.text : colors.text }}
        />
        <div>
          <div
            className={`font-semibold leading-tight ${isIdentity ? "text-sm" : "text-xs"}`}
            style={{ color: isIdentity ? colors.text : colors.text }}
          >
            {data.label as string}
          </div>
          {details && (
            <div className="text-[10px] mt-0.5 opacity-60" style={{ color: colors.text }}>
              {details}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

interface ExposureGraphProps {
  graph: ExposureGraphType;
}

export default function ExposureGraphComponent({ graph }: ExposureGraphProps) {
  const nodes: Node[] = graph.nodes.map((n) => ({
    id: n.id,
    type: "custom",
    position: n.position,
    data: n.data,
    draggable: true,
  }));

  const edges: Edge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.animated,
    style: {
      stroke: e.style?.stroke as string || "#06b6d4",
      strokeWidth: (e.style?.strokeWidth as number) || 1.5,
    },
    labelStyle: {
      fill: "#94a3b8",
      fontSize: 10,
      fontFamily: "'JetBrains Mono', monospace",
    },
    labelBgStyle: {
      fill: "rgba(10, 14, 26, 0.9)",
      stroke: "rgba(6, 182, 212, 0.2)",
    },
    labelBgPadding: [6, 4] as [number, number],
    labelBgBorderRadius: 6,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="glass-card overflow-hidden"
      style={{ height: 500 }}
    >
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-xl">🕸️</span> Digital Exposure Map
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Interactive graph — drag nodes, scroll to zoom, click for details
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600" /> Critical</span>
        </div>
      </div>

      <div style={{ height: 440 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background color="rgba(6, 182, 212, 0.05)" gap={30} />
          <Controls
            showInteractive={false}
            className="!bg-navy-800/80 !border-white/10 !rounded-xl"
          />
          <MiniMap
            nodeColor={(node) => {
              const risk = node.data?.risk as string;
              if (risk === "critical") return "#dc2626";
              if (risk === "high") return "#ef4444";
              if (risk === "moderate") return "#f59e0b";
              return "#10b981";
            }}
            maskColor="rgba(3, 7, 18, 0.8)"
            className="!bg-navy-900/80 !border-white/10 !rounded-xl"
          />
        </ReactFlow>
      </div>
    </motion.div>
  );
}
