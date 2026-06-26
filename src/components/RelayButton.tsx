"use client";

import React from "react";
import { Power } from "lucide-react";

interface RelayButtonProps {
  label: string;
  isOn: boolean;
  onToggle: (newState: boolean) => void;
  isLoading?: boolean;
}

export default function RelayButton({
  label,
  isOn,
  onToggle,
  isLoading = false,
}: RelayButtonProps) {
  return (
    <div
      className={`relative flex items-center justify-between p-6 rounded-2xl transition-all duration-300 ease-out border shadow-lg backdrop-blur-md overflow-hidden group cursor-pointer ${
        isOn
          ? "bg-emerald-500/10 border-emerald-500/50 shadow-emerald-500/20"
          : "bg-white/5 border-white/10 shadow-black/20 hover:bg-white/10"
      }`}
      onClick={() => !isLoading && onToggle(!isOn)}
    >
      {/* Background glow effect for ON state */}
      {isOn && (
        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-50" />
      )}

      <div className="relative z-10 flex flex-col gap-1">
        <h3 className="text-xl font-medium tracking-wide text-white">{label}</h3>
        <p className={`text-sm ${isOn ? "text-emerald-400" : "text-gray-400"}`}>
          {isOn ? "Active" : "Inactive"}
        </p>
      </div>

      <button
        disabled={isLoading}
        className={`relative z-10 p-4 rounded-full transition-all duration-300 transform group-active:scale-95 ${
          isOn
            ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
            : "bg-white/10 text-gray-400 hover:bg-white/20"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Power className={`w-6 h-6 ${isLoading ? "animate-pulse" : ""}`} />
      </button>
    </div>
  );
}
