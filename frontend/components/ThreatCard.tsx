"use client";

import { motion } from "motion/react";
import { AlertTriangle, Crosshair, ShieldAlert } from "lucide-react";
import type { ThreatSummary } from "@/types";

interface ThreatCardProps {
  threatSummary: ThreatSummary;
}

const probabilityColors: Record<string, { bg: string; text: string; dot: string }> = {
  CRITICAL: { bg: "rgba(220,38,38,0.1)", text: "#fca5a5", dot: "#dc2626" },
  HIGH: { bg: "rgba(239,68,68,0.1)", text: "#f87171", dot: "#ef4444" },
  MEDIUM: { bg: "rgba(245,158,11,0.1)", text: "#fbbf24", dot: "#f59e0b" },
  LOW: { bg: "rgba(16,185,129,0.1)", text: "#34d399", dot: "#10b981" },
};

export default function ThreatCard({ threatSummary }: ThreatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card overflow-hidden"
      style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-red-500/10 bg-red-500/[0.03]">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          AI Threat Analysis
        </h3>
        <p className="text-xs text-gray-500 mt-1">AI-powered threat intelligence assessment</p>
      </div>

      <div className="p-6">
        {/* AI Summary */}
        <div className="mb-6 p-4 rounded-xl bg-red-500/[0.05] border border-red-500/10">
          <p className="text-sm text-gray-300 leading-relaxed">{threatSummary.summary}</p>
        </div>

        {/* Critical Risks */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Critical Risks Identified
          </h4>
          <div className="space-y-2">
            {threatSummary.criticalRisks.map((risk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-start gap-2.5 text-sm text-gray-300"
              >
                <span className="text-red-500 mt-0.5">•</span>
                {risk}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Attack Vectors */}
        <div>
          <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5" />
            Potential Attack Vectors
          </h4>
          <div className="space-y-2">
            {threatSummary.attackVectors.map((vector, i) => {
              const colors = probabilityColors[vector.probability] || probabilityColors.LOW;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * i }}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: colors.bg }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: colors.dot, boxShadow: `0 0 6px ${colors.dot}` }} />
                    <span className="text-sm font-medium" style={{ color: colors.text }}>
                      {vector.name}
                    </span>
                  </div>
                  <span
                    className="text-xs font-mono font-medium px-2 py-0.5 rounded"
                    style={{ color: colors.text }}
                  >
                    {vector.probability}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
