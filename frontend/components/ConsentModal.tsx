"use client";

import { motion, AnimatePresence } from "motion/react";
import { Shield, Lock, Eye, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConsentModal({ isOpen, onClose, onConfirm }: ConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-card p-8 max-w-lg w-full relative"
            style={{ border: "1px solid rgba(6, 182, 212, 0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyber-green flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Privacy Consent</h3>
                <p className="text-xs text-gray-400">Before we begin scanning</p>
              </div>
            </div>

            {/* Privacy Features */}
            <div className="space-y-3 mb-6">
              {[
                { icon: Lock, text: "Zero Storage Mode — No personal data is stored on our servers" },
                { icon: Eye, text: "Results automatically disappear when your session ends" },
                { icon: Shield, text: "All processing happens securely with encrypted connections" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03]">
                  <item.icon className="w-4 h-4 text-cyber-cyan mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer mb-6 p-3 rounded-lg border border-white/10 hover:border-cyber-cyan/30 transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-cyan-500"
              />
              <span className="text-sm text-gray-300 leading-relaxed">
                I confirm this information belongs to me or I have proper authorization
                to perform this scan. I understand the results are for awareness purposes only.
              </span>
            </label>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (agreed) onConfirm();
                }}
                disabled={!agreed}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-cyber-green text-navy-950 font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyber-cyan/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                Proceed with Scan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
