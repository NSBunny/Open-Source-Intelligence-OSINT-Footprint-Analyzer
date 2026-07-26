"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "motion/react";
import { Shield, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { api } from "@/services/api";

const SCAN_STEPS = [
  { id: "breach", label: "Checking data breaches...", icon: "🔓" },
  { id: "social", label: "Searching public profiles...", icon: "👤" },
  { id: "google", label: "Running web search...", icon: "🔍" },
  { id: "paste", label: "Scanning paste sites...", icon: "📋" },
  { id: "correlate", label: "Correlating identities...", icon: "🔗" },
  { id: "ai", label: "Running AI analysis...", icon: "🤖" },
  { id: "risk", label: "Calculating risk score...", icon: "📊" },
  { id: "report", label: "Generating threat report...", icon: "📑" },
];

function ScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [scanId, setScanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const username = searchParams.get("username") || "";

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startScan = async () => {
      try {
        const result = await api.startScan({ email, name, username });
        setScanId(result.scanId);

        // Simulate progressive steps for visual effect
        for (let i = 0; i < SCAN_STEPS.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 600));
          setCurrentStep(i + 1);
        }

        // Brief pause to show completion
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push(`/results/${result.scanId}`);
      } catch {
        // If backend is down, use mock mode
        const mockId = "demo-" + Date.now();
        setScanId(mockId);
        for (let i = 0; i < SCAN_STEPS.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 600));
          setCurrentStep(i + 1);
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push(`/results/${mockId}?email=${encodeURIComponent(email)}`);
      }
    };

    startScan();
  }, [email, name, username, router]);

  const progress = (currentStep / SCAN_STEPS.length) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="max-w-lg w-full text-center">
          {/* Radar Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-12"
          >
            <div className="radar-container">
              <div className="radar-circle radar-circle-1" />
              <div className="radar-circle radar-circle-2" />
              <div className="radar-circle radar-circle-3" />
              <div className="radar-circle radar-circle-4" />
              <div className="radar-sweep" />
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyber-cyan shadow-[0_0_20px_rgba(6,182,212,0.6)]" />

              {/* Discovered dots — appear as scan progresses */}
              {currentStep >= 1 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-[20%] left-[65%] w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                />
              )}
              {currentStep >= 2 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-[40%] left-[75%] w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                />
              )}
              {currentStep >= 3 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-[70%] left-[30%] w-2 h-2 rounded-full bg-cyber-green shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                />
              )}
              {currentStep >= 4 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-[30%] left-[25%] w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"
                />
              )}
              {currentStep >= 5 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-[60%] left-[70%] w-2 h-2 rounded-full bg-cyber-purple shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                />
              )}
            </div>
          </motion.div>

          {/* Scanning Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentStep < SCAN_STEPS.length ? "Scanning..." : "Scan Complete"}
            </h2>
            <p className="text-sm text-gray-400 mb-8 font-mono">
              {email || username || "Unknown target"}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-navy-700 rounded-full overflow-hidden mb-8">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #06b6d4, #10b981)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-2 text-left">
            {SCAN_STEPS.map((step, i) => {
              const isComplete = i < currentStep;
              const isActive = i === currentStep;
              const isPending = i > currentStep;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive ? "bg-cyber-cyan/5 border border-cyber-cyan/20" :
                    isComplete ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <span className="text-base">{step.icon}</span>
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-cyber-green shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-cyber-cyan animate-spin shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-600 shrink-0" />
                  )}
                  <span className={`text-sm ${isComplete ? "text-gray-300" : isActive ? "text-white font-medium" : "text-gray-600"}`}>
                    {step.label}
                  </span>
                  {isComplete && (
                    <span className="text-xs text-gray-500 ml-auto font-mono">done</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin" />
      </div>
    }>
      <ScanContent />
    </Suspense>
  );
}
