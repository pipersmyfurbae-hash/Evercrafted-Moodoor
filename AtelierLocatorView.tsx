import React from "react";
import { 
  MapPin, 
  Search, 
  Navigation, 
  Compass, 
  Sprout, 
  Flower, 
  Sparkles, 
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  HelpCircle
} from "lucide-react";

interface AtelierLocatorViewProps {
  // Add any needed props here
}

interface GroundingChunkMaps {
  title?: string;
  uri?: string;
  placeAnswerSources?: {
    reviewSnippets?: string[];
  };
}

export default function AtelierLocatorView({}: AtelierLocatorViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [queryType, setQueryType] = React.useState<"all" | "florists" | "supplies" | "ateliers">("all");
  const [loading, setLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState(0);
  const [result, setResult] = React.useState<{
    text: string;
    groundingChunks: any[];
    isFallback?: boolean;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = React.useState(false);

  const sampleLocations = [
    "San Francisco, CA",
    "Seattle, WA",
    "New York, NY",
    "Austin, TX",
    "Miami, FL"
  ];

  const loadingMessages = [
    "Establishing connection to Google Maps Platform...",
    "Grounding local coordinates and region boundaries...",
    "Querying regional botanical nurseries & floral boutiques...",
    "Analyzing rating metadata and expert reviews...",
    "Synthesizing customized botanical concierge guide..."
  ];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 1000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (loc: string = searchQuery, lat?: number, lng?: number) => {
    const finalLocation = loc.trim() || "San Francisco, CA";
    if (!loc.trim() && !lat) {
      setSearchQuery(finalLocation);
    }
    
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/locate-ateliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchQuery: finalLocation,
          latitude: lat,
          longitude: lng,
          queryType
        })
      });

      if (!response.ok) {
        throw new Error("Local atelier search service is temporarily unavailable.");
      }

      const data = await response.json();
      setResult({
        text: data.text,
        groundingChunks: data.groundingChunks || [],
        isFallback: data.isFallback
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during location matching.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDetectingLocation(false);
        // Use coordinates to search
        const coordString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setSearchQuery(coordString);
        handleSearch(coordString, latitude, longitude);
      },
      (err) => {
        setDetectingLocation(false);
        console.error("Geolocation error:", err);
        setError("Unable to retrieve your current location. Please enter a city or zip code manually.");
      },
      { timeout: 10000 }
    );
  };

  // Helper to safely extract maps grounding chunks
  const getMapsGroundingChunks = (): GroundingChunkMaps[] => {
    if (!result || !result.groundingChunks) return [];
    return result.groundingChunks
      .map((c: any) => c.maps)
      .filter((m: any) => m && (m.title || m.uri));
  };

  // Simple, highly polished regex Markdown parser for beautiful rendering of text responses
  const renderFormattedMarkdown = (markdownText: string) => {
    if (!markdownText) return null;
    
    const lines = markdownText.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="font-serif text-lg font-bold text-ec-black mt-6 mb-2.5 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-ec-green rounded-full inline-block"></span>
            {trimmed.replace(/^###\s*/, "")}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="font-serif text-xl font-semibold text-ec-black mt-8 mb-3.5 border-b border-ec-gray-200 pb-1.5">
            {trimmed.replace(/^##\s*/, "")}
          </h3>
        );
      }
      if (trimmed.startsWith("#")) {
        return (
          <h2 key={idx} className="font-serif text-2xl font-semibold text-ec-green mt-8 mb-4">
            {trimmed.replace(/^#\s*/, "")}
          </h2>
        );
      }

      // Bullet lists
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const content = trimmed.replace(/^[\*\-]\s*/, "");
        // Check for bold inside bullet
        return (
          <li key={idx} className="text-xs text-ec-ink font-sans ml-4 list-disc pl-1 py-1 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }

      // Ordered lists
      const numberedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numberedMatch) {
        return (
          <div key={idx} className="flex gap-2.5 py-1.5 text-xs text-ec-ink font-sans items-start">
            <span className="font-mono font-bold text-ec-green shrink-0 bg-ec-green-pale w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
              {numberedMatch[1]}
            </span>
            <p className="leading-relaxed flex-1">{parseBoldText(numberedMatch[2])}</p>
          </div>
        );
      }

      // Blockquotes
      if (trimmed.startsWith(">")) {
        return (
          <blockquote key={idx} className="border-l-2 border-ec-green pl-4 py-1 my-3 text-xs italic text-ec-ink bg-ec-green-pale/30 rounded-r-md">
            {parseBoldText(trimmed.replace(/^>\s*/, ""))}
          </blockquote>
        );
      }

      // Empty line
      if (!trimmed) {
        return <div key={idx} className="h-2.5"></div>;
      }

      // Regular paragraph
      return (
        <p key={idx} className="text-xs text-ec-ink font-sans leading-relaxed py-1">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  // Sub-helper to format bold strings in line chunks
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) => {
      // Every odd index is bold text
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-ec-black">{part}</strong>;
      }
      return part;
    });
  };

  const mapsChunks = getMapsGroundingChunks();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16 relative">
      
      {/* Dynamic Sourcing Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-ec-green px-3.5 py-1 bg-ec-green-pale rounded-full border border-ec-green-light/20">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" /> Real-Time Sourcing Concierge
        </span>
        <h1 className="text-4xl md:text-5xl font-serif text-ec-black leading-tight tracking-tight">
          Find Nearby Botanical <em className="italic text-ec-green font-normal">Ateliers</em>
        </h1>
        <p className="text-ec-ink text-sm font-serif italic max-w-2xl mx-auto">
          Moodoor uses real-time Google Maps Grounding to locate high-end florist design studios, botanical nurseries, and wholesale flower markets near your workshop table.
        </p>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-12 items-start">
        
        {/* Left Side: Search Panel & Interactive Controls */}
        <div className="space-y-8 bg-white border border-ec-border rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="space-y-6">
            <h3 className="font-serif text-lg text-ec-black border-b border-ec-gray-100 pb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-ec-green" /> Search Sourcing Parameters
            </h3>

            {/* Input and Actions Group */}
            <div className="space-y-4">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-ec-gray-500">
                Local Area or Coordinates
              </label>
              
              <div className="flex gap-2 relative">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ec-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter city, state, or ZIP (e.g. Portland, OR)"
                    className="w-full pl-11 pr-4 py-3.5 bg-ec-off-white/50 border border-ec-border focus:border-ec-green focus:bg-white rounded-xl text-sm text-ec-black outline-none transition-all placeholder:text-ec-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />
                </div>
                
                <button
                  onClick={handleDetectLocation}
                  disabled={detectingLocation || loading}
                  className="p-3.5 bg-white border border-ec-border hover:border-ec-green hover:bg-ec-off-white text-ec-ink rounded-xl transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                  title="Detect my location"
                >
                  <Navigation className={`w-4 h-4 ${detectingLocation ? "animate-pulse text-ec-green" : ""}`} />
                </button>
              </div>
            </div>

            {/* Concierge Sourcing Filter Selector */}
            <div className="space-y-3">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-ec-gray-500">
                Sourcing Sifter
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "all", label: "All Sourcing", icon: Compass },
                  { id: "florists", label: "Bespoke Florists", icon: Flower },
                  { id: "supplies", label: "Botanical Supplies", icon: Sprout },
                  { id: "ateliers", label: "Workshops", icon: Sparkles }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setQueryType(item.id as any)}
                      className={`py-3 px-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                        queryType === item.id 
                          ? "border-ec-green bg-ec-green-pale/50 text-ec-green shadow-sm font-semibold"
                          : "border-ec-border bg-white hover:bg-ec-off-white text-ec-ink"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] uppercase tracking-wider font-semibold">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Sourcing Cities */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-ec-gray-500 tracking-wider">Popular Botanical Centers:</span>
              <div className="flex flex-wrap gap-2">
                {sampleLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSearchQuery(loc);
                      handleSearch(loc);
                    }}
                    className="text-[11px] font-semibold text-ec-ink bg-ec-off-white border border-ec-border hover:border-ec-green-light hover:text-ec-green px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Trigger */}
            <button
              onClick={() => handleSearch()}
              disabled={loading || detectingLocation}
              className="w-full py-4 bg-ec-green hover:bg-ec-green-light text-white font-semibold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 shadow-md"
            >
              {loading ? "Searching Local Ateliers..." : "Query Concierge via Maps Grounding"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sourcing Rules Info Block */}
          <div className="mt-8 p-4 bg-ec-off-white border border-ec-border rounded-xl space-y-2.5">
            <h5 className="text-xs font-bold text-ec-black flex items-center gap-1.5 font-serif">
              <HelpCircle className="w-3.5 h-3.5 text-ec-green" /> Why find local botanical suppliers?
            </h5>
            <p className="text-[11px] text-ec-ink leading-relaxed">
              While Moodoor provides premium pre-sorted blueprints and silk botanical materials, matching them with local fresh accents (such as fresh bay leaves, silver-dollar eucalyptus, or wild-foraged branches) creates unparalleled multi-dimensional thresholds. Sourcing grapevine structures from local nurseries also reduces transport foot-printing.
            </p>
          </div>
        </div>

        {/* Right Side: Results Display Panel */}
        <div className="space-y-8">
          
          {loading && (
            <div className="bg-white border border-ec-border rounded-2xl p-8 shadow-sm space-y-6 text-center py-16 animate-pulse">
              <div className="w-12 h-12 bg-ec-green-pale text-ec-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-6 h-6 animate-spin" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-lg font-semibold text-ec-black">Querying Maps Database</h4>
                <p className="text-xs text-ec-gray-500 max-w-xs mx-auto italic font-serif">
                  "{loadingMessages[loadingStep]}"
                </p>
              </div>
              <div className="w-48 h-1.5 bg-ec-gray-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-ec-green rounded-full animate-marquee w-1/3"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-[#FFF8F8] border border-red-100 rounded-2xl p-6 shadow-sm space-y-4 text-center">
              <div className="w-10 h-10 bg-red-50 text-ec-error rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-semibold text-ec-black">Sourcing Lookup Error</h4>
                <p className="text-xs text-ec-gray-500 max-w-sm mx-auto">{error}</p>
              </div>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="bg-white border border-ec-border rounded-2xl p-12 shadow-sm text-center py-20 space-y-4">
              <div className="w-12 h-12 bg-ec-green-pale text-ec-green rounded-full flex items-center justify-center mx-auto">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-serif text-lg text-ec-black">Your Sourcing Desk is Cleared</h4>
                <p className="text-xs text-ec-gray-500 max-w-xs mx-auto">
                  Provide a location and choose your sourcing parameters to consult our real-time Maps Grounding concierge.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              
              {/* Real-time Maps listings container */}
              {mapsChunks.length > 0 && (
                <div className="bg-white border border-ec-border rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="font-serif text-base font-semibold text-ec-black flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-ec-green animate-bounce" /> Verified Google Maps Places ({mapsChunks.length})
                    </span>
                    <span className="font-mono text-[9px] bg-ec-green-pale text-ec-green px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      Grounding Secured
                    </span>
                  </h4>

                  <div className="space-y-3">
                    {mapsChunks.map((place, pIdx) => (
                      <div 
                        key={pIdx}
                        className="p-4 border border-ec-border hover:border-ec-green rounded-xl bg-ec-off-white/30 hover:bg-white transition-all flex justify-between items-start group"
                      >
                        <div className="space-y-1 flex-1 pr-4">
                          <h5 className="text-xs font-bold text-ec-black group-hover:text-ec-green transition-colors">
                            {place.title || "Botanical Partner"}
                          </h5>
                          
                          {/* Display review snippet if available in placeAnswerSources */}
                          {place.placeAnswerSources?.reviewSnippets && place.placeAnswerSources.reviewSnippets.length > 0 ? (
                            <p className="text-[10px] text-ec-ink italic line-clamp-2 pl-2.5 border-l border-ec-gray-200">
                              "{place.placeAnswerSources.reviewSnippets[0]}"
                            </p>
                          ) : (
                            <p className="text-[10px] text-ec-gray-400 font-serif italic">
                              Verified floristry listing in regional registry.
                            </p>
                          )}
                        </div>

                        {place.uri && (
                          <a
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white hover:bg-ec-green hover:text-white border border-ec-border hover:border-ec-green text-ec-gray-500 rounded-lg shadow-sm transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1 text-[10px] font-bold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>MAPS</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concierge detailed report container */}
              <div className="bg-white border border-ec-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
                
                {/* Fallback Warning Flag */}
                {result.isFallback && (
                  <div className="bg-ec-warning/10 border border-ec-warning/30 text-ec-warning text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 animate-pulse" /> Tranquil Concierge Active (Offline Sourcing Directory)
                  </div>
                )}

                {/* Report Content */}
                <div className="prose max-w-none text-left space-y-4 font-serif">
                  {renderFormattedMarkdown(result.text)}
                </div>

                <div className="pt-6 border-t border-ec-gray-100 flex justify-between items-center text-[10px] font-mono text-ec-gray-400 uppercase">
                  <span>Atelier Concierge service</span>
                  <span>System: gemini-3.5-flash with maps</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
