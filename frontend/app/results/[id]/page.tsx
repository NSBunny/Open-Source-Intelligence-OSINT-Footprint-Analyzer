"use client";

import { useEffect, useState, use } from "react";
import { motion } from "motion/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RiskGauge from "@/components/RiskGauge";
import ExposureGraph from "@/components/ExposureGraph";
import TimelineIntel from "@/components/TimelineIntel";
import ThreatCard from "@/components/ThreatCard";
import RemediationCard from "@/components/RemediationCard";
import ExposureCharts from "@/components/ExposureCharts";
import PdfExport from "@/components/PdfExport";
import { api } from "@/services/api";
import { getMockScanResult } from "@/lib/mockData";
import { transformBackendResult } from "@/lib/transformResult";
import type { ScanResult } from "@/types";
import { useSearchParams } from "next/navigation";
import {
  Shield, AlertTriangle, Users, Globe, Clock, Download
} from "lucide-react";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const targetEmail = searchParams.get("email") || undefined;

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Fetch raw result from Express backend
        const raw = await api.getScanResult(id);

        // Transform the Express backend response → frontend ScanResult type
        const transformed = transformBackendResult(raw, id, targetEmail);
        setScanResult(transformed);
      } catch {
        // Fallback to mock data for standalone demo using input email
        setScanResult(getMockScanResult(id, targetEmail));
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, targetEmail]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading results...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Scan not found</p>
        </main>
      </div>
    );
  }

  const r = scanResult;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Exposure <span className="gradient-text">Report</span>
                </h1>
                <p className="text-sm text-gray-400 font-mono">
                  {r.query.email || r.query.username || "Unknown"}
                  <span className="text-gray-600 mx-2">•</span>
                  <Clock className="w-3 h-3 inline mr-1" />
                  Scanned {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
              <PdfExport scanResult={r} />
            </div>
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              {
                icon: AlertTriangle,
                label: "Breaches",
                value: r.breaches.length,
                color: "text-red-400",
                bg: "bg-red-500/10",
              },
              {
                icon: Users,
                label: "Profiles Found",
                value: r.socialProfiles.length,
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
              },
              {
                icon: Globe,
                label: "Web Mentions",
                value: r.webMentions.length,
                color: "text-amber-400",
                bg: "bg-amber-500/10",
              },
              {
                icon: Shield,
                label: "Risk Score",
                value: `${r.riskScore.score}/100`,
                color: r.riskScore.category === "HIGH" || r.riskScore.category === "CRITICAL"
                  ? "text-red-400" : r.riskScore.category === "MODERATE" ? "text-amber-400" : "text-emerald-400",
                bg: r.riskScore.category === "HIGH" || r.riskScore.category === "CRITICAL"
                  ? "bg-red-500/10" : r.riskScore.category === "MODERATE" ? "bg-amber-500/10" : "bg-emerald-500/10",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="glass-card p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Section 1: Risk Score + Exposure Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <RiskGauge riskScore={r.riskScore} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <ExposureGraph graph={r.graph} />
            </motion.div>
          </div>

          {/* Section 2: Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TimelineIntel events={r.timeline} />
          </motion.div>

          {/* Section 3: Threat + Remediation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <ThreatCard threatSummary={r.threatSummary} />
            <RemediationCard steps={r.remediationSteps} />
          </motion.div>

          {/* Section 4: Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ExposureCharts
              breaches={r.breaches}
              socialProfiles={r.socialProfiles}
              webMentions={r.webMentions}
              riskBreakdown={r.riskScore.breakdown}
            />
          </motion.div>

          {/* Zero Storage Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center py-8 border-t border-white/5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-gray-500">
                Zero Storage Mode — This report will disappear when your session ends
              </span>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
