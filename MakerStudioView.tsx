import React from "react";
import { 
  Sparkles, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Compass, 
  HelpCircle, 
  ArrowRight,
  Info,
  Layers,
  Wand2,
  MessageSquare,
  BookOpen,
  RotateCcw,
  Zap,
  User
} from "lucide-react";
import { PlacementItem, WreathCritique, Territory } from "../types";
import { useAuth } from "../context/AuthContext";
import { 
  saveWreathToFirestore, 
  getWreathsFromFirestore, 
  deleteWreathFromFirestore,
  SavedWreathDesign
} from "../lib/dbService";

interface MakerStudioViewProps {
  territories: Territory[];
}

export default function MakerStudioView({ territories }: MakerStudioViewProps) {
  const { user } = useAuth();
  const [targetTerritoryId, setTargetTerritoryId] = React.useState<number>(1);
  const [notes, setNotes] = React.useState("");
  const [placements, setPlacements] = React.useState<PlacementItem[]>([
    { id: "1", elementType: "focal", elementName: "Eucalyptus Grandis", clockPosition: "10:30" },
    { id: "2", elementType: "focal", elementName: "Cream Rosebud", clockPosition: "11:15" },
    { id: "3", elementType: "greenery", elementName: "Silver Dollar Eucalyptus Sweep", clockPosition: "9:00" },
    { id: "4", elementType: "greenery", elementName: "Weeping Cedar Sweep", clockPosition: "1:30" }
  ]);

  // Saved designs list
  const [savedWreaths, setSavedWreaths] = React.useState<SavedWreathDesign[]>([]);

  // Load saved wreaths from Firestore (or Local Storage if Guest)
  React.useEffect(() => {
    if (user && !user.isGuest) {
      const fetchDesigns = async () => {
        const designs = await getWreathsFromFirestore(user.uid);
        setSavedWreaths(designs);
      };
      fetchDesigns();
    } else {
      try {
        const stored = localStorage.getItem("moodoor_saved_wreaths");
        setSavedWreaths(stored ? JSON.parse(stored) : []);
      } catch {
        setSavedWreaths([]);
      }
    }
  }, [user]);

  // Sync to local storage for guest
  React.useEffect(() => {
    if (!user || user.isGuest) {
      try {
        localStorage.setItem("moodoor_saved_wreaths", JSON.stringify(savedWreaths));
      } catch (err) {
        console.error("Local storage error:", err);
      }
    }
  }, [savedWreaths, user]);

  // Editor placement selectors
  const [elemType, setElemType] = React.useState<"focal" | "greenery" | "texture" | "ribbon">("focal");
  const [elemName, setElemName] = React.useState("Cream Rosebud");
  const [clockPos, setClockPos] = React.useState("10:30");

  const [loading, setLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState(0);
  const [critique, setCritique] = React.useState<WreathCritique | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const elementPresets: Record<string, string[]> = {
    focal: ["Cream Rosebud", "Autumn Amber Dahlia", "Faded Blush Peony", "White Ranunculus"],
    greenery: ["Silver Dollar Eucalyptus Sweep", "Weeping Cedar Sweep", "Bay Laurel branch", "Preserved Sage Leaves"],
    texture: ["Amber Pip Berries", "Dried Wheat stalks", "Preserved Lavender sprigs", "Mini Pinecones"],
    ribbon: ["Raw Linen ribbon", "Toffee Velvet wrap", "Frayed Sage cotton strap", "Copper wire binding"]
  };

  // Sync preset names when type changes
  React.useEffect(() => {
    setElemName(elementPresets[elemType][0]);
  }, [elemType]);

  // Rotate loading step messages for premium feel
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 750);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Reading coordinates on polar clock-grid...",
    "Analyzing asymmetrical counterbalance weights...",
    "Scrutinizing negative space margins...",
    "Formulating design suggestions..."
  ];

  // --- GEMINI CO-PILOT STATES & HANDLERS ---
  const [activeAiTab, setActiveAiTab] = React.useState<"critique" | "chat" | "poetry" | "optimizer">("critique");
  const [chatInput, setChatInput] = React.useState("");
  const [chatHistory, setChatHistory] = React.useState<Array<{ role: "user" | "model", text: string }>>([
    {
      role: "model",
      text: "Hello, fellow artisan. I am your Botanical Copilot. I can answer questions about your current layout, recommend complementary accent materials, or explain the secrets of negative space. How can I guide you today?"
    }
  ]);
  const [copilotLoading, setCopilotLoading] = React.useState(false);
  const [copilotError, setCopilotError] = React.useState<string | null>(null);

  const [poetryText, setPoetryText] = React.useState("");
  const [poetryType, setPoetryType] = React.useState<"narrative" | "poem">("narrative");
  const [poetryLoading, setPoetryLoading] = React.useState(false);

  const [optimizerExplanation, setOptimizerExplanation] = React.useState<string | null>(null);
  const [optimizerLoading, setOptimizerLoading] = React.useState(false);

  const handleCopilotChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || copilotLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setCopilotError(null);
    setCopilotLoading(true);

    const updatedHistory = [...chatHistory, { role: "user" as const, text: userMessage }];
    setChatHistory(updatedHistory);

    try {
      const response = await fetch("/api/copilot-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placements,
          targetTerritoryId,
          message: userMessage,
          chatHistory: updatedHistory.slice(-6)
        })
      });

      if (!response.ok) {
        throw new Error("Unable to establish connection with the copilot service.");
      }

      const data = await response.json();
      if (data.success) {
        setChatHistory((prev) => [...prev, { role: "model", text: data.text }]);
      } else {
        throw new Error(data.error || "Failed to parse copilot response.");
      }
    } catch (err: any) {
      setCopilotError(err.message || "An unexpected error occurred.");
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleComposeStory = async () => {
    setPoetryLoading(true);
    setCopilotError(null);
    try {
      const response = await fetch("/api/copilot-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placements,
          targetTerritoryId,
          notes,
          type: poetryType
        })
      });

      if (!response.ok) {
        throw new Error("Failed to reach the Poetic Alchemist service.");
      }

      const data = await response.json();
      if (data.success) {
        setPoetryText(data.text);
      } else {
        throw new Error(data.error || "Poetic synthesis failed.");
      }
    } catch (err: any) {
      setCopilotError(err.message || "An unexpected error occurred during literary composition.");
    } finally {
      setPoetryLoading(false);
    }
  };

  const handleOptimizeLayout = async (actionType: "autofill" | "symmetry_buster") => {
    setOptimizerLoading(true);
    setCopilotError(null);
    setOptimizerExplanation(null);

    try {
      const response = await fetch("/api/copilot-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placements,
          targetTerritoryId,
          notes,
          actionType
        })
      });

      if (!response.ok) {
        throw new Error("Optimization service is currently unavailable.");
      }

      const data = await response.json();
      if (data.success) {
        const { explanation } = data.data;
        setOptimizerExplanation(explanation);

        if (actionType === "autofill") {
          const itemsToAdd = data.data.itemsToAdd || [];
          const newItems = itemsToAdd.map((item: any) => ({
            id: Math.random().toString(),
            elementType: item.elementType,
            elementName: item.elementName,
            clockPosition: item.clockPosition
          }));
          setPlacements((prev) => [...prev, ...newItems]);
        } else {
          const optimized = data.data.optimizedPlacements || [];
          setPlacements(optimized);
        }
      } else {
        throw new Error(data.error || "Failed to optimize placements.");
      }
    } catch (err: any) {
      setCopilotError(err.message || "Failed to compute layout adjustments.");
    } finally {
      setOptimizerLoading(false);
    }
  };

  // Helper to format bold strings and newlines in a light Markdown parser
  const renderCopilotMarkdown = (markdownText: string) => {
    if (!markdownText) return null;
    const lines = markdownText.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="font-serif text-sm font-bold text-ec-black mt-4 mb-1.5 flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-ec-green rounded-full inline-block"></span>
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="font-serif text-base font-semibold text-ec-black mt-5 mb-2 border-b border-ec-gray-100 pb-1">
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
      }
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const content = trimmed.replace(/^[\*\-]\s*/, "");
        return (
          <li key={idx} className="text-[12px] text-ec-ink font-sans ml-3 list-disc pl-0.5 py-0.5 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }
      const numberedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numberedMatch) {
        return (
          <div key={idx} className="flex gap-2 py-1 text-[12px] text-ec-ink font-sans items-start">
            <span className="font-mono font-bold text-ec-green shrink-0 text-[10px]">
              {numberedMatch[1]}.
            </span>
            <p className="leading-relaxed flex-1">{parseBoldText(numberedMatch[2])}</p>
          </div>
        );
      }
      if (!trimmed) {
        return <div key={idx} className="h-2"></div>;
      }
      return (
        <p key={idx} className="text-[12.5px] text-ec-ink font-sans leading-relaxed py-0.5">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-ec-black">{part}</strong>;
      }
      return part;
    });
  };

  const handleAddPlacement = () => {
    if (!elemName.trim()) return;
    const newItem: PlacementItem = {
      id: Math.random().toString(),
      elementType: elemType,
      elementName: elemName,
      clockPosition: clockPos
    };
    setPlacements((prev) => [...prev, newItem]);
  };

  const handleRemovePlacement = (id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearCanvas = () => {
    setPlacements([]);
    setCritique(null);
  };

  const handleSaveDesign = async () => {
    setError(null);
    if (placements.length === 0) {
      setError("Please add at least one botanical element before saving.");
      return;
    }

    try {
      let finalId = `wreath_${Math.random().toString(36).substring(2, 9)}`;
      const activeCritique = critique || {
        score: 100,
        artisticCritique: "Custom architectural layout awaiting evaluation.",
        evsAnalysis: "Warmth: Neutral | Seasonal: Adaptive",
        errors: [],
        suggestions: ["Submit design for professional evaluation"]
      };

      if (user && !user.isGuest) {
        finalId = await saveWreathToFirestore(
          user.uid, 
          placements, 
          targetTerritoryId, 
          notes, 
          activeCritique
        );
      }

      const newSaved: SavedWreathDesign = {
        id: finalId,
        userId: user?.uid || "guest",
        placements,
        targetTerritoryId,
        notes,
        critique: activeCritique,
        createdAt: new Date()
      };

      setSavedWreaths(prev => [newSaved, ...prev]);
      alert("Design successfully synchronized to your Atelier Vault!");
    } catch (err: any) {
      console.error("Save error:", err);
      setError("Failed to save design to the cloud. Ensure you are signed in.");
    }
  };

  const handleDeleteSavedWreath = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this design from your Atelier Vault?")) {
      if (user && !user.isGuest) {
        try {
          await deleteWreathFromFirestore(id);
        } catch (err) {
          console.error("Could not delete wreath from Firestore:", err);
        }
      }
      setSavedWreaths(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleGetCritique = async () => {
    setLoading(true);
    setCritique(null);
    setError(null);
    setActiveAiTab("critique");

    try {
      const res = await fetch("/api/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetTerritoryId,
          notes,
          placements
        })
      });

      if (!res.ok) {
        throw new Error("Design core returned a non-ok status.");
      }

      const data = await res.json();
      setCritique(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during design evaluation.");
    } finally {
      setLoading(false);
    }
  };

  // Maps clock strings to approximate visual coordinates for overlay pins on our interactive polar grid
  const clockToCoordinates = (clockStr: string) => {
    const clockToAngle: Record<string, number> = {
      "12:00": 270, "12:30": 285, "1:00": 300, "1:30": 315, "2:00": 330, "2:30": 345,
      "3:00": 0, "3:30": 15, "4:00": 30, "4:30": 45, "5:00": 60, "5:30": 75,
      "6:00": 90, "6:30": 105, "7:00": 120, "7:30": 135, "8:00": 150, "8:30": 165,
      "9:00": 180, "9:30": 195, "10:00": 210, "10:30": 225, "11:00": 240, "11:30": 255
    };

    const angle = clockToAngle[clockStr] ?? 270;
    const rad = (angle * Math.PI) / 180;
    const radius = 100; // Radius of polar circle placement in UI
    const cx = 150 + radius * Math.cos(rad);
    const cy = 150 + radius * Math.sin(rad);
    return { cx, cy };
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-16">
      
      {/* Editorial Header */}
      <header className="space-y-4 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-ec-green bg-ec-green-pale px-3.5 py-1.5 rounded-full border border-ec-green-light/20">
          <Wand2 className="w-3.5 h-3.5 animate-pulse" /> Maker Studio Critique
        </span>
        <h1 className="text-4xl md:text-6xl text-ec-black tracking-tight leading-tight">
          Evaluate your <em className="font-script text-ec-green text-3xl md:text-5xl font-normal block mt-2">custom composition</em>
        </h1>
        <p className="text-ec-ink font-serif text-lg leading-relaxed italic">
          Are you crafting a wreath at home or designing a custom blueprint? Map your stem placements on our polar clock-grid, describe your goal, and receive professional criticism and suggestions directly from the Moodoor design director.
        </p>
      </header>

      {/* Main Studio Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-12 items-start">
        
        {/* Left Column: Interactive Grid Builder & Stem Ledger */}
        <div className="space-y-8">
          
          {/* Card: Grid Placement Tool */}
          <div className="bg-white border border-ec-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-2xl text-ec-black flex items-center gap-2">
              <Layers className="w-5 h-5 text-ec-green" /> 01: Build Custom Placements
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Element Type selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">
                  Stem Type
                </label>
                <select
                  value={elemType}
                  onChange={(e: any) => setElemType(e.target.value)}
                  className="w-full text-xs font-sans font-medium px-3.5 py-2.5 rounded-lg border border-ec-border bg-white text-ec-black focus:border-ec-green outline-none"
                >
                  <option value="focal">🌺 Focal Bloom</option>
                  <option value="greenery">🌿 Greenery Sweep</option>
                  <option value="texture">🌾 Twig/Texture</option>
                  <option value="ribbon">🎗️ Wrap/Ribbon</option>
                </select>
              </div>

              {/* Element Name selector */}
              <div className="space-y-2 sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">
                  Material Name
                </label>
                <div className="flex gap-2">
                  <select
                    value={elemName}
                    onChange={(e) => setElemName(e.target.value)}
                    className="w-full text-xs font-sans font-medium px-3.5 py-2.5 rounded-lg border border-ec-border bg-white text-ec-black focus:border-ec-green outline-none"
                  >
                    {elementPresets[elemType].map((preset) => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={elemName}
                    onChange={(e) => setElemName(e.target.value)}
                    placeholder="Or custom stem name..."
                    className="hidden sm:block w-full text-xs font-sans px-3.5 py-2 rounded-lg border border-ec-border text-ec-black focus:border-ec-green outline-none"
                  />
                </div>
              </div>

              {/* Clock Position selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">
                  Clock Position
                </label>
                <select
                  value={clockPos}
                  onChange={(e) => setClockPos(e.target.value)}
                  className="w-full text-xs font-mono px-3.5 py-2.5 rounded-lg border border-ec-border bg-white text-ec-black focus:border-ec-green outline-none"
                >
                  {Object.keys({
                    "12:00": 1, "12:30": 1, "1:00": 1, "1:30": 1, "2:00": 1, "2:30": 1,
                    "3:00": 1, "3:30": 1, "4:00": 1, "4:30": 1, "5:00": 1, "5:30": 1,
                    "6:00": 1, "6:30": 1, "7:00": 1, "7:30": 1, "8:00": 1, "8:30": 1,
                    "9:00": 1, "9:30": 1, "10:00": 1, "10:30": 1, "11:00": 1, "11:30": 1
                  }).map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleClearCanvas}
                disabled={placements.length === 0}
                className="px-5 py-2.5 rounded-full border border-ec-border hover:bg-ec-error/5 hover:text-ec-error hover:border-ec-error/30 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40"
              >
                Clear Grid
              </button>
              <button
                onClick={handleAddPlacement}
                className="px-6 py-2.5 bg-ec-green hover:bg-ec-green-light text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all"
              >
                Add stem to grid
              </button>
            </div>

          </div>

          {/* Card: Target details & EVS Intent */}
          <div className="bg-white border border-ec-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-2xl text-ec-black flex items-center gap-2">
              <Compass className="w-5 h-5 text-ec-green" /> 02: Specify Design Intent
            </h3>

            {/* Target Territory picker */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">
                Target Emotional Territory
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {territories.map((terr) => (
                  <button
                    key={terr.id}
                    onClick={() => setTargetTerritoryId(terr.id)}
                    className={`p-3 text-left border rounded-xl transition-all ${
                      targetTerritoryId === terr.id
                        ? "bg-ec-green-pale/40 border-ec-green-light text-ec-green ring-2 ring-ec-green/10"
                        : "bg-white border-ec-border text-ec-ink hover:border-ec-green-light/40"
                    }`}
                  >
                    <span className="block font-serif text-[15px] font-semibold">{terr.name}</span>
                    <span className="block text-[10px] font-mono text-ec-gray-400">Territory {terr.numberRoman}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Design Notes */}
            <div className="space-y-2">
              <label htmlFor="notesInput" className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">
                Notes, challenges, or material notes
              </label>
              <textarea
                id="notesInput"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 'I placed heavy elements on the top left, but I feel like the rest of the circle is too sparse, and the overall color contrast is running too harsh...'"
                className="w-full min-h-[100px] bg-ec-off-white/40 border border-ec-border focus:border-ec-green rounded-xl p-4 text-xs text-ec-black outline-none resize-none font-serif italic text-sm"
              />
            </div>

            <div className="pt-2 border-t border-ec-gray-100 flex flex-wrap justify-between items-center gap-3">
              <span className="text-[11px] text-ec-gray-500 font-sans">
                {placements.length} stems currently pinned
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDesign}
                  className="bg-white hover:bg-ec-off-white border border-ec-border text-ec-black font-semibold px-5 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Save Blueprint
                </button>
                <button
                  onClick={handleGetCritique}
                  disabled={loading}
                  className="bg-ec-green hover:bg-ec-green-light text-white font-semibold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-103 active:scale-97 disabled:opacity-50 shadow-md"
                >
                  {loading ? "Evaluating..." : "Generate AI Critique"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Stem placement ledger list */}
          <div className="bg-white border border-ec-border rounded-xl p-6 shadow-sm space-y-4">
            <h4 className="font-serif text-lg text-ec-black">Your Placement Ledger</h4>
            {placements.length === 0 ? (
              <p className="text-xs text-ec-gray-400 font-serif italic">Your ledger is blank. Add stems to see them here.</p>
            ) : (
              <div className="divide-y divide-ec-gray-100 max-h-60 overflow-y-auto pr-2">
                {placements.map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        p.elementType === "focal" ? "bg-red-400" :
                        p.elementType === "greenery" ? "bg-emerald-400" :
                        p.elementType === "texture" ? "bg-amber-400" : "bg-purple-400"
                      }`} />
                      <div>
                        <span className="text-xs font-semibold text-ec-black block">{p.elementName}</span>
                        <span className="text-[9px] font-mono text-ec-gray-500 uppercase">{p.elementType} • Position {p.clockPosition}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePlacement(p.id)}
                      className="text-ec-gray-400 hover:text-ec-error p-1 rounded-md transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Interactive Circular Canvas Map & Critique Reports */}
        <div className="space-y-8 lg:sticky lg:top-24">
          
          {/* Radial Canvas Map representing 12:00 coordinate system */}
          <div className="bg-white border border-ec-border rounded-2xl p-6 shadow-xl flex flex-col items-center space-y-6 relative overflow-hidden">
            <div className="absolute top-4 left-4 font-mono text-[9px] text-ec-gray-400 uppercase">
              Polar Placement Matrix
            </div>

            {/* Simulated 12-hour polar coordinates grid */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              
              {/* Natural grapevine ring schematic */}
              <div className="absolute w-60 h-60 rounded-full border-4 border-[#A8916F]/25 animate-spin-slow pointer-events-none" />
              <div className="absolute w-[236px] h-[236px] rounded-full border-2 border-[#8A7458]/20 pointer-events-none" />
              <div className="absolute w-[244px] h-[244px] rounded-full border border-dashed border-[#B89F7E]/15 pointer-events-none" />

              {/* Grid axes */}
              <div className="absolute w-64 h-px bg-ec-gray-200/50" />
              <div className="absolute h-64 w-px bg-ec-gray-200/50" />

              {/* Hour indicators around dial */}
              {Array.from({ length: 12 }).map((_, i) => {
                const hour = i === 0 ? 12 : i;
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const x = 150 + 115 * Math.cos(angle);
                const y = 150 + 115 * Math.sin(angle);
                return (
                  <span
                    key={hour}
                    className="absolute font-mono text-[9px] text-ec-gray-400/85"
                    style={{ left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" }}
                  >
                    {hour}
                  </span>
                );
              })}

              {/* Visualized Pins */}
              <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {placements.map((p) => {
                  const { cx, cy } = clockToCoordinates(p.clockPosition);
                  const color = 
                    p.elementType === "focal" ? "#F87171" :
                    p.elementType === "greenery" ? "#34D399" :
                    p.elementType === "texture" ? "#FBBF24" : "#C084FC";
                  return (
                    <g key={p.id} className="animate-scale-up">
                      {/* outer pulsing shadow */}
                      <circle cx={cx} cy={cy} r="10" fill={color} opacity="0.15" />
                      <circle cx={cx} cy={cy} r="4.5" fill={color} />
                      <line x1="150" y1="150" x2={cx} y2={cy} stroke={color} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                    </g>
                  );
                })}
              </svg>

              {/* Core Hub */}
              <div className="w-10 h-10 rounded-full bg-[#E5E7EB] border border-white flex items-center justify-center shadow-inner text-[10px] font-mono text-ec-gray-500">
                18"
              </div>

            </div>

            <p className="text-[10px] font-mono text-ec-gray-400 text-center">
              Markers represent pinned materials. Greenery flows clock-wise by custom studio decree.
            </p>
          </div>

          {/* Section: AI Studio Suite Tab Bar */}
          <div className="bg-white border border-ec-border rounded-2xl shadow-md overflow-hidden relative">
            
            {/* Header Tabs */}
            <div className="flex border-b border-ec-border bg-ec-off-white/40">
              {[
                { id: "critique", label: "Critique", icon: Compass },
                { id: "chat", label: "Copilot Chat", icon: MessageSquare },
                { id: "poetry", label: "Poetry/Story", icon: BookOpen },
                { id: "optimizer", label: "Optimizer", icon: Zap }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveAiTab(tab.id as any);
                      setCopilotError(null);
                    }}
                    className={`flex-1 py-3 px-2 text-[11px] font-semibold uppercase tracking-wider border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeAiTab === tab.id
                        ? "border-ec-green text-ec-green bg-white font-bold"
                        : "border-transparent text-ec-gray-400 hover:text-ec-black hover:bg-ec-off-white/20"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Error banner inside AI suite */}
            {copilotError && (
              <div className="p-4 bg-red-50 border-b border-red-100 text-ec-error text-xs">
                {copilotError}
              </div>
            )}

            {/* Content Area */}
            <div className="p-6">
              
              {/* TAB 1: CRITIQUE */}
              {activeAiTab === "critique" && (
                <div className="space-y-6">
                  {loading && (
                    <div className="text-center py-12 space-y-4 animate-pulse">
                      <div className="relative w-10 h-10 flex items-center justify-center mx-auto">
                        <span className="absolute inset-0 border-3 border-ec-green-light/20 border-t-ec-green rounded-full animate-spin" />
                        <Compass className="w-4 h-4 text-ec-green" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-semibold text-ec-black">Evaluating Composition</h4>
                        <p className="text-[11px] text-ec-gray-500 font-mono">{loadingMessages[loadingStep]}</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-ec-error p-4 rounded-xl text-xs leading-relaxed">
                      {error}
                    </div>
                  )}

                  {critique && !loading && (
                    <div className="space-y-6 divide-y divide-ec-gray-100 animate-scale-up">
                      <div className="flex justify-between items-center pb-4">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-ec-green font-mono">
                            Design Studio Assessment
                          </span>
                          <h3 className="font-serif text-lg text-ec-black">Evaluation Completed</h3>
                        </div>
                        <div className="text-right">
                          <div className="font-serif text-3xl text-ec-green font-semibold">
                            {critique.score}
                          </div>
                          <span className="text-[9px] font-mono uppercase text-ec-gray-400">Artistry Rating</span>
                        </div>
                      </div>

                      <div className="py-4 space-y-1.5">
                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-ec-gray-400 font-sans">
                          Director's Review
                        </h4>
                        <p className="text-xs text-ec-ink font-serif italic leading-relaxed text-[13.5px]">
                          &ldquo;{critique.artisticCritique}&rdquo;
                        </p>
                      </div>

                      <div className="py-4 space-y-1.5">
                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-ec-gray-400 font-sans flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-ec-green" /> Emotional Coordinate Alignment
                        </h4>
                        <p className="text-xs text-ec-ink leading-relaxed">
                          {critique.evsAnalysis}
                        </p>
                      </div>

                      {critique.errors && critique.errors.length > 0 && (
                        <div className="py-4 space-y-3">
                          <h4 className="text-[10px] uppercase font-bold tracking-widest text-ec-gray-400 font-sans flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-ec-warning" /> Identified Pitfalls ({critique.errors.length})
                          </h4>
                          <div className="space-y-2">
                            {critique.errors.map((err, idx) => (
                              <div key={idx} className="p-3 bg-ec-warning/5 border border-ec-warning/20 rounded-xl space-y-1">
                                <div className="flex justify-between items-baseline">
                                  <span className="text-xs font-semibold text-ec-black flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-ec-warning" />
                                    {err.title}
                                  </span>
                                  <span className="font-mono text-[9px] text-ec-warning font-semibold">{err.location}</span>
                                </div>
                                <p className="text-[11px] text-ec-ink leading-relaxed">
                                  {err.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 space-y-3">
                        <h4 className="text-[10px] uppercase font-bold tracking-widest text-ec-gray-400 font-sans flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-ec-green" /> Actionable Adjustments
                        </h4>
                        <div className="space-y-1.5">
                          {critique.suggestions.map((sug, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start p-1.5 hover:bg-ec-off-white/40 rounded-lg">
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 mt-0.5 accent-ec-green rounded border-ec-border cursor-pointer"
                                id={`sug-${idx}`}
                              />
                              <label htmlFor={`sug-${idx}`} className="text-xs text-ec-ink leading-relaxed select-none cursor-pointer">
                                {sug}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {!critique && !loading && (
                    <div className="text-center py-12 space-y-3">
                      <Compass className="w-8 h-8 text-ec-gray-300 mx-auto" />
                      <h4 className="font-serif text-md text-ec-black font-semibold">Critique Report Chamber</h4>
                      <p className="text-xs text-ec-ink max-w-xs mx-auto leading-relaxed">
                        Design your wreath composition on the left, specify your intent, and click <strong className="text-ec-green">"Generate AI Critique"</strong> to unlock structural analysis.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: COPILOT CHAT */}
              {activeAiTab === "chat" && (
                <div className="space-y-4">
                  <div className="bg-ec-green-pale/35 border border-ec-green-light/20 p-3 rounded-xl flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-ec-green shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-ec-green leading-relaxed font-serif italic">
                      "I analyze your coordinates and materials in real-time. Ask me anything about asymmetry, botanical palettes, ribbon styling, or regional aesthetics."
                    </p>
                  </div>

                  {/* Chat Messages */}
                  <div className="h-64 overflow-y-auto border border-ec-border rounded-xl p-4 bg-ec-off-white/30 space-y-3.5 flex flex-col">
                    {chatHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2 max-w-[85%] ${
                          msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                          msg.role === "user" ? "bg-ec-green text-white" : "bg-ec-green-pale text-ec-green"
                        }`}>
                          {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Wand2 className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                          msg.role === "user" 
                            ? "bg-ec-green text-white rounded-tr-none" 
                            : "bg-white border border-ec-border text-ec-ink rounded-tl-none font-serif"
                        }`}>
                          {msg.role === "model" ? renderCopilotMarkdown(msg.text) : msg.text}
                        </div>
                      </div>
                    ))}
                    {copilotLoading && (
                      <div className="self-start flex gap-2 items-center text-xs text-ec-gray-400 font-serif italic">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-ec-green" />
                        <span>The Copilot is contemplating...</span>
                      </div>
                    )}
                  </div>

                  {/* Chat input */}
                  <form onSubmit={handleCopilotChat} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the botanical copilot..."
                      className="flex-1 px-4 py-2.5 text-xs border border-ec-border focus:border-ec-green bg-white rounded-xl text-ec-black outline-none font-serif"
                      disabled={copilotLoading}
                    />
                    <button
                      type="submit"
                      disabled={copilotLoading || !chatInput.trim()}
                      className="px-4 py-2.5 bg-ec-green hover:bg-ec-green-light disabled:opacity-50 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Ask
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: POETIC ALCHEMIST */}
              {activeAiTab === "poetry" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ec-green font-mono block">
                      Literary Resonance Engine (models/gemini-3.1-pro-preview)
                    </span>
                    <p className="text-xs text-ec-gray-500 leading-relaxed font-serif">
                      Translate your structural clock-face coordinates and material textures into beautiful sensory poetry or a high-end gallery narrative to accompany your wreath in the catalog.
                    </p>
                  </div>

                  {/* Settings */}
                  <div className="flex gap-4 border-y border-ec-gray-100 py-3">
                    <label className="flex items-center gap-2 text-xs text-ec-black font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="poetryType"
                        checked={poetryType === "narrative"}
                        onChange={() => setPoetryType("narrative")}
                        className="accent-ec-green"
                      />
                      Gallery Narrative
                    </label>
                    <label className="flex items-center gap-2 text-xs text-ec-black font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="poetryType"
                        checked={poetryType === "poem"}
                        onChange={() => setPoetryType("poem")}
                        className="accent-ec-green"
                      />
                      Sensory Poem
                    </label>
                  </div>

                  {/* Result display */}
                  {poetryText && (
                    <div className="p-5 border border-ec-border rounded-xl bg-ec-off-white/30 text-left font-serif space-y-3 max-h-60 overflow-y-auto shadow-inner">
                      {renderCopilotMarkdown(poetryText)}
                    </div>
                  )}

                  <button
                    onClick={handleComposeStory}
                    disabled={poetryLoading}
                    className="w-full py-3.5 bg-ec-black hover:bg-ec-green text-white font-semibold rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {poetryLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Weaving Literary Stanzas...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5" />
                        Compose Literary Prose/Poetry
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 4: BLUEPRINT OPTIMIZER */}
              {activeAiTab === "optimizer" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ec-green font-mono block">
                      Autonomous Placement Optimizer
                    </span>
                    <p className="text-xs text-ec-gray-500 leading-relaxed font-serif">
                      Let Gemini actively analyze your polar matrix and modify your wreath dynamically to enforce design constraints or complete bare areas.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Action 1: Autofill Harmony */}
                    <div className="p-4 border border-ec-border rounded-xl bg-white space-y-3 hover:border-ec-green transition-all">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-ec-black flex items-center gap-1.5 font-serif">
                          <Sparkles className="w-4 h-4 text-ec-green" /> Autofill Harmony
                        </h4>
                        <span className="text-[9px] bg-ec-green-pale text-ec-green px-2 py-0.5 rounded-full uppercase font-mono font-bold">
                          Add Stems
                        </span>
                      </div>
                      <p className="text-[11.5px] text-ec-ink leading-relaxed font-serif italic">
                        Select exactly 2 complementary stems (focal, greenery, or texture) from the studio vaults and automatically place them at balanced visual coordinates.
                      </p>
                      <button
                        onClick={() => handleOptimizeLayout("autofill")}
                        disabled={optimizerLoading}
                        className="w-full py-2 bg-ec-off-white hover:bg-ec-green-pale border border-ec-border hover:border-ec-green-light hover:text-ec-green text-ec-black text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {optimizerLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        Execute Autofill
                      </button>
                    </div>

                    {/* Action 2: Symmetry Buster */}
                    <div className="p-4 border border-ec-border rounded-xl bg-white space-y-3 hover:border-ec-green transition-all">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-ec-black flex items-center gap-1.5 font-serif">
                          <RotateCcw className="w-4 h-4 text-ec-green" /> Symmetry Buster
                        </h4>
                        <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full uppercase font-mono font-bold">
                          Edit Layout
                        </span>
                      </div>
                      <p className="text-[11.5px] text-ec-ink leading-relaxed font-serif italic">
                        Identify mirror symmetry traps (stems clashing across horizontal/vertical lines) and automatically slide them to dynamic, counterbalanced clock positions.
                      </p>
                      <button
                        onClick={() => handleOptimizeLayout("symmetry_buster")}
                        disabled={optimizerLoading || placements.length === 0}
                        className="w-full py-2 bg-ec-off-white hover:bg-ec-green-pale border border-ec-border hover:border-ec-green-light hover:text-ec-green text-ec-black text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {optimizerLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Bust Symmetry Grid
                      </button>
                    </div>
                  </div>

                  {optimizerExplanation && (
                    <div className="p-4 bg-ec-green-pale/30 border border-ec-green-light/15 rounded-xl space-y-1 animate-scale-up text-left">
                      <h5 className="text-[10px] uppercase font-bold tracking-wider text-ec-green font-sans flex items-center gap-1">
                        <Wand2 className="w-3.5 h-3.5" /> Optimization Narrative
                      </h5>
                      <p className="text-xs text-ec-ink font-serif italic leading-relaxed">
                        "{optimizerExplanation}"
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Atelier Blueprint Vault Card */}
          <div className="bg-white border border-ec-border rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-serif text-lg text-ec-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ec-green" /> Atelier Blueprint Vault
            </h4>
            
            {savedWreaths.length === 0 ? (
              <p className="text-xs text-ec-gray-400 font-serif italic py-2">
                No synchronized blueprint designs found. Add some stems on the left and click "Save Blueprint" to save to the vault.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
                {savedWreaths.map((item) => {
                  const terr = territories.find(t => t.id === item.targetTerritoryId);
                  const formattedDate = item.createdAt instanceof Date 
                    ? item.createdAt.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                    : "Synced Blueprint";

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setPlacements(item.placements);
                        setTargetTerritoryId(item.targetTerritoryId);
                        setNotes(item.notes);
                        setCritique(item.critique);
                      }}
                      className="group relative p-3 border border-ec-border rounded-xl cursor-pointer hover:border-ec-green hover:bg-ec-off-white/30 transition-all text-left space-y-1"
                    >
                      <div className="flex justify-between items-start pr-6">
                        <span className="text-xs font-bold text-ec-black">
                          {terr ? terr.name : `Territory ${item.targetTerritoryId}`}
                        </span>
                        <span className="font-mono text-[9px] text-ec-gray-400 uppercase">
                          {item.placements.length} stems
                        </span>
                      </div>
                      
                      {item.notes && (
                        <p className="text-[11px] text-ec-ink italic truncate max-w-[280px]">
                          "{item.notes}"
                        </p>
                      )}
                      
                      <p className="text-[9px] text-ec-gray-400 font-mono">
                        Saved: {formattedDate}
                      </p>

                      <button
                        onClick={(e) => handleDeleteSavedWreath(item.id, e)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white hover:bg-ec-error hover:text-white text-ec-gray-400 border border-ec-border hover:border-ec-error rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                        title="Delete blueprint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </section>

    </div>
  );
}
