import React from "react";
import { ArrowRight, Sparkles, Tag, Check, Award } from "lucide-react";
import { BUNDLES, BundleCollection } from "../data/wreaths";
import { WreathDesign } from "../types";
import { renderWreathSVG } from "./WreathDetailModal";

interface BundlesViewProps {
  onSelectWreath: (wreath: WreathDesign) => void;
}

export default function BundlesView({ onSelectWreath }: BundlesViewProps) {
  const [successBundle, setSuccessBundle] = React.useState<BundleCollection | null>(null);
  const [email, setEmail] = React.useState("");

  const handleAcquireBundle = (bundle: BundleCollection) => {
    setSuccessBundle(bundle);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-24">
      
      {/* Header segment */}
      <header className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ec-green bg-ec-green-pale px-3.5 py-1.5 rounded-full border border-ec-green-light/20">
          Collection bundles
        </span>
        <h1 className="text-4xl md:text-6xl text-ec-black tracking-tight leading-tight">
          Three designs that <em className="font-script text-ec-green text-3xl md:text-5xl font-normal block mt-2">belong together</em>
        </h1>
        <p className="text-ec-ink font-serif text-lg leading-relaxed italic max-w-lg mx-auto">
          Blueprint sets curated around a single emotional thread — shared palette, shared movement, three distinct silhouettes. One story, told three ways through a home.
        </p>
      </header>

      {/* Success Dialog overlay */}
      {successBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-ec-charcoal/40 backdrop-blur-sm" onClick={() => setSuccessBundle(null)} />
          <div className="relative bg-ec-off-white border border-ec-border p-8 rounded-2xl shadow-2xl max-w-md text-center space-y-6 z-10 animate-scale-up">
            <div className="w-16 h-16 bg-ec-green-pale border border-ec-green-light text-ec-green rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-serif text-2xl text-ec-black italic">Collection Registered</h3>
            <p className="text-xs text-ec-ink leading-relaxed">
              We have compiled the digital files for the <b>{successBundle.name}</b> (3 complete SVG blueprints, 3 full materials lists, and polar grid layering guides). Your recipe keys have been sent to your confirmation log.
            </p>
            <button
              onClick={() => setSuccessBundle(null)}
              className="bg-ec-green hover:bg-ec-green-light text-white font-semibold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all"
            >
              Back to collections
            </button>
          </div>
        </div>
      )}

      {/* Bundles Loop */}
      <section className="space-y-16">
        {BUNDLES.map((bundle, idx) => {
          return (
            <article 
              key={bundle.id}
              className="grid grid-cols-1 lg:grid-cols-[1fr,1fr] gap-12 items-center bg-white border border-ec-border rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden"
            >
              
              {/* Left Side: Visual representing 3 overlapping cards with their custom SVGs */}
              <div className={`relative h-80 rounded-2xl border border-ec-border flex items-center justify-center overflow-hidden bg-gradient-to-tr ${bundle.accentGradient}`}>
                
                {/* Floating Tags */}
                <span className="absolute top-4 left-4 font-mono text-[11px] bg-white border border-ec-green-pale px-3 py-1.5 rounded-full shadow-md text-ec-green font-semibold">
                  ${bundle.price} • 3 blueprints
                </span>

                <span className="absolute top-4 right-4 font-mono text-[10px] bg-ec-warning/10 border border-ec-warning/20 text-ec-warning px-3 py-1.5 rounded-full font-semibold">
                  Save ${bundle.savings} vs. single
                </span>

                {/* overlapping trio block */}
                <div className="flex items-center relative scale-105 sm:scale-110">
                  {bundle.designs.map((design, dIdx) => (
                    <div
                      key={design.id}
                      onClick={() => onSelectWreath(design)}
                      className={`w-32 h-44 bg-white border border-ec-border rounded-xl shadow-md p-4 flex flex-col justify-between items-center transition-all cursor-pointer hover:border-ec-green hover:-translate-y-2 select-none ${
                        dIdx === 0 ? "rotate-[-6deg] translate-x-5 z-10" :
                        dIdx === 2 ? "rotate-[6deg] -translate-x-5 z-10" :
                        "-translate-y-3 z-20 scale-103"
                      }`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        {renderWreathSVG(design.svgPath, "w-10 h-10")}
                      </div>
                      <span className="font-serif italic text-xs text-center text-ec-ink leading-tight">
                        {design.name}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Right Side: Copy & specs list */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ec-green">
                    {bundle.territoryName}
                  </span>
                  <h2 className="text-3xl md:text-4xl text-ec-black tracking-tight leading-tight">
                    {bundle.name}
                  </h2>
                  <p className="font-serif text-lg text-ec-ink italic">
                    {bundle.tagline}
                  </p>
                </div>

                <p className="text-xs text-ec-ink leading-relaxed">
                  {bundle.description}
                </p>

                <ul className="grid gap-2 border-t border-b border-ec-gray-100 py-4">
                  {bundle.designs.map((design, dIdx) => (
                    <li 
                      key={design.id}
                      onClick={() => onSelectWreath(design)}
                      className="flex justify-between items-center text-xs text-ec-ink hover:text-ec-green cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-0.5 bg-ec-green-light" />
                        <b>{design.name}</b> • {design.size.replace(" grapevine", "")} anchor
                      </span>
                      <span className="font-mono text-ec-gray-400">Blueprint {dIdx + 1}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono text-ec-gray-400 uppercase">Interactive Bundle Package</span>
                    <div className="text-2xl font-serif text-ec-green font-semibold">
                      ${bundle.price}{" "}
                      <span className="text-xs text-ec-gray-500 font-sans font-normal line-through">
                        ${bundle.price + bundle.savings}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcquireBundle(bundle)}
                    className="bg-ec-green hover:bg-ec-green-light text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-103 active:scale-97"
                  >
                    Acquire Bundle <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </article>
          );
        })}
      </section>

      {/* Why Bundles Editorial block */}
      <section className="bg-ec-paper/30 p-8 md:p-12 rounded-2xl border border-ec-border grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-ec-green">
            Why collections
          </span>
          <h2 className="text-3xl text-ec-black leading-tight">
            One feeling shouldn't stop <em className="font-script text-ec-green text-2xl font-normal block sm:inline">at the front door</em>
          </h2>
          <p className="text-xs text-ec-ink leading-relaxed">
            A collection carries a single emotional thread through a home — same palette family, same movement language, three silhouettes that talk to each other across rooms.
          </p>
        </div>

        <ul className="grid gap-3">
          <li className="flex gap-3 text-xs text-ec-ink items-start">
            <Check className="w-4 h-4 text-ec-green flex-shrink-0" />
            <span>Designed as a family: shared palette, distinct compositions.</span>
          </li>
          <li className="flex gap-3 text-xs text-ec-ink items-start">
            <Check className="w-4 h-4 text-ec-green flex-shrink-0" />
            <span>One consolidated shopping list across all three builds.</span>
          </li>
          <li className="flex gap-3 text-xs text-ec-ink items-start">
            <Check className="w-4 h-4 text-ec-green flex-shrink-0" />
            <span>Styling guide for door, mantel, and interior wall placement.</span>
          </li>
          <li className="flex gap-3 text-xs text-ec-ink items-start">
            <Check className="w-4 h-4 text-ec-green flex-shrink-0" />
            <span>Always cheaper than buying the three blueprints separately.</span>
          </li>
        </ul>
      </section>

    </div>
  );
}
