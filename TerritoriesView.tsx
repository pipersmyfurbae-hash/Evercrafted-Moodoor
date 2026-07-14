import React from "react";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { TERRITORIES } from "../data/wreaths";

interface TerritoriesViewProps {
  setTab: (tab: string) => void;
}

export default function TerritoriesView({ setTab }: TerritoriesViewProps) {
  const [activatedFills, setActivatedFills] = React.useState(false);

  // Trigger animations after mount for visual loading transitions
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setActivatedFills(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-24 space-y-24">
      
      {/* Header segment */}
      <header className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ec-green bg-ec-green-pale px-3.5 py-1.5 rounded-full border border-ec-green-light/20">
          The library map
        </span>
        <h1 className="text-4xl md:text-6xl text-ec-black tracking-tight leading-tight">
          Six territories <em className="font-script text-ec-green text-3xl md:text-5xl font-normal block mt-2">of feeling</em>
        </h1>
        <p className="text-ec-ink font-serif text-lg leading-relaxed italic max-w-lg mx-auto">
          Every design in the library lives in one of six emotional territories, each with its own signature — a characteristic shape on the seven dimensions the matcher listens for.
        </p>
      </header>

      {/* Territories Loops */}
      <section className="space-y-12">
        {TERRITORIES.map((terr, idx) => {
          return (
            <article 
              key={terr.id}
              className="grid grid-cols-1 lg:grid-cols-[0.4fr,0.6fr] border border-ec-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              
              {/* Left visual column */}
              <div className={`relative h-64 lg:h-auto min-h-[220px] flex items-center justify-center p-8 ${terr.visualBgClass}`}>
                
                {/* Roman Numeral */}
                <div className="absolute top-6 left-6 font-serif text-6xl italic font-light text-ec-black/10 select-none">
                  {terr.numberRoman}
                </div>

                <div className="absolute bottom-6 right-6 font-mono text-[10px] text-ec-gray-500 font-semibold uppercase">
                  {terr.sampleWreaths.length + (terr.id === 4 ? " designs" : terr.id === 5 ? " designs" : " designs")}
                </div>

                {/* Drawn schematic symbol mapping to territory style */}
                <div className="scale-110">
                  {terr.id === 1 && (
                    <svg viewBox="0 0 100 100" fill="none" className="w-32 h-32 text-ec-green opacity-70">
                      <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="1.4" strokeDasharray="20 6 12 4"/>
                      <circle cx="34" cy="32" r="10" stroke="currentColor" strokeWidth="1.2"/>
                      <circle cx="70" cy="66" r="7" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  )}
                  {terr.id === 2 && (
                    <svg viewBox="0 0 100 100" fill="none" className="w-32 h-32 text-ec-warning opacity-70">
                      <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1.4" strokeDasharray="14 5"/>
                      <circle cx="62" cy="30" r="4" fill="currentColor"/>
                      <circle cx="72" cy="42" r="3" fill="currentColor"/>
                    </svg>
                  )}
                  {terr.id === 3 && (
                    <svg viewBox="0 0 100 100" fill="none" className="w-32 h-32 text-ec-charcoal opacity-70">
                      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1.3" strokeDasharray="26 8"/>
                      <path d="M50 24 C56 36 56 50 50 60 C44 50 44 36 50 24Z" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  )}
                  {terr.id === 4 && (
                    <svg viewBox="0 0 100 100" fill="none" className="w-32 h-32 text-ec-green-light opacity-70">
                      <path d="M30 72 C30 46 48 28 74 28" stroke="currentColor" strokeWidth="1.6"/>
                      <ellipse cx="46" cy="48" rx="8" ry="3.4" transform="rotate(-44 46 48)" fill="currentColor" opacity=".7"/>
                    </svg>
                  )}
                  {terr.id === 5 && (
                    <svg viewBox="0 0 100 100" fill="none" className="w-32 h-32 text-ec-info opacity-70">
                      <circle cx="40" cy="50" r="22" stroke="currentColor" strokeWidth="1.3"/>
                      <circle cx="62" cy="50" r="22" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                  )}
                  {terr.id === 6 && (
                    <svg viewBox="0 0 100 100" fill="none" className="w-32 h-32 text-ec-warning opacity-70">
                      <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1.2" strokeDasharray="10 4 22 6"/>
                      <circle cx="64" cy="68" r="3.4" fill="currentColor" opacity=".7"/>
                      <circle cx="56" cy="76" r="2.4" fill="currentColor" opacity=".6"/>
                    </svg>
                  )}
                </div>

              </div>

              {/* Right description details column */}
              <div className="p-8 md:p-12 space-y-6 flex flex-col justify-between">
                
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ec-green">
                    Territory {terr.numberRoman}
                  </span>
                  <h2 className="text-3xl text-ec-black tracking-tight">{terr.name}</h2>
                  <p className="font-serif text-[17px] text-ec-ink italic leading-tight">{terr.tagline}</p>
                  <p className="text-xs text-ec-ink leading-relaxed pt-2">{terr.description}</p>
                </div>

                {/* Interactive bar-chart signatures */}
                <div className="space-y-3 bg-ec-off-white/40 p-5 rounded-xl border border-ec-border">
                  <h5 className="text-[10px] uppercase font-bold text-ec-gray-500 tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-ec-green" /> Territory Signature Keys
                  </h5>
                  <div className="space-y-2.5">
                    {Object.entries(terr.signature).map(([sigKey, sigVal]) => {
                      return (
                        <div key={sigKey} className="text-xs">
                          <div className="flex justify-between text-ec-ink mb-1">
                            <span className="font-semibold text-ec-black capitalize">{sigKey}</span>
                            <span className="font-mono text-ec-green font-semibold">{(sigVal).toFixed(2)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-ec-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-ec-green-light to-ec-green rounded-full transition-all duration-1000"
                              style={{ width: activatedFills ? `${sigVal * 100}%` : "0%" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sample items row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-ec-gray-100 text-xs">
                  <span className="text-ec-gray-500 font-serif italic text-sm">
                    Designs: <b className="text-ec-black not-italic font-sans font-medium">{terr.sampleWreaths.join(" • ")}</b>
                  </span>
                  <button
                    onClick={() => setTab("signature")}
                    className="inline-flex items-center gap-1 font-semibold text-ec-green border-b border-ec-green hover:text-ec-black hover:border-ec-black transition-colors pb-0.5"
                  >
                    Browse Segment <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

              </div>

            </article>
          );
        })}
      </section>

      {/* Bottom explanation CTA block */}
      <section className="text-center max-w-xl mx-auto space-y-4 pt-12 border-t border-ec-border">
        <h2 className="text-3xl text-ec-black tracking-tight">
          Not sure where your memory lives?{" "}
          <em className="font-script text-ec-green text-3xl font-normal block sm:inline">That is the point.</em>
        </h2>
        <p className="text-xs text-ec-ink max-w-md mx-auto leading-relaxed">
          You never have to inspect coordinates or match profiles yourself — your written memory does it for you automatically.
        </p>
        <button
          onClick={() => setTab("home")}
          className="inline-block bg-ec-green hover:bg-ec-green-light text-white font-semibold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all hover:scale-103 active:scale-97"
        >
          Begin a memory now
        </button>
      </section>

    </div>
  );
}
