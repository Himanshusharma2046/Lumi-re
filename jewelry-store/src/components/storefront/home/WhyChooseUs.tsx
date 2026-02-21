"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Gem, Eye, Shield, Sparkles, Hammer, Clock, Diamond } from "lucide-react";

const features = [
  {
    icon: Gem,
    title: "Transparent Pricing",
    description:
      "See exactly what you pay for — metal weight, making charges, gemstone costs, taxes. No hidden fees, ever.",
    color: "from-gold-400/20 to-gold-500/5",
  },
  {
    icon: Eye,
    title: "Full Price Breakdown",
    description:
      "Every product page shows a detailed cost breakdown — gold weight, wastage, making charges, GST and more.",
    color: "from-gold-300/15 to-gold-400/5",
  },
  {
    icon: Shield,
    title: "Certified Quality",
    description:
      "BIS hallmarked gold with purity guarantee. GIA & IGI certified diamonds and gemstones you can trust.",
    color: "from-emerald-400/15 to-emerald-500/5",
  },
  {
    icon: Hammer,
    title: "Master Craftsmanship",
    description:
      "Each piece is meticulously handcrafted by artisans with decades of experience in fine jewelry making.",
    color: "from-gold-500/15 to-gold-600/5",
  },
  {
    icon: Sparkles,
    title: "Ethically Sourced",
    description:
      "We partner only with responsible suppliers. Every gemstone is conflict-free and ethically sourced.",
    color: "from-sky-400/15 to-sky-500/5",
  },
  {
    icon: Clock,
    title: "Made to Order",
    description:
      "Can't find your size? Many pieces are available made-to-order, crafted specifically for you.",
    color: "from-violet-400/15 to-violet-500/5",
  },
];

export function WhyChooseUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="section-luxury bg-white relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute top-0 right-0 w-72 lg:w-96 h-72 lg:h-96 bg-gold-50/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-56 lg:w-72 h-56 lg:h-72 bg-gold-100/30 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-12 h-px bg-linear-to-r from-transparent to-gold-400" />
            <Diamond className="w-4 h-4 text-gold-500" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-gold-600">
              The Lumière Promise
            </span>
            <Diamond className="w-4 h-4 text-gold-500" />
            <span className="w-12 h-px bg-linear-to-l from-transparent to-gold-400" />
          </div>
          <h2 className="font-display text-3xl lg:text-[2.75rem] font-bold text-obsidian-950 mb-4 leading-tight">
            Why Choose Us
          </h2>
          <p className="text-obsidian-400 max-w-lg mx-auto text-sm leading-relaxed">
            We believe luxury jewelry should be transparent, trustworthy, and
            accessible — without compromising on quality or design.
          </p>
        </motion.div>

        {/* ── Feature Grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="group gradient-border rounded-2xl p-5 sm:p-7 hover:shadow-xl hover:shadow-gold-500/5 transition-all duration-500 cursor-default"
            >
              {/* Icon with gradient bg */}
              <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-5 h-5 text-gold-600" />
              </div>

              <h3 className="font-display text-lg font-bold text-obsidian-900 mb-2.5 group-hover:text-gold-700 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-sm text-obsidian-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div className="mt-5 h-px bg-linear-to-r from-gold-300/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
