"use client";

import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";

import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-cyber-cyan transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <div className="absolute inset-0 animate-ping opacity-20">
                <Shield className="w-8 h-8 text-cyber-cyan" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="gradient-text">Trace</span>
              <span className="text-white">Guard</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link href="/" className="text-sm text-gray-400 hover:text-cyber-cyan transition-colors duration-200">
              Home
            </Link>
            <Link href="/scan" className="text-sm text-gray-400 hover:text-cyber-cyan transition-colors duration-200">
              Scan
            </Link>

            <ThemeToggle />

            <Link
              href="/scan"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyber-cyan to-cyber-green text-navy-950 hover:shadow-lg hover:shadow-cyber-cyan/25 transition-all duration-300"
            >
              New Scan
            </Link>
          </div>

          {/* Mobile Right */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/5 mt-2 pt-4 space-y-3">
            <Link href="/" className="block text-sm text-gray-400 hover:text-cyber-cyan transition-colors" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href="/scan" className="block text-sm text-gray-400 hover:text-cyber-cyan transition-colors" onClick={() => setMobileOpen(false)}>
              Scan
            </Link>
            <Link
              href="/scan"
              className="block px-4 py-2 rounded-lg text-sm font-medium text-center bg-gradient-to-r from-cyber-cyan to-cyber-green text-navy-950"
              onClick={() => setMobileOpen(false)}
            >
              New Scan
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
