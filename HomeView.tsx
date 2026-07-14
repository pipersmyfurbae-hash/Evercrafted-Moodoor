import React from "react";
import { Sparkles, HelpCircle, ArrowRight, CornerDownRight, Landmark, Trash2 } from "lucide-react";
import { WreathDesign, EVSVector } from "../types";
import { renderWreathSVG } from "./WreathDetailModal";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { 
  saveMemoryToFirestore, 
  getMemoriesFromFirestore, 
  deleteMemoryFromFirestore, 
  SavedMemoryEntry 
} from "../lib/dbService";

// Calculate vector distance (Euclidean) and map to a 0-100 similarity score
function calculateSimilarity(v1: EVSVector, v2: EVSVector): number {
  const diffs = [
    (v1.warmth ?? 0) - (v2.warmth ?? 0),
    (v1.energy ?? 0) - (v2.energy ?? 0),
    (v1.nostalgia ?? 0) - (v2.nostalgia ?? 0),
    (v1.valence ?? 0) - (v2.valence ?? 0),
    (v1.intimacy ?? 0) - (v2.intimacy ?? 0),
    (v1.restraint ?? 0) - (v2.restraint ?? 0),
    (v1.seasonal ?? 0) - (v2.seasonal ?? 0)
  ];
  const distance = Math.sqrt(diffs.reduce((sum, d) => sum + d * d, 0));
  const maxDistance = Math.sqrt(7); // Max Euclidean distance in a 7-dimensional unit cube
  return Math.round((1 - distance / maxDistance) * 100);
}

interface HomeViewProps {
  onSelectWreath: (wreath: WreathDesign) => void;
  setTab: (tab: string) => void;
  wreaths: WreathDesign[];
}

interface MatchResult {
  id: string;
  score: number;
  explanation: string;
}

export default function HomeView({ onSelectWreath, setTab, wreaths }: HomeViewProps) {
  const { user } = useAuth();
  const [memory, setMemory] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<{
    interpretedVector: any;
    explanation: string;
    matches: MatchResult[];
    isFallback?: boolean;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [loadingStep, setLoadingStep] = React.useState(0);
  const [pastMemories, setPastMemories] = React.useState<SavedMemoryEntry[]>([]);

  // Load memories from Firestore (for logged in users) or localStorage (for guests)
  React.useEffect(() => {
    async function loadMemories() {
      if (user && !user.isGuest) {
        try {
          const fetched = await getMemoriesFromFirestore(user.uid);
          setPastMemories(fetched);
        } catch (err) {
          console.error("Error loading memories from Firestore:", err);
          loadLocalMemories();
        }
      } else {
        loadLocalMemories();
      }
    }

    function loadLocalMemories() {
      try {
        const stored = localStorage.getItem("moodoor_local_memories");
        if (stored) {
          setPastMemories(JSON.parse(stored));
        } else {
          // Initialize with some beautiful pre-populated sample entries so the radar chart is filled and beautiful by default!
          const sampleMemories: SavedMemoryEntry[] = [
            {
              id: "sample-1",
              userId: "guest",
              memory: "Sunday mornings at my grandmother's lake house — cedarwood logs, cold coffee, and a gentle mist on the lake.",
              interpretedVector: { warmth: 0.82, energy: 0.25, nostalgia: 0.91, valence: 0.75, intimacy: 0.88, restraint: 0.64, seasonal: 0.60 },
              explanation: "Your memory evokes deep serenity and tender quietude, blending comforting cedarwood warmth with the mist's gentle composure.",
              createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
            },
            {
              id: "sample-2",
              userId: "guest",
              memory: "Mom's backyard rose garden after a spring rain, crisp air and damp soil.",
              interpretedVector: { warmth: 0.70, energy: 0.40, nostalgia: 0.80, valence: 0.85, intimacy: 0.65, restraint: 0.50, seasonal: 0.45 },
              explanation: "A bright, life-affirming recollection of natural renewal and delicate sensory blooms, carrying a sweet, rain-washed freshness.",
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ];
          setPastMemories(sampleMemories);
          localStorage.setItem("moodoor_local_memories", JSON.stringify(sampleMemories));
        }
      } catch (err) {
        console.error("Local storage error", err);
      }
    }

    loadMemories();
  }, [user]);

  const sampleChips = [
    "Sunday mornings at my grandmother's lake house",
    "The year we packed up and finally came home",
    "Mom's backyard rose garden after a spring rain"
  ];

  // Rotate loading sub-messages for highly-polished user experience
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 700);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Receiving memory brief...",
    "Interpreting sentiment vector variables...",
    "Calculating vector alignment on polar polar-grid...",
    "Deterministic geometry matching complete..."
  ];

  const saveEntryLocally = (entry: SavedMemoryEntry) => {
    setPastMemories((prev) => {
      const updated = [entry, ...prev];
      try {
        localStorage.setItem("moodoor_local_memories", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save local memory", err);
      }
      return updated;
    });
  };

  const handleMatchSubmit = async () => {
    if (!memory.trim()) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memory })
      });

      if (!res.ok) {
        throw new Error("Unable to complete matching session.");
      }

      const data = await res.json();
      setResults(data);

      // Save memory to archive
      const newEntry: SavedMemoryEntry = {
        id: "",
        userId: user ? user.uid : "guest",
        memory: memory,
        interpretedVector: data.interpretedVector,
        explanation: data.explanation,
        createdAt: new Date().toISOString()
      };

      if (user && !user.isGuest) {
        try {
          const docId = await saveMemoryToFirestore(user.uid, memory, data.interpretedVector, data.explanation);
          newEntry.id = docId;
          setPastMemories((prev) => [newEntry, ...prev]);
        } catch (dbErr) {
          console.error("Could not save memory to Firestore:", dbErr);
          newEntry.id = `local_${Math.random().toString(36).substring(2, 9)}`;
          saveEntryLocally(newEntry);
        }
      } else {
        newEntry.id = `local_${Math.random().toString(36).substring(2, 9)}`;
        saveEntryLocally(newEntry);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during EVS alignment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    setPastMemories((prev) => prev.filter((m) => m.id !== id));
    
    if (user && !user.isGuest && !id.startsWith("local_") && !id.startsWith("sample-")) {
      try {
        await deleteMemoryFromFirestore(id);
      } catch (err) {
        console.error("Failed to delete memory from Firestore:", err);
      }
    } else {
      try {
        const stored = localStorage.getItem("moodoor_local_memories");
        if (stored) {
          const parsed = JSON.parse(stored) as SavedMemoryEntry[];
          const filtered = parsed.filter((m) => m.id !== id);
          localStorage.setItem("moodoor_local_memories", JSON.stringify(filtered));
        }
      } catch (err) {
        console.error("Failed to update local storage:", err);
      }
    }
  };

  const chartData = React.useMemo(() => {
    if (pastMemories.length === 0) {
      return [
        { subject: "Warmth", value: 0 },
        { subject: "Nostalgia", value: 0 },
        { subject: "Valence", value: 0 },
        { subject: "Energy", value: 0 },
        { subject: "Intimacy", value: 0 },
        { subject: "Restraint", value: 0 },
        { subject: "Seasonal", value: 0 }
      ];
    }

    const sums = {
      warmth: 0,
      nostalgia: 0,
      valence: 0,
      energy: 0,
      intimacy: 0,
      restraint: 0,
      seasonal: 0
    };

    pastMemories.forEach((m) => {
      sums.warmth += m.interpretedVector.warmth ?? 0;
      sums.nostalgia += m.interpretedVector.nostalgia ?? 0;
      sums.valence += m.interpretedVector.valence ?? 0;
      sums.energy += m.interpretedVector.energy ?? 0;
      sums.intimacy += m.interpretedVector.intimacy ?? 0;
      sums.restraint += m.interpretedVector.restraint ?? 0;
      sums.seasonal += m.interpretedVector.seasonal ?? 0;
    });

    const count = pastMemories.length;
    return [
      { subject: "Warmth", value: Math.round((sums.warmth / count) * 100) },
      { subject: "Nostalgia", value: Math.round((sums.nostalgia / count) * 100) },
      { subject: "Valence", value: Math.round((sums.valence / count) * 100) },
      { subject: "Energy", value: Math.round((sums.energy / count) * 100) },
      { subject: "Intimacy", value: Math.round((sums.intimacy / count) * 100) },
      { subject: "Restraint", value: Math.round((sums.restraint / count) * 100) },
      { subject: "Seasonal", value: Math.round((sums.seasonal / count) * 100) }
    ];
  }, [pastMemories]);

  return (
    <div className="space-y-24 pb-20">
      
      {/* 01: HERO INTAKE AREA */}
      <section className="relative min-h-[85vh] flex items-center pt-24">
        {/* Ambient radial gradients */}
        <div className="absolute top-0 right-0 w-[50%] h-[60%] bg-gradient-to-bl from-ec-green-pale/50 to-transparent pointer-events-none rounded-full blur-3xl z-0" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[50%] bg-gradient-to-tr from-ec-paper/40 to-transparent pointer-events-none rounded-full blur-3xl z-0" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-16 items-center relative z-10">
          
          <div className="space-y-8">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.15em] text-ec-green px-4 py-1.5 bg-ec-green-pale rounded-full border border-ec-green-light/20">
              A new way to choose a wreath
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-ec-black leading-[1.1] tracking-tight">
              Tell us the <em className="italic text-ec-green font-normal">memory.</em>
              <br />
              We'll show the wreath that holds it.
            </h1>
            <p className="text-ec-ink max-w-lg leading-relaxed text-[16.5px] font-serif italic text-lg">
              Moodoor reads the feeling inside your memory and matches it to a curated collection of sixty blueprint-backed faux botanical wreaths — each designed, scored, and built to carry a specific emotion.
            </p>

            {/* Core Intake Card */}
            <div className="bg-white border border-ec-gray-200 focus-within:border-ec-green-light rounded-2xl shadow-lg p-6 max-w-xl transition-all focus-within:ring-4 focus-within:ring-ec-green-dim space-y-4">
              <label htmlFor="memoryInput" className="block text-[11px] font-semibold uppercase tracking-widest text-ec-gray-500">
                Your memory brief
              </label>
              <textarea
                id="memoryInput"
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
                placeholder="My grandmother's porch in late September — cedar, cold coffee, and the screen door that never quite closed…"
                className="w-full min-h-[100px] border-none outline-none resize-none bg-transparent font-serif italic text-xl text-ec-black leading-relaxed"
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-ec-gray-100">
                <span className="text-xs text-ec-gray-500 font-sans">
                  A sentence is enough. A paragraph is better.
                </span>
                <button
                  onClick={handleMatchSubmit}
                  disabled={loading || !memory.trim()}
                  className="btn-match self-end sm:self-auto bg-ec-green hover:bg-ec-green-light text-white font-semibold px-6 py-3 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-103 active:scale-97 disabled:opacity-50"
                >
                  {loading ? "Matching..." : "Find my wreath"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Memory example chips */}
            <div className="space-y-2 max-w-xl">
              <span className="text-[10px] font-mono uppercase text-ec-gray-500 tracking-wider">Tap a template to begin:</span>
              <div className="flex flex-wrap gap-2">
                {sampleChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMemory(chip);
                    }}
                    className="text-xs text-ec-ink bg-white border border-ec-border hover:border-ec-green-light hover:text-ec-green px-3.5 py-2 rounded-full transition-all hover:bg-ec-green-pale/30 active:scale-97 text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Match output display */}
            <div className="max-w-xl">
              {loading && (
                <div className="flex items-center gap-3 font-serif italic text-ec-ink text-base p-4 bg-white/50 border border-ec-border rounded-xl">
                  <span className="w-3.5 h-3.5 bg-ec-green-light rounded-full animate-ping" />
                  <span>{loadingMessages[loadingStep]}</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-ec-error p-4 rounded-xl text-sm leading-relaxed">
                  {error}
                </div>
              )}

              {results && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-serif text-2xl text-ec-black italic">Your matches</h3>
                    {results.isFallback && (
                      <span className="text-[9px] font-mono bg-ec-warning/10 border border-ec-warning/30 text-ec-warning px-2 py-0.5 rounded-full">
                        Local Mode Active
                      </span>
                    )}
                  </div>
                  
                  {/* Empirical Gemini Explanation */}
                  <div className="p-5 bg-ec-green-pale/40 border border-ec-green-light/20 rounded-xl">
                    <p className="text-xs text-ec-ink leading-relaxed font-serif italic text-[14.5px]">
                      &ldquo;{results.explanation}&rdquo;
                    </p>
                  </div>

                  {/* Emotional DNA / Sentiment Profile */}
                  <div className="p-5 bg-white border border-ec-border rounded-xl space-y-4 shadow-sm animate-scale-up">
                    <div className="flex items-center justify-between border-b border-ec-gray-100 pb-2">
                      <h4 className="font-serif text-sm font-semibold text-ec-black flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-ec-green" /> Memory Sentiment Profile
                      </h4>
                      <span className="text-[9px] font-mono bg-ec-green-pale text-ec-green px-2 py-0.5 rounded-full uppercase font-bold">
                        EVS Coordinates
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {[
                        { key: "warmth", label: "Warmth", desc: "Tenderness & comfort", color: "bg-[#C4922A]" },
                        { key: "nostalgia", label: "Nostalgia", desc: "Memory depth & longing", color: "bg-[#4A6741]" },
                        { key: "valence", label: "Valence", desc: "Brightness vs. solemnity", color: "bg-[#6B8F67]" },
                        { key: "energy", label: "Energy", desc: "Activity vs. stillness", color: "bg-[#B94040]" },
                        { key: "intimacy", label: "Intimacy", desc: "Privacy vs. companion", color: "bg-[#4A6785]" },
                        { key: "restraint", label: "Restraint", desc: "Composure vs. volume", color: "bg-[#787878]" },
                        { key: "seasonal", label: "Seasonal", desc: "Time of year affinity", color: "bg-[#8A7458]" }
                      ].map((metric) => {
                        const val = results.interpretedVector[metric.key as keyof typeof results.interpretedVector] ?? 0;
                        const pct = Math.round(val * 100);
                        return (
                          <div key={metric.key} className="space-y-1">
                            <div className="flex justify-between items-baseline text-[11px]">
                              <div>
                                <span className="font-medium text-ec-black">{metric.label}</span>
                                <span className="text-[9px] text-ec-gray-400 ml-1">({metric.desc})</span>
                              </div>
                              <span className="font-mono text-ec-green font-semibold text-[10px]">{pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-ec-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${metric.color} rounded-full transition-all duration-1000`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {results.matches.map((match) => {
                      const design = wreaths.find(w => w.id === match.id);
                      if (!design) return null;
                      return (
                        <div
                          key={match.id}
                          onClick={() => onSelectWreath(design)}
                          className="group grid grid-cols-[auto,1fr,auto] gap-4 items-center bg-white border border-ec-border hover:border-ec-green-light hover:shadow-md p-4 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
                        >
                          <div className="w-12 h-12 bg-ec-off-white border border-ec-gray-100 rounded-full flex items-center justify-center group-hover:rotate-6 transition-transform">
                            {renderWreathSVG(design.svgPath, "w-9 h-9")}
                          </div>
                          <div>
                            <h4 className="font-serif text-[18px] text-ec-black leading-tight">
                              {design.name}
                            </h4>
                            <span className="text-[11px] font-sans text-ec-gray-500">
                              <b>{design.territoryName}</b> • {design.size} • {design.totalStems} stems
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-ec-green bg-ec-green-pale px-3 py-1 rounded-full border border-ec-green-light/20 font-semibold group-hover:scale-105 transition-transform">
                            {match.score}% match
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] font-mono text-ec-gray-500 text-center">
                    Similarity calculated deterministically on polar geometry coordinates.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right side: large graphical representation of a gorgeous asymmetric wreath */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <svg viewBox="0 0 460 460" fill="none" className="w-96 h-96 md:w-[420px] md:h-[420px] drop-shadow-2xl">
                {/* grapevine ring layers */}
                <circle cx="230" cy="230" r="158" stroke="#A8916F" strokeWidth="2.5" opacity="0.55" strokeDasharray="22 7 14 5"/>
                <circle cx="226" cy="234" r="152" stroke="#8A7458" strokeWidth="2" opacity="0.5" strokeDasharray="30 6 10 8"/>
                <circle cx="234" cy="227" r="163" stroke="#B89F7E" strokeWidth="1.5" opacity="0.45" strokeDasharray="18 9 26 4"/>
                
                {/* 10:30 core flower cluster */}
                <g transform="translate(112,122)">
                  <circle r="34" fill="#F2EFE9" stroke="#4A6741" strokeWidth="1.5"/>
                  <g stroke="#4A6741" strokeWidth="1.2" opacity="0.7">
                    <path d="M0,-22 C8,-12 8,12 0,22 C-8,12 -8,-12 0,-22Z"/>
                    <path d="M-19,-11 C-7,-7 7,7 19,11" />
                    <path d="M-19,11 C-7,7 7,-7 19,-11" />
                  </g>
                  <circle cx="44" cy="22" r="22" fill="#EEF2ED" stroke="#6B8F67" strokeWidth="1.4"/>
                  <circle cx="-26" cy="38" r="17" fill="#F9F7F4" stroke="#4A6741" strokeWidth="1.3"/>
                  <circle cx="18" cy="-40" r="13" fill="#EEF2ED" stroke="#6B8F67" strokeWidth="1.2"/>
                </g>

                {/* 4:30 balancing cluster */}
                <g transform="translate(328,328)">
                  <circle r="24" fill="#EEF2ED" stroke="#4A6741" strokeWidth="1.4"/>
                  <circle cx="-32" cy="14" r="14" fill="#F9F7F4" stroke="#6B8F67" strokeWidth="1.2"/>
                  <circle cx="22" cy="-26" r="11" fill="#F2EFE9" stroke="#4A6741" strokeWidth="1.1"/>
                </g>

                {/* Sweeping foliage and stems */}
                <g stroke="#6B8F67" strokeWidth="1.6" fill="none" opacity="0.85">
                  <path d="M86,96 C52,70 34,48 30,22"/>
                  <path d="M86,96 C60,84 44,66 40,44" strokeWidth="1.2"/>
                  <path d="M150,176 C190,206 222,218 262,216" strokeWidth="1.2" opacity="0.55"/>
                  <path d="M356,352 C386,376 402,398 406,424"/>
                  <path d="M356,352 C378,362 392,378 398,398" strokeWidth="1.2"/>
                </g>
                <g fill="#6B8F67" opacity="0.7">
                  <ellipse cx="44" cy="50" rx="9" ry="4" transform="rotate(-52 44 50)"/>
                  <ellipse cx="58" cy="72" rx="8" ry="3.6" transform="rotate(-40 58 72)"/>
                  <ellipse cx="388" cy="392" rx="9" ry="4" transform="rotate(48 388 392)"/>
                  <ellipse cx="374" cy="372" rx="8" ry="3.6" transform="rotate(38 374 372)"/>
                </g>
                <g fill="#C4922A" opacity="0.8">
                  <circle cx="178" cy="92" r="4"/><circle cx="190" cy="102" r="3"/><circle cx="170" cy="106" r="3"/>
                  <circle cx="296" cy="364" r="3.5"/><circle cx="306" cy="354" r="2.6"/>
                </g>
              </svg>
              
              {/* Polar coordinate floating tags */}
              <div className="absolute top-8 left-4 font-mono text-[11px] bg-white border border-ec-green-pale px-3 py-1.5 rounded-full shadow-md text-ec-green animate-bounce-slow">
                warmth {results ? results.interpretedVector.warmth.toFixed(2) : "0.82"}
              </div>
              <div className="absolute bottom-20 right-0 font-mono text-[11px] bg-white border border-ec-green-pale px-3 py-1.5 rounded-full shadow-md text-ec-green animate-bounce-slow" style={{ animationDelay: "1s" }}>
                nostalgia {results ? results.interpretedVector.nostalgia.toFixed(2) : "0.91"}
              </div>
              <div className="absolute bottom-2 left-16 font-mono text-[11px] bg-white border border-ec-green-pale px-3 py-1.5 rounded-full shadow-md text-ec-green animate-bounce-slow" style={{ animationDelay: "2s" }}>
                restraint {results ? results.interpretedVector.restraint.toFixed(2) : "0.64"}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 02: TRUST STATS BAR */}
      <section className="bg-white border-t border-b border-ec-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="font-serif text-5xl text-ec-green font-light">60</div>
            <p className="text-xs text-ec-ink font-medium tracking-wide">
              Curated designs, each scored before it earns a place in the library
            </p>
          </div>
          <div className="space-y-2 border-t md:border-t-0 md:border-l md:border-r border-ec-gray-100 pt-6 md:pt-0">
            <div className="font-serif text-5xl text-ec-green font-light">6</div>
            <p className="text-xs text-ec-ink font-medium tracking-wide">
              Emotional territories — from Comfort to Seasonal Nostalgia
            </p>
          </div>
          <div className="space-y-2 border-t md:border-t-0 pt-6 md:pt-0">
            <div className="font-serif text-5xl text-ec-green font-light">1:1</div>
            <p className="text-xs text-ec-ink font-medium tracking-wide">
              Every finished wreath traces to an exact, buildable blueprint
            </p>
          </div>
        </div>
      </section>

      {/* 02.5: MEMORY ARCHIVE & EMOTIONAL SENTIMENT TRENDS */}
      <section className="bg-white border-b border-ec-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-16 items-start">
            
            {/* Left side: Past Memory Log */}
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.15em] text-ec-green px-3 py-1 bg-ec-green-pale rounded-full border border-ec-green-light/20">
                  Your Evercrafted History
                </span>
                <h2 className="text-4xl font-serif text-ec-black italic">
                  The Memory Archive
                </h2>
                <p className="text-sm text-ec-ink max-w-md leading-relaxed font-sans">
                  Each time you match a story to a botanical form, its emotional coordinates are added to your local ledger. Over time, your archive builds a unique fingerprint of your sentiment landscape.
                </p>
              </div>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin">
                {pastMemories.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-ec-gray-200 rounded-2xl bg-white/50 text-ec-gray-500">
                    <p className="font-serif italic">Your ledger is currently empty.</p>
                    <p className="text-[10px] uppercase tracking-wider mt-1">Submit a memory above to begin archiving</p>
                  </div>
                ) : (
                  pastMemories.map((entry) => {
                    const date = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
                    return (
                      <div 
                        key={entry.id} 
                        className="group p-5 bg-white border border-ec-gray-200 rounded-xl hover:border-ec-green-light hover:shadow-sm transition-all relative flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-ec-gray-400 font-mono">
                              {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                            <p className="font-serif italic text-ec-black text-sm leading-relaxed line-clamp-3">
                              &ldquo;{entry.memory}&rdquo;
                            </p>
                          </div>
                          <button 
                            onClick={() => handleDeleteMemory(entry.id)}
                            className="text-ec-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                            title="Delete memory from ledger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ec-gray-100">
                          <div className="flex gap-1.5 flex-wrap">
                            {Object.entries(entry.interpretedVector).map(([key, val]: [string, any]) => {
                              if (val > 0.6) {
                                return (
                                  <span key={key} className="text-[9px] font-mono bg-ec-green-pale text-ec-green border border-ec-green-light/15 px-2 py-0.5 rounded-full uppercase font-bold">
                                    {key}: {Math.round(val * 100)}%
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>
                          <button
                            onClick={() => {
                              setMemory(entry.memory);
                              setResults({
                                interpretedVector: entry.interpretedVector,
                                explanation: entry.explanation,
                                matches: wreaths.map(w => ({
                                  id: w.id,
                                  score: calculateSimilarity(entry.interpretedVector, w.vector),
                                  explanation: entry.explanation
                                })).sort((a,b) => b.score - a.score).slice(0, 3)
                              });
                              // Scroll to top of Hero / memory area smoothly
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-[10px] font-sans font-semibold text-ec-green uppercase tracking-wider hover:text-ec-black transition-colors flex items-center gap-1"
                          >
                            Re-match <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right side: Recharts Radar Chart */}
            <div className="bg-[#fbfcfa] border border-ec-gray-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[480px]">
              <div className="space-y-1.5 border-b border-ec-gray-100 pb-4">
                <h3 className="font-serif text-xl text-ec-black flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-ec-green" /> Emotional Vector Landscape
                </h3>
                <p className="text-[11px] text-ec-gray-500 font-sans uppercase tracking-wider font-semibold">
                  Radar distribution of average memory sentiment across {pastMemories.length} entries
                </p>
              </div>

              <div className="w-full h-80 my-4 flex items-center justify-center">
                {pastMemories.length === 0 ? (
                  <div className="text-center text-ec-gray-400 font-serif italic text-sm">
                    No data to chart yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: "#1c1c1c", fontSize: 10, fontFamily: "monospace", fontWeight: 600 }} 
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 8 }} />
                      <Radar
                        name="Average Sentiment Profile"
                        dataKey="value"
                        stroke="#4A6741"
                        fill="#4A6741"
                        fillOpacity={0.15}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#ffffff", 
                          borderColor: "#e5e7eb", 
                          borderRadius: "12px",
                          fontFamily: "sans-serif",
                          fontSize: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                        }} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-xl p-4 flex gap-4 items-start border border-ec-gray-100">
                <HelpCircle className="w-5 h-5 text-ec-green shrink-0 mt-0.5" />
                <p className="text-[11px] text-ec-ink leading-relaxed font-sans">
                  The Radar Chart calculates your aggregate emotional tone across seven polarity dimensions. An ideal balance signifies diverse emotional breadth, while sharp peaks point to specific seasonal or nostalgic anchors.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 03: THE COHESIVE INTENT CARD */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 text-center py-8">
        <div className="max-w-xl mx-auto space-y-4">
          <h3 className="font-serif text-3xl text-ec-black italic">
            One story, told three ways
          </h3>
          <p className="text-xs text-ec-ink leading-relaxed font-sans">
            Our library is Curated around human moments. We do not generate endless mockups or push inventory.
            We catalog the sentiment, match it by vector geometry, and provide the exact formulas.
          </p>
          <button
            onClick={() => setTab("territories")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-ec-green border-b border-ec-green hover:text-ec-black hover:border-ec-black transition-all pb-0.5"
          >
            Explore the six territories <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

    </div>
  );
}
