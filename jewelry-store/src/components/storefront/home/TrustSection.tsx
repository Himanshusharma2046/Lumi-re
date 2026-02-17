"use client";

import { ShieldCheck, Award, Truck, Gem, RefreshCw, HeartHandshake, Diamond } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "BIS Hallmarked", desc: "916 Certified Gold" },
  { icon: Award, label: "Certified Gems", desc: "GIA & IGI" },
  { icon: Truck, label: "Free Delivery", desc: "Above ₹25,000" },
  { icon: Gem, label: "Transparent Pricing", desc: "Full Breakdown" },
  { icon: RefreshCw, label: "15-Day Returns", desc: "No Questions" },
  { icon: HeartHandshake, label: "Lifetime Exchange", desc: "100% Value" },
  { icon: Diamond, label: "Handcrafted", desc: "Master Artisans" },
];

export function TrustSection() {
  // Duplicate for seamless infinite marquee
  const allBadges = [...badges, ...badges];

  return (
    <section className="bg-white border-b border-obsidian-100/60 overflow-hidden relative">
      {/* Subtle top gold line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold-300/30 to-transparent" />

      <div className="py-5 sm:py-7 lg:py-8">
        <div className="animate-marquee flex items-center w-max">
          {allBadges.map((badge, i) => (
            <div
              key={`${badge.label}-${i}`}
              className="flex items-center gap-2.5 sm:gap-3 px-5 sm:px-8 lg:px-10 group cursor-default"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gold-50 flex items-center justify-center shrink-0 group-hover:bg-gold-100 group-hover:scale-110 transition-all duration-300">
                <badge.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
              </div>
              <div className="whitespace-nowrap">
                <p className="text-[11px] sm:text-xs font-semibold text-obsidian-900 leading-tight">
                  {badge.label}
                </p>
                <p className="text-[9px] sm:text-[10px] text-obsidian-400 leading-tight">{badge.desc}</p>
              </div>

              {/* Separator diamond */}
              <Diamond className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-gold-300/40 ml-4 sm:ml-6 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
