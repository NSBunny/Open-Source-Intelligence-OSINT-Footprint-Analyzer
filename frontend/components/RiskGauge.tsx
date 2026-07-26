"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { getRiskColor } from "@/lib/utils";
import type { RiskScore } from "@/types";

interface RiskGaugeProps {
  riskScore: RiskScore;
}

export default function RiskGauge({ riskScore }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);
  const color = getRiskColor(riskScore.category);

  useEffect(() => {
    const target = riskScore.score;
    const duration = 1500;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [riskScore.score]);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-8 flex flex-col items-center"
    >
      {/* SVG Gauge */}
      <div className="relative w-52 h-52 mb-6">
        <svg width="208" height="208" viewBox="0 0 208 208" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="104"
            cy="104"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />
          {/* Score arc */}
          <circle
            cx="104"
            cy="104"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="risk-gauge-ring"
            style={{
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold font-mono"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="text-xs text-gray-400 mt-1">/100</span>
        </div>

        {/* Pulsing glow */}
        <div
          className="absolute inset-0 rounded-full animate-pulse opacity-10"
          style={{
            boxShadow: `0 0 60px ${color}, 0 0 120px ${color}40`,
          }}
        />
      </div>

      {/* Category Badge */}
      <div
        className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-4"
        style={{
          background: `${color}15`,
          color: color,
          border: `1px solid ${color}30`,
        }}
      >
        {riskScore.category}
      </div>

      {/* Score Breakdown */}
      <div className="w-full space-y-2.5 mt-2">
        {[
          { label: "Breach Severity", value: riskScore.breakdown.breachSeverity, weight: "35%" },
          { label: "Sensitive Data", value: riskScore.breakdown.sensitiveData, weight: "25%" },
          { label: "Public Mentions", value: riskScore.breakdown.publicMentions, weight: "20%" },
          { label: "Profile Correlation", value: riskScore.breakdown.profileCorrelation, weight: "10%" },
          { label: "Confidence", value: riskScore.breakdown.confidence, weight: "10%" },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">{item.label}</span>
              <span className="text-gray-500 font-mono">{item.weight} × {Math.round(item.value)}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full"
                style={{ background: color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Methodology */}
      <div className="mt-4 pt-4 border-t border-white/5 w-full">
        <p className="text-[10px] text-gray-600 font-mono text-center leading-relaxed">
          Score = 0.35×Breach + 0.25×Data + 0.20×Mentions + 0.10×Correlation + 0.10×Confidence
        </p>
      </div>
    </motion.div>
  );
}
