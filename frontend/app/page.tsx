"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchHero from "@/components/SearchHero";
import { motion } from "motion/react";
import { Shield, Network, Brain, FileWarning, Lock, BarChart3 } from "lucide-react";

const stats = [
  { value: "3.2B+", label: "Records Exposed in 2024" },
  { value: "80%", label: "Breaches Involve Credentials" },
  { value: "100+", label: "Average Online Accounts" },
];

const features = [
  {
    icon: FileWarning,
    title: "Breach Detection",
    description: "Scan known data breaches and paste sites for your exposed credentials and personal data.",
    color: "from-red-500 to-orange-500",
    glow: "rgba(239, 68, 68, 0.15)",
  },
  {
    icon: Network,
    title: "Exposure Graph",
    description: "Interactive visualization mapping your digital identity connections across platforms.",
    color: "from-cyber-cyan to-blue-500",
    glow: "rgba(6, 182, 212, 0.15)",
  },
  {
    icon: Brain,
    title: "AI Threat Analysis",
    description: "AI-powered threat intelligence identifying attack vectors and providing remediation steps.",
    color: "from-purple-500 to-pink-500",
    glow: "rgba(139, 92, 246, 0.15)",
  },
  {
    icon: BarChart3,
    title: "Risk Score 2.0",
    description: "Methodology-backed exposure scoring with weighted severity, correlation, and confidence analysis.",
    color: "from-cyber-green to-emerald-400",
    glow: "rgba(16, 185, 129, 0.15)",
  },
  {
    icon: Lock,
    title: "Privacy-First",
    description: "Zero storage architecture. Your data never touches our servers. Results vanish when your session ends.",
    color: "from-amber-500 to-yellow-400",
    glow: "rgba(245, 158, 11, 0.15)",
  },
  {
    icon: Shield,
    title: "Remediation Engine",
    description: "Step-by-step actionable guidance to reduce your digital exposure and harden your accounts.",
    color: "from-cyan-400 to-teal-500",
    glow: "rgba(6, 182, 212, 0.15)",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-40 pb-24 px-4 relative overflow-hidden flex flex-col items-center justify-center">
          {/* Ambient glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
               style={{ background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)" }} />

          <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center relative z-10 space-y-10">
            {/* Header Group */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyber-cyan/20 bg-cyber-cyan/5">
                <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
                <span className="text-xs font-medium text-cyber-cyan tracking-wide uppercase">
                  Privacy-First OSINT Platform
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
                Know Your{" "}
                <span className="gradient-text">Digital</span>
                <br />
                <span className="gradient-text">Footprint</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
                Discover what the internet knows about you. AI-powered analysis of data breaches,
                social profiles, and web exposure — with actionable threat intelligence.
              </p>
            </motion.div>

            {/* Search Input Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="w-full max-w-2xl"
            >
              <SearchHero />
            </motion.div>

            {/* Zero Storage Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2"
            >
              <Lock className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Zero Storage Mode — Results vanish immediately when your session ends.</span>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="text-center flex flex-col items-center justify-center space-y-2"
              >
                <div className="text-4xl sm:text-5xl font-black gradient-text font-mono tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-medium tracking-wide uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto flex flex-col space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center flex flex-col items-center space-y-4"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Comprehensive <span className="gradient-text">Threat Intelligence</span>
              </h2>
              <p className="text-gray-400 max-w-xl leading-relaxed text-sm sm:text-base">
                Six modules working together to map, analyze, and protect your digital identity.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="glass-card p-6 group cursor-default"
                  style={{ "--glow-color": feature.glow } as React.CSSProperties}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2.5">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Section */}
        <section className="py-20 px-4 border-t border-white/5 bg-white/[0.005]">
          <div className="max-w-4xl mx-auto flex flex-col space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center flex flex-col items-center space-y-4"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
                Built for <span className="gradient-text">Everyone</span>
              </h2>
              <p className="text-gray-400 max-w-md leading-relaxed text-sm">
                From individual privacy audits to enterprise-scale security assessments.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Individuals", desc: "Personal exposure audit" },
                { label: "HR Teams", desc: "Pre-hire screening" },
                { label: "Universities", desc: "Security awareness" },
                { label: "Enterprises", desc: "Vendor risk audits" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5 text-center flex flex-col justify-center space-y-1.5"
                >
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-xs text-gray-500 leading-normal">{item.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
