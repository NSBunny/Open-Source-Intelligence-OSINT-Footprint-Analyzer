"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Circle, ShieldCheck, ChevronRight } from "lucide-react";
import type { RemediationStep } from "@/types";

interface RemediationCardProps {
  steps: RemediationStep[];
}

const priorityColors: Record<string, { bg: string; text: string; badge: string }> = {
  critical: { bg: "rgba(220,38,38,0.08)", text: "#fca5a5", badge: "bg-red-600/20 text-red-400" },
  high: { bg: "rgba(239,68,68,0.06)", text: "#f87171", badge: "bg-red-500/20 text-red-400" },
  medium: { bg: "rgba(245,158,11,0.06)", text: "#fbbf24", badge: "bg-amber-500/20 text-amber-400" },
  low: { bg: "rgba(16,185,129,0.06)", text: "#34d399", badge: "bg-emerald-500/20 text-emerald-400" },
};

export default function RemediationCard({ steps }: RemediationCardProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = steps.length > 0 ? (checked.size / steps.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card overflow-hidden"
      style={{ borderColor: "rgba(16, 185, 129, 0.2)" }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-emerald-500/10 bg-emerald-500/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Remediation Plan
            </h3>
            <p className="text-xs text-gray-500 mt-1">Step-by-step actions to reduce your exposure</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-mono font-bold text-emerald-400">
              {checked.size}/{steps.length}
            </span>
            <p className="text-[10px] text-gray-500">completed</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-2">
        {steps.map((step, i) => {
          const isChecked = checked.has(step.id);
          const colors = priorityColors[step.priority] || priorityColors.medium;

          return (
            <motion.button
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              onClick={() => toggle(step.id)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/[0.03] ${
                isChecked ? "opacity-50" : ""
              }`}
            >
              {/* Checkbox */}
              {isChecked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">STEP {step.step}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.badge} font-medium uppercase`}>
                    {step.priority}
                  </span>
                </div>
                <div className={`text-sm font-medium mt-0.5 ${isChecked ? "line-through text-gray-500" : "text-white"}`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-600 shrink-0 mt-1" />
            </motion.button>
          );
        })}
      </div>

      {/* Zero Storage Notice */}
      <div className="px-6 py-3 border-t border-white/5 flex items-center gap-2 text-[10px] text-gray-600">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
        Checklist state is local only — not stored or transmitted
      </div>
    </motion.div>
  );
}
