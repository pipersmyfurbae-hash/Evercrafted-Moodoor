import React, { useRef } from "react";
import { Sparkles, CalendarRange, Info, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { WreathDesign, Territory } from "../types";
import { renderWreathSVG } from "./WreathDetailModal";

interface WreathsViewProps {
  wreaths: WreathDesign[];
  territories: Territory[];
  onSelectWreath: (wreath: WreathDesign) => void;
  onBeginMemory: () => void;
}

interface WreathCardProps {
  wreath: WreathDesign;
  onSelectWreath: (w: WreathDesign) => void;
  key?: React.Key;
}

function WreathCard({ wreath, onSelectWreath }: WreathCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Track the scroll position of the individual card relative to the viewport
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Create a subtle parallax shift (from -15px to 15px) as the card moves through the viewport
  const y = useTransform(scrollYProgress, [0, 1], [-15, 15]);

  const hasStock = wreath.remainingFinished > 0;

  return (
    <div
      ref={cardRef}
      onClick={() => onSelectWreath(wreath)}
      className="bg-white border border-ec-border rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between cursor-pointer group"
    >
      {/* Product Card visual container with gradient territories background */}
      <div className={`relative h-60 flex items-center justify-center p-6 overflow-hidden ${
        wreath.territoryId === 1 ? "bg-gradient-to-br from-ec-green-pale/40 to-ec-off-white" :
        wreath.territoryId === 2 ? "bg-gradient-to-br from-[#F5EAD4]/30 to-ec-off-white" :
        wreath.territoryId === 3 ? "bg-gradient-to-br from-white to-[#F2EFE9]" :
        wreath.territoryId === 4 ? "bg-gradient-to-br from-ec-green-pale/60 to-white" :
        wreath.territoryId === 5 ? "bg-gradient-to-br from-[#E2E8F0]/40 to-ec-off-white" :
        "bg-gradient-to-br from-ec-paper to-[rgba(196,146,42,0.13)]"
      }`}>
        {/* Stock alert badges */}
        <div className="absolute top-4 right-4 z-10">
          {hasStock ? (
            <span className={`text-[10px] font-mono px-3 py-1 rounded-full bg-white border ${
              wreath.remainingFinished <= 2 
                ? "border-ec-warning text-ec-warning font-semibold bg-ec-warning/5 animate-pulse" 
                : "border-ec-border text-ec-gray-500"
            }`}>
              {wreath.remainingFinished} of 5 remaining
            </span>
          ) : (
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-ec-gray-100 border border-ec-gray-200 text-ec-gray-400">
              Rests • sold through
            </span>
          )}
        </div>

        {/* SVG vector wreath icon with dynamic parallax scroll translation */}
        <motion.div 
          style={{ y }}
          className="group-hover:rotate-6 group-hover:scale-105 transition-transform duration-500 will-change-transform"
        >
          {renderWreathSVG(wreath.svgPath, "w-36 h-36 drop-shadow-md")}
        </motion.div>
      </div>

      {/* Product specs description */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ec-green">
            {wreath.territoryName}
          </span>
          <h3 className="font-serif text-2xl text-ec-black leading-tight group-hover:text-ec-green transition-colors">
            {wreath.name}
          </h3>
          <p className="text-xs text-ec-ink italic font-serif text-[14.5px]">
            {wreath.tagline}
          </p>
        </div>

        <div className="flex justify-between items-baseline pt-4 border-t border-ec-gray-100">
          <span className="text-2xl font-serif text-ec-green font-semibold">
            ${wreath.priceFinished}
          </span>
          <span className="text-[11px] font-semibold text-ec-gray-500 uppercase tracking-wider flex items-center gap-0.5">
            View Ledger <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

    </div>
  );
}

export default function WreathsView({ wreaths, territories, onSelectWreath, onBeginMemory }: WreathsViewProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>("all");

  const categories = [
    { id: "all", label: "All ten" },
    { id: "1", label: "Comfort" },
    { id: "2", label: "Celebration" },
    { id: "3", label: "Remembrance" },
    { id: "4", label: "Renewal" },
    { id: "5", label: "Connection" },
    { id: "6", label: "Seasonal Nostalgia" }
  ];

  // Filter wreaths
  const filteredWreaths = activeCategory === "all"
    ? wreaths
    : wreaths.filter(w => w.territoryId.toString() === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-16">
      
      {/* Header */}
      <header className="space-y-6 max-w-2xl relative">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ec-green bg-ec-green-pale px-3.5 py-1.5 rounded-full border border-ec-green-light/20">
          Signature wreaths
        </span>
        <h1 className="text-4xl md:text-6xl text-ec-black tracking-tight leading-tight">
          Built by hand, <em className="font-script text-ec-green text-3xl md:text-5xl font-normal block mt-2">in small numbers</em>
        </h1>
        <p className="text-ec-ink font-serif text-lg leading-relaxed italic max-w-lg">
          Ten designs at a time, each built 1:1 to its scored blueprint — exposed grapevine, premium silk botanicals, and the negative space the design earned its place with.
        </p>

        {/* Small run alert box */}
        <div className="flex gap-4 items-center bg-white border border-ec-border rounded-xl p-5 max-w-2xl shadow-sm">
          <CalendarRange className="w-6 h-6 text-ec-warning flex-shrink-0" />
          <p className="text-xs text-ec-ink leading-relaxed font-sans">
            <b>Numbered runs of five.</b> When a run sells through, the design rests until its next season — the library moves on, and so do we.
          </p>
        </div>
      </header>

      {/* Interactive Category Filter bar */}
      <div className="flex flex-wrap gap-2 border-b border-ec-border pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`text-xs font-semibold px-4.5 py-2.5 rounded-full border transition-all ${
              activeCategory === cat.id
                ? "bg-ec-green border-ec-green text-ec-off-white"
                : "bg-white border-ec-border text-ec-ink hover:border-ec-green-light hover:text-ec-green"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredWreaths.map((wreath) => (
          <WreathCard
            key={wreath.id}
            wreath={wreath}
            onSelectWreath={onSelectWreath}
          />
        ))}
      </div>

      {/* No Wreaths found state */}
      {filteredWreaths.length === 0 && (
        <div className="text-center py-16 bg-white border border-ec-border rounded-2xl">
          <p className="text-sm font-serif italic text-ec-ink">
            No designs matching this segment are currently registered on the shelves.
          </p>
        </div>
      )}

      {/* Memory Intake CTA block */}
      <section className="bg-ec-paper/35 border border-ec-border rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto space-y-4">
        <h2 className="text-3xl text-ec-black tracking-tight">
          Or let a memory <em className="font-script text-ec-green text-3xl font-normal block sm:inline">choose for you</em>
        </h2>
        <p className="text-xs text-ec-ink max-w-lg mx-auto leading-relaxed">
          Every design here carries an emotional profile. Tell us the memory, and our server EVS coordinates will show you which one matches your story.
        </p>
        <button
          onClick={onBeginMemory}
          className="inline-block bg-ec-green hover:bg-ec-green-light text-white font-semibold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all hover:scale-103 active:scale-97"
        >
          Begin a memory
        </button>
      </section>

    </div>
  );
}
