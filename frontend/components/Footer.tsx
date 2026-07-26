import { Shield, ExternalLink } from "lucide-react";
import { GithubIcon } from "./Icons";


export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto" style={{ background: "rgba(3, 7, 18, 0.6)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyber-cyan" />
            <span className="text-sm font-semibold">
              <span className="gradient-text">Trace</span>
              <span className="text-white">Guard</span>
            </span>
            <span className="text-xs text-gray-500 ml-2">v2.0</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              <span>Zero Storage Mode Active</span>
            </div>
            <span>•</span>
            <span>No personal data is stored</span>
            <span>•</span>
            <span>Results expire with your session</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-cyber-cyan transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-cyber-cyan transition-colors flex items-center gap-1 text-xs"
            >
              Privacy Policy <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
