"use client";

import { motion } from "motion/react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import type { Breach, SocialProfile, WebMention, RiskBreakdown } from "@/types";

interface ExposureChartsProps {
  breaches: Breach[];
  socialProfiles: SocialProfile[];
  webMentions: WebMention[];
  riskBreakdown: RiskBreakdown;
}

const CHART_COLORS = ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border border-white/10">
      <span className="text-white font-medium">{payload[0].name}: </span>
      <span className="text-cyber-cyan font-mono">{payload[0].value}</span>
    </div>
  );
};

export default function ExposureCharts({
  breaches, socialProfiles, webMentions, riskBreakdown
}: ExposureChartsProps) {

  // Data Type Distribution (Donut)
  const dataTypeMap = new Map<string, number>();
  breaches.forEach(b => b.dataClasses.forEach(dc => dataTypeMap.set(dc, (dataTypeMap.get(dc) || 0) + 1)));
  const dataTypePie = Array.from(dataTypeMap.entries()).map(([name, value]) => ({ name, value }));
  if (dataTypePie.length === 0) {
    dataTypePie.push({ name: "No Data", value: 1 });
  }

  // Platform Distribution (Bar)
  const platformMap = new Map<string, number>();
  socialProfiles.forEach(p => platformMap.set(p.platform, (platformMap.get(p.platform) || 0) + 1));
  breaches.forEach(() => platformMap.set("Breaches", (platformMap.get("Breaches") || 0) + 1));
  webMentions.forEach(m => platformMap.set(m.source, (platformMap.get(m.source) || 0) + 1));
  const platformBar = Array.from(platformMap.entries()).map(([name, count]) => ({ name, count }));

  // Risk Breakdown (Radar)
  const radarData = [
    { subject: "Breach Severity", value: riskBreakdown.breachSeverity },
    { subject: "Data Exposure", value: riskBreakdown.sensitiveData },
    { subject: "Public Mentions", value: riskBreakdown.publicMentions },
    { subject: "Correlation", value: riskBreakdown.profileCorrelation },
    { subject: "Confidence", value: riskBreakdown.confidence },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
        <span className="text-xl">📊</span> Exposure Analytics
      </h3>
      <p className="text-xs text-gray-500 mb-6">Visual breakdown of your digital exposure</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Donut - Data Types */}
        <div className="glass-card p-5">
          <h4 className="text-sm font-semibold text-white mb-1">Data Types Exposed</h4>
          <p className="text-[10px] text-gray-500 mb-4">Categories of leaked information</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dataTypePie}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {dataTypePie.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {dataTypePie.map((entry, i) => (
              <span key={entry.name} className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {entry.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bar - Platform Distribution */}
        <div className="glass-card p-5">
          <h4 className="text-sm font-semibold text-white mb-1">Platform Distribution</h4>
          <p className="text-[10px] text-gray-500 mb-4">Where your data was found</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={platformBar} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar - Risk Breakdown */}
        <div className="glass-card p-5">
          <h4 className="text-sm font-semibold text-white mb-1">Risk Breakdown</h4>
          <p className="text-[10px] text-gray-500 mb-4">Multi-factor risk analysis</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: "#6b7280" }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} />
              <Radar
                dataKey="value"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
