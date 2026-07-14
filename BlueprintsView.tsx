import React from "react";
import { WreathDesign } from "../types";
import { renderWreathSVG } from "./WreathDetailModal";
import { ArrowRight, Download, Info } from "lucide-react";

interface BlueprintsViewProps {
  wreaths: WreathDesign[];
  onSelectWreath: (wreath: WreathDesign) => void;
}

export default function BlueprintsView({ wreaths, onSelectWreath }: BlueprintsViewProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>("all");

  const categories = [
    { id: "all", label: "All blueprints" },
    { id: "1", label: "Comfort" },
    { id: "2", label: "Celebration" },
    { id: "3", label: "Remembrance" },
    { id: "4", label: "Renewal" },
    { id: "5", label: "Connection" },
    { id: "6", label: "Seasonal Nostalgia" }
  ];

  const filteredWreaths = activeCategory === "all"
    ? wreaths
    : wreaths.filter(w => w.territoryId.toString() === activeCategory);

  const deliverables = [
    { num: "01", title: "SVG layout map", desc: "The physical placement map drawn on a clock-position polar grid, to scale." },
    { num: "02", title: "Placement table", desc: "Every single stem's exact coordinate, angle, depth, and placement sequence." },
    { num: "03", title: "Layering build guide", desc: "Step-by-step layering order instructions, binding methods, and twig pruning guides." },
    { num: "04", title: "Shopping check-list", desc: "Stem lists mapped to findable real-world materials, with easy substitution options." },
    { num: "05", title: "Design story card", desc: "The design's backstory, emotional vector profile, and printable framing card." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-24">
      
      {/* Hero Header Segment */}
      <header className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
        <div className="space-y-6">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-ec-green bg-ec-green-pale px-3.5 py-1.5 rounded-full border border-ec-green-light/20">
            Digital blueprints
          </span>
          <h1 className="text-4xl md:text-6xl text-ec-black tracking-tight leading-tight">
            The exact recipe, <em className="font-script text-ec-green text-3xl md:text-5xl font-normal block mt-2">yours to build</em>
          </h1>
          <p className="text-ec-ink font-serif text-lg leading-relaxed italic max-w-lg">
            Every design in the library is also a downloadable blueprint — the same document our own builds follow. Not inspiration. Not a mood board. The recipe.
          </p>
          <div className="inline-block font-mono text-[11px] text-ec-green bg-white border border-ec-green-pale px-4.5 py-2 rounded-full shadow-sm">
            $29 – $49 • instant download • build at your own pace
          </div>
        </div>

        {/* Anatomical Diagram from provided mockups */}
        <div className="bg-white border border-ec-border rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-baseline border-b border-ec-gray-100 pb-3">
            <h4 className="font-serif text-lg text-ec-black">Anatomical Blueprint Map</h4>
            <span className="font-mono text-[10px] text-ec-gray-400">polar-grid.svg</span>
          </div>

          <svg viewBox="0 0 380 290" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect x="8" y="8" width="364" height="274" rx="10" fill="#FDFCFA" stroke="#E8E8E8"/>
            <circle cx="150" cy="140" r="92" stroke="#4A6741" strokeWidth="1.1" strokeDasharray="5 4"/>
            <circle cx="150" cy="140" r="92" stroke="#D0D0D0" strokeWidth=".5"/>
            <line x1="150" y1="44" x2="150" y2="236" stroke="#E8E8E8" strokeWidth=".7"/>
            <line x1="54" y1="140" x2="246" y2="140" stroke="#E8E8E8" strokeWidth=".7"/>
            <text x="146" y="38" fontFamily="DM Mono" fontSize="8" fill="#A8A8A8">12</text>
            <text x="252" y="143" fontFamily="DM Mono" fontSize="8" fill="#A8A8A8">3</text>
            <circle cx="104" cy="86" r="20" fill="#EEF2ED" stroke="#4A6741" strokeWidth="1.2"/>
            <text x="93" y="90" fontFamily="DM Mono" fontSize="8" fill="#4A6741">C1·×3</text>
            <circle cx="196" cy="196" r="13" fill="#EEF2ED" stroke="#6B8F67" strokeWidth="1.1"/>
            <text x="186" y="200" fontFamily="DM Mono" fontSize="7.5" fill="#4A6741">C2·×2</text>
            <path d="M88 72 C70 56 60 42 56 26" stroke="#6B8F67" strokeWidth="1.2"/>
            <path d="M150 48 A92 92 0 0 1 232 112" stroke="#C4922A" strokeWidth="1.6" strokeDasharray="3 4" opacity=".7"/>
            <text x="216" y="64" fontFamily="DM Mono" fontSize="7.5" fill="#C4922A">negative space</text>
            <g fontFamily="DM Mono" fontSize="8.5" fill="#787878">
              <text x="268" y="100">10:30 focal ×3</text>
              <text x="268" y="118">11:15 second ×2</text>
              <text x="268" y="136">9:45 cedar ×3</text>
              <text x="268" y="154">4:30 counter ×2</text>
              <text x="268" y="172">+ 13 more rows</text>
              <text x="268" y="206" fill="#4A6741">23 stems total</text>
              <text x="268" y="222" fill="#4A6741">18" grapevine</text>
            </g>
          </svg>
        </div>
      </header>

      {/* Delievables List Segment */}
      <section className="bg-ec-paper/30 p-8 md:p-12 rounded-2xl border border-ec-border space-y-12">
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-ec-green">
            Inside every download
          </span>
          <h2 className="text-3xl text-ec-black">Five documents. Zero guesswork.</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {deliverables.map((item, idx) => (
            <div key={idx} className="bg-white border border-ec-border p-6 rounded-xl hover:-translate-y-1 transition-all hover:shadow-md flex flex-col justify-between">
              <span className="font-mono text-xs text-ec-gray-400 font-semibold">{item.num}</span>
              <div className="mt-4 space-y-2">
                <h4 className="font-serif text-lg text-ec-black font-semibold leading-tight">{item.title}</h4>
                <p className="text-[11px] text-ec-ink leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blueprint catalog Grid */}
      <section className="space-y-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ec-green">
              The blueprint library
            </span>
            <h2 className="text-3xl text-ec-black">Browse buildable digital designs</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs font-semibold px-4 py-2.5 rounded-full border transition-all ${
                  activeCategory === cat.id
                    ? "bg-ec-green border-ec-green text-ec-off-white"
                    : "bg-white border-ec-border text-ec-ink hover:border-ec-green-light"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredWreaths.map((wreath) => (
            <div
              key={wreath.id}
              onClick={() => onSelectWreath(wreath)}
              className="bg-white border border-ec-border rounded-xl p-5 hover:border-ec-green-light hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
            >
              {/* Thumbnail representation */}
              <div className="h-28 flex items-center justify-center bg-ec-off-white border border-ec-gray-100 rounded-lg group-hover:scale-105 transition-transform duration-300">
                {renderWreathSVG(wreath.svgPath, "w-20 h-28 opacity-80")}
              </div>

              <div className="mt-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-ec-green">
                    {wreath.territoryName}
                  </span>
                  <h3 className="font-serif text-xl text-ec-black leading-tight group-hover:text-ec-green transition-colors">
                    {wreath.name}
                  </h3>
                  <p className="font-mono text-[9px] text-ec-gray-500">
                    {wreath.id} • {wreath.totalStems} stems • {wreath.size.replace(" grapevine", "")}
                  </p>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-ec-gray-100">
                  <span className="text-xl font-serif text-ec-green font-semibold">
                    ${wreath.priceBlueprint}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ec-ink flex items-center gap-0.5">
                    Acquire <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
