"use client";

import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import {
  ShieldCheck, Fuel, Landmark, ThumbsUp, ThumbsDown, AlertTriangle,
  Gauge, Droplets, Flame, Wrench, Cpu, ArrowRight, Sparkles,
} from "lucide-react";

const RealisticCar3D = dynamic(() => import("@/components/RealisticCar3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[28rem] rounded-2xl bg-black/20 flex items-center justify-center text-zinc-500 text-sm">
      Loading 3D preview...
    </div>
  ),
});

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-accent2 border border-accent2/30 bg-accent2/5 rounded-full px-3 py-1 mb-4 uppercase tracking-widest">
      <Sparkles size={12} /> {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative">
      <AnimatedBackground />
      <div className="absolute inset-0 bg-hero-glow -z-10 h-[700px]" />

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-zinc-400 border border-border rounded-full px-3 py-1 mb-6">
              <span className="live-dot" />
              Live compatibility engine — always answers
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6 leading-tight">
              Is your vehicle ready for{" "}
              <span className="text-shimmer">E20 petrol?</span>
            </h1>
            <p className="text-zinc-400 mb-8 leading-relaxed max-w-lg">
              India&apos;s fuel has changed. Millions of pre-2023 vehicles
              weren&apos;t built for it. E20-Shield tells you — instantly,
              transparently — whether yours is one of them.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href="/checker"
                className="inline-flex items-center gap-2 bg-accent hover:bg-indigo-500 shadow-glow transition-all px-6 py-3 rounded-lg font-medium"
              >
                Check my vehicle <ArrowRight size={16} />
              </a>
              <a
                href="/dashboard"
                className="inline-block border border-border hover:border-accent2/50 transition-colors px-6 py-3 rounded-lg font-medium text-zinc-300"
              >
                View live dashboard
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-12 max-w-md">
              <div>
                <div className="text-2xl font-semibold text-accent2"><AnimatedCounter target={576} suffix="+" /></div>
                <div className="text-xs text-zinc-500 mt-1">Verified vehicle specs</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-warn"><AnimatedCounter target={20} suffix="%" /></div>
                <div className="text-xs text-zinc-500 mt-1">Ethanol in E20</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-safe"><AnimatedCounter target={100} suffix="%" /></div>
                <div className="text-xs text-zinc-500 mt-1">Inputs always answered</div>
              </div>
            </div>
          </div>

          <div className="animate-float">
            <RealisticCar3D paintColor="#3b82f6" />
          </div>
        </div>
      </div>

      {/* WHY E20 */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <ScrollReveal>
          <SectionLabel>The Background</SectionLabel>
          <h2 className="text-3xl font-semibold mb-4">Why E20 is becoming the norm</h2>
          <p className="text-zinc-400 max-w-2xl leading-relaxed mb-10">
            As part of India&apos;s ethanol-blending roadmap, petrol at most
            stations now contains up to 20% ethanol — up from the 10% ceiling
            most vehicles on the road today were engineered for. The goal:
            cut crude oil imports and vehicular emissions. The side effect:
            a compatibility gap for a large share of India&apos;s existing fleet.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScrollReveal delay={0.05}>
            <div className="glass-panel p-5 h-full">
              <Landmark className="text-accent2 mb-3" size={22} />
              <div className="font-medium mb-1">Government-driven rollout</div>
              <p className="text-sm text-zinc-400">
                Part of India&apos;s national ethanol-blending policy, aimed at
                energy security and lower emissions.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="glass-panel p-5 h-full">
              <Fuel className="text-warn mb-3" size={22} />
              <div className="font-medium mb-1">Nationwide at pumps</div>
              <p className="text-sm text-zinc-400">
                E20 is now the standard fuel at most stations — not an opt-in,
                which is exactly why compatibility matters.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.25}>
            <div className="glass-panel p-5 h-full">
              <Gauge className="text-safe mb-3" size={22} />
              <div className="font-medium mb-1">Built-in from 2023</div>
              <p className="text-sm text-zinc-400">
                BS6 Phase-2 vehicles (April 2023 onward) are engineered for
                E20 natively — older ones may not be.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ADVANTAGES / DISADVANTAGES */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <ScrollReveal>
          <SectionLabel>Weighing It Up</SectionLabel>
          <h2 className="text-3xl font-semibold mb-10">The tradeoffs, honestly</h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollReveal direction="left">
            <div className="glass-panel p-6 h-full border-safe/20">
              <div className="flex items-center gap-2 text-safe font-medium mb-4">
                <ThumbsUp size={18} /> Advantages
              </div>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li>Reduces crude oil import dependence</li>
                <li>Lower net carbon emissions per litre burned</li>
                <li>Supports domestic sugarcane/grain ethanol economy</li>
                <li>Newer engines see improved octane performance</li>
              </ul>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div className="glass-panel p-6 h-full border-warn/20">
              <div className="flex items-center gap-2 text-warn font-medium mb-4">
                <ThumbsDown size={18} /> Disadvantages
              </div>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li>Lower calorific value — reduced fuel efficiency in older engines</li>
                <li>Accelerated degradation of nitrile rubber components</li>
                <li>Higher moisture affinity can affect fuel system corrosion</li>
                <li>Retrofit or repair costs fall on the vehicle owner</li>
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ACTUAL DANGERS / AFFECTED PARTS */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <ScrollReveal>
          <SectionLabel>What Actually Gets Damaged</SectionLabel>
          <h2 className="text-3xl font-semibold mb-4">Component-level risk, explained</h2>
          <p className="text-zinc-400 max-w-2xl leading-relaxed mb-10">
            Per ARAI&apos;s published findings, ethanol exposure doesn&apos;t
            damage a vehicle uniformly — some parts are far more vulnerable
            than others. Here&apos;s what&apos;s actually at stake.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Droplets, color: "text-warn", title: "Rubber fuel lines", desc: "Nitrile rubber swells, cracks, and can leak under sustained ethanol exposure — the single most-cited risk." },
            { icon: Flame, color: "text-danger", title: "Carburettor seals", desc: "Older carburetted engines (pre-2020) are especially prone to gasket degradation and leaning-out." },
            { icon: Wrench, color: "text-accent", title: "Fuel injectors", desc: "Ethanol's solvent properties can loosen deposits, occasionally clogging injectors in high-mileage engines." },
            { icon: AlertTriangle, color: "text-accent2", title: "Metal tank corrosion", desc: "Slower than rubber degradation, but moisture-absorbing ethanol can accelerate rust in steel tanks over years." },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.08}>
              <div className="glass-panel p-5 h-full">
                <item.icon className={`${item.color} mb-3`} size={22} />
                <div className="font-medium mb-1">{item.title}</div>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* HOW AI SOLVES THIS */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="glass-panel p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
          <ScrollReveal>
            <div className="flex items-center gap-2 text-accent2 mb-4">
              <Cpu size={20} />
              <span className="text-xs uppercase tracking-widest">How E20-Shield helps</span>
            </div>
            <h2 className="text-3xl font-semibold mb-4">
              A trained model, not a guess
            </h2>
            <p className="text-zinc-400 max-w-2xl leading-relaxed mb-6">
              We pair a verified ARAI/manufacturer reference database with a
              trained regression model (SHAP-explained, confidence-scored) to
              estimate component wear risk — and a fallback rule engine so
              literally any vehicle gets an answer, even ones we&apos;ve never
              seen before.
            </p>
            <a
              href="/checker"
              className="inline-flex items-center gap-2 bg-accent hover:bg-indigo-500 shadow-glow transition-all px-6 py-3 rounded-lg font-medium"
            >
              Try the live checker <ArrowRight size={16} />
            </a>
          </ScrollReveal>
        </div>
      </div>

      {/* FEATURE GRID / CTA */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScrollReveal delay={0}>
            <div className="glass-panel p-5 hover:shadow-glow-green transition-shadow h-full">
              <ShieldCheck className="text-safe mb-2" size={20} />
              <div className="text-safe font-medium mb-1">Verified</div>
              <p className="text-sm text-zinc-400">
                Sourced from ARAI and manufacturer public data, with citations.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="glass-panel p-5 hover:shadow-glow transition-shadow h-full">
              <AlertTriangle className="text-warn mb-2" size={20} />
              <div className="text-warn font-medium mb-1">Estimated</div>
              <p className="text-sm text-zinc-400">
                No exact match yet? We estimate from your manufacturing year —
                never a dead end.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="glass-panel p-5 hover:shadow-glow-cyan transition-shadow h-full">
              <Cpu className="text-accent2 mb-2" size={20} />
              <div className="text-accent2 font-medium mb-1">Model prediction</div>
              <p className="text-sm text-zinc-400">
                Component wear risk with a confidence interval — an estimate,
                never a diagnosis.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
