"use client";

import { motion } from "motion/react";
import { getSeverityColor, formatDate } from "@/lib/utils";
import type { TimelineEvent } from "@/types";

interface TimelineIntelProps {
  events: TimelineEvent[];
}

const typeIcons: Record<string, string> = {
  breach: "🔓",
  profile: "👤",
  mention: "🔍",
  document: "📄",
};

export default function TimelineIntel({ events }: TimelineIntelProps) {
  const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
        <span className="text-xl">⏳</span> Timeline Intelligence
      </h3>
      <p className="text-xs text-gray-500 mb-6">Chronological exposure history</p>

      <div className="relative">
        {/* Horizontal scrollable timeline */}
        <div className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex items-start gap-0 min-w-max">
            {sorted.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative flex flex-col items-center"
                style={{ minWidth: 160 }}
              >
                {/* Date */}
                <div className="text-xs font-mono text-gray-500 mb-3">
                  {formatDate(event.date)}
                </div>

                {/* Node */}
                <div className="relative z-10">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base border-2"
                    style={{
                      borderColor: getSeverityColor(event.severity),
                      background: `${getSeverityColor(event.severity)}15`,
                      boxShadow: `0 0 12px ${getSeverityColor(event.severity)}30`,
                    }}
                  >
                    {typeIcons[event.type] || "📌"}
                  </div>
                </div>

                {/* Connector line */}
                {i < sorted.length - 1 && (
                  <div
                    className="absolute top-[52px] left-[50%] h-[2px]"
                    style={{
                      width: 160,
                      background: `linear-gradient(90deg, ${getSeverityColor(event.severity)}50, ${getSeverityColor(sorted[i + 1]?.severity || "low")}50)`,
                    }}
                  />
                )}

                {/* Event Card */}
                <div className="mt-3 text-center px-2">
                  <div className="text-xs font-semibold text-white mb-1">{event.title}</div>
                  <div className="text-[10px] text-gray-500 leading-relaxed max-w-[140px]">
                    {event.description}
                  </div>
                  <div
                    className="inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider"
                    style={{
                      color: getSeverityColor(event.severity),
                      background: `${getSeverityColor(event.severity)}15`,
                      border: `1px solid ${getSeverityColor(event.severity)}30`,
                    }}
                  >
                    {event.severity}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
