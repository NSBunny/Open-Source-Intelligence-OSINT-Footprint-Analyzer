"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Mail, User, AtSign, Phone, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ConsentModal from "./ConsentModal";

const placeholders = [
  "Enter your email address...",
  "Enter a username...",
  "Search any identity...",
];

export default function SearchHero() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = () => {
    if (!email.trim() && !username.trim()) return;
    setShowConsent(true);
  };

  const handleConsentConfirm = () => {
    setShowConsent(false);
    const params = new URLSearchParams();
    if (email) params.set("email", email);
    if (name) params.set("name", name);
    if (username) params.set("username", username);
    router.push(`/scan?${params.toString()}`);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Main Search Input */}
        <div className="relative group">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyber-cyan via-cyber-green to-cyber-purple opacity-30 blur-sm group-hover:opacity-50 transition-opacity duration-500" />
          <div className="relative flex items-center bg-navy-800 rounded-2xl border border-white/10 overflow-hidden">
            <div className="pl-5 text-gray-500">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholders[placeholderIdx]}
              className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-500 outline-none text-base"
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
            <button
              onClick={handleScan}
              disabled={!email.trim() && !username.trim()}
              className="mr-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-green text-navy-950 font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-cyber-cyan/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed pulse-btn"
            >
              <Search className="w-4 h-4" />
              Scan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toggle Advanced */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-4 text-xs text-gray-500 hover:text-cyber-cyan transition-colors flex items-center gap-1 mx-auto"
        >
          <AtSign className="w-3 h-3" />
          {showAdvanced ? "Hide" : "Show"} advanced options
        </button>

        {/* Advanced Fields */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-navy-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-cyber-cyan/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-navy-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-cyber-cyan/50 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        onConfirm={handleConsentConfirm}
      />
    </>
  );
}
