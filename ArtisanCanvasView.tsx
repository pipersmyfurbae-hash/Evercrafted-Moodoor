import React, { useRef, useState, useEffect } from "react";
import { 
  Wand2, 
  Sparkles, 
  Download, 
  Trash2, 
  RefreshCw, 
  Layers, 
  Upload, 
  Image as ImageIcon, 
  Info, 
  Check, 
  Sliders, 
  History, 
  ArrowRight,
  Eye,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { 
  saveCanvasToFirestore, 
  getCanvasFromFirestore, 
  deleteCanvasFromFirestore 
} from "../lib/dbService";

interface SavedDesign {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  imageSize: string;
  mode: "create" | "edit";
  timestamp: string;
}

export default function ArtisanCanvasView() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageSize, setImageSize] = useState("1K");
  
  // Image to Edit (base64 string)
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Generation status
  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  // Gallery History
  const [gallery, setGallery] = useState<SavedDesign[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch gallery dynamically on user change
  useEffect(() => {
    if (user && !user.isGuest) {
      const fetchHistory = async () => {
        try {
          const firestoreGallery = await getCanvasFromFirestore(user.uid);
          const mappedGallery: SavedDesign[] = firestoreGallery.map(item => ({
            id: item.id,
            url: item.url,
            prompt: item.prompt,
            aspectRatio: item.aspectRatio,
            imageSize: item.imageSize,
            mode: item.mode,
            timestamp: item.createdAt instanceof Date 
              ? item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setGallery(mappedGallery);
        } catch (err) {
          console.error("Error reading Firestore history:", err);
        }
      };
      fetchHistory();
    } else {
      try {
        const stored = localStorage.getItem("moodoor_canvas_gallery");
        setGallery(stored ? JSON.parse(stored) : []);
      } catch {
        setGallery([]);
      }
    }
  }, [user]);

  // Save gallery (only for guests/offline fallback)
  useEffect(() => {
    if (!user || user.isGuest) {
      try {
        localStorage.setItem("moodoor_canvas_gallery", JSON.stringify(gallery));
      } catch (err) {
        console.error("Failed to save gallery:", err);
      }
    }
  }, [gallery, user]);

  // Loading animation message rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const statusPhrases = [
      "Mixing botanical pigments and textures...",
      "Simulating 12-hour polar light projection...",
      "Layering organic faux-stems on grapevine...",
      "Drafting shadows and physical depth details...",
      "Finalizing premium render resolution..."
    ];

    if (generating) {
      let index = 0;
      setStatusMessage(statusPhrases[0]);
      interval = setInterval(() => {
        index = (index + 1) % statusPhrases.length;
        setStatusMessage(statusPhrases[index]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [generating]);

  // Prompt helper preset tags
  const promptPresets = [
    { label: "Signature Wreath", value: "An asymmetrical wild wreath made of preserved weeping cedar, beige roses, and amber berries on a natural grapevine frame" },
    { label: "Winter Hearth", value: "A dense, rich winter fireplace garland containing pinecones, frosted evergreen stems, and copper velvet ribbon" },
    { label: "Moody Editorial", value: "Moody editorial flatlay, cinematic lighting, shadowplay, rustic wooden backdrop, premium details" },
    { label: "Botanical Sketch", value: "Fine detailed antique watercolor botanical sketch on premium tea-stained paper, delicate linen texture" },
    { label: "Eucalyptus Minimalist", value: "Minimalist eucalyptus crescent wreath with raw linen tie, exposed grapevine frame, clean negative space" }
  ];

  const editPresets = [
    { label: "Add Velvet Ribbon", value: "Add a lush, heavy toffee velvet ribbon tied in a loose bow at the 6:00 bottom clock position" },
    { label: "Replace with Peonies", value: "Replace the cream rosebuds with deep burgundy faux peonies" },
    { label: "frosted dusting", value: "Apply a subtle, realistic layer of morning frost and crystalline snow on the evergreen leaves" },
    { label: "warmer lighting", value: "Make the scene dramatically warmer, with rich golden hour sunlight streaming in from the left" }
  ];

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please provide a valid image file.");
      return;
    }
    setSourceFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSourceImage(event.target.result as string);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Run the generation/edit
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMsg("A prompt is required to let the botanical director work.");
      return;
    }

    if (mode === "edit" && !sourceImage) {
      setErrorMsg("Please upload a base image before requesting botanical evolution edits.");
      return;
    }

    setGenerating(true);
    setErrorMsg(null);
    setGeneratedImage(null);
    setIsFallback(false);

    try {
      const endpoint = mode === "create" ? "/api/generate-image" : "/api/edit-image";
      const payload = mode === "create"
        ? { prompt, aspectRatio, imageSize }
        : { prompt, image: sourceImage, aspectRatio, imageSize };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Botanical core service returned an unexpected status.");
      }

      const data = await res.json();
      if (data.image) {
        setGeneratedImage(data.image);
        setIsFallback(!!data.isFallback);
        if (data.error) {
          setErrorMsg(data.error); // Show friendly warning if we hit fallback
        }

        let finalId = Math.random().toString(36).substring(2, 9);
        if (user && !user.isGuest) {
          try {
            finalId = await saveCanvasToFirestore(user.uid, data.image, prompt, aspectRatio, imageSize, mode);
          } catch (firestoreErr) {
            console.error("Firestore persistence warning:", firestoreErr);
          }
        }

        // Add to local history gallery
        const newItem: SavedDesign = {
          id: finalId,
          url: data.image,
          prompt,
          aspectRatio,
          imageSize,
          mode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setGallery(prev => [newItem, ...prev.slice(0, 11)]);
      } else {
        throw new Error(data.error || "No image content retrieved.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during imaging.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (urlStr: string, namePrefix: string) => {
    // If it's a data url or absolute path, we can download it
    const link = document.createElement("a");
    link.href = urlStr;
    link.download = `${namePrefix}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setPrompt("");
    setGeneratedImage(null);
    setSourceImage(null);
    setSourceFileName(null);
    setErrorMsg(null);
    setIsFallback(false);
  };

  const handleDeleteDesign = async (id: string) => {
    if (user && !user.isGuest) {
      try {
        await deleteCanvasFromFirestore(id);
      } catch (err) {
        console.error("Could not delete from Firestore:", err);
      }
    }
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-16">
      
      {/* Premium Studio Header */}
      <header className="space-y-4 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-ec-green bg-ec-green-pale px-3.5 py-1.5 rounded-full border border-ec-green-light/20">
          <Wand2 className="w-3.5 h-3.5 animate-pulse" /> Artisan Imaging Core
        </span>
        <h1 className="text-4xl md:text-6xl text-ec-black tracking-tight leading-none">
          The Artisan <em className="font-script text-ec-green text-3xl md:text-5xl font-normal block mt-2">imaging canvas</em>
        </h1>
        <p className="text-ec-ink font-serif text-lg leading-relaxed italic">
          Draft bespoke designs, visualize materials, or refine existing snapshots. Speak into the canvas with words to compose high-definition botanical representations driven by the Gemini 3.1 imaging system.
        </p>
      </header>

      {/* Main Studio Interactive Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-12 items-start">
        
        {/* Left Column: Form & Config controls */}
        <section className="space-y-8">
          
          {/* Card: Main Designer Panel */}
          <div className="bg-white border border-ec-border rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            
            {/* Mode selection (Create vs Edit) */}
            <div className="flex border-b border-ec-gray-100 pb-1">
              <button
                onClick={() => { setMode("create"); setErrorMsg(null); }}
                className={`pb-4 px-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${
                  mode === "create"
                    ? "border-ec-green text-ec-green"
                    : "border-transparent text-ec-gray-400 hover:text-ec-black"
                }`}
              >
                Botanical Birth (Create)
              </button>
              <button
                onClick={() => { setMode("edit"); setErrorMsg(null); }}
                className={`pb-4 px-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${
                  mode === "edit"
                    ? "border-ec-green text-ec-green"
                    : "border-transparent text-ec-gray-400 hover:text-ec-black"
                }`}
              >
                Botanical Evolution (Edit)
              </button>
            </div>

            {/* Drag & Drop uploader for Edit Mode */}
            {mode === "edit" && (
              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">
                  01: Upload Snapshot to Evolve
                </label>
                
                {sourceImage ? (
                  <div className="relative border border-ec-border rounded-xl p-4 bg-ec-paper/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-white shadow bg-white flex items-center justify-center">
                        <img 
                          src={sourceImage} 
                          alt="Source snapshot" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-ec-black truncate max-w-xs">
                          {sourceFileName || "Uploaded snapshots"}
                        </span>
                        <span className="block text-[9px] text-ec-gray-400 font-mono">Original Baseline Map</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSourceImage(null); setSourceFileName(null); }}
                      className="text-ec-gray-400 hover:text-ec-error p-2 rounded-lg hover:bg-ec-error/5 transition-all"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                      dragActive
                        ? "border-ec-green bg-ec-green-pale/30"
                        : "border-ec-gray-200 hover:border-ec-green-light/50 bg-[#FAF9F6]/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-ec-gray-400">
                      <Upload className="w-5 h-5 text-ec-green" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ec-black">Drag snapshot here or browse files</p>
                      <p className="text-[10px] text-ec-gray-400 mt-1">Supports PNG, JPEG, HEIC up to 20MB</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prompt input field */}
            <div className="space-y-3">
              <label htmlFor="promptInput" className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">
                {mode === "create" ? "01: Describe Botanical Vision" : "02: Describe the evolution or styling edits"}
              </label>
              
              <div className="relative">
                <textarea
                  id="promptInput"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    mode === "create"
                      ? "Describe your luxurious custom wreath in rich sensory terms. E.g., 'An editorial rustic wreath hanging on a neutral stone wall. Lavender, dried wild sage branches, cream rose buds...'"
                      : "Describe modifications. E.g., 'Change the white flowers to golden autumn amber dahlias, and deepen the light contrast...'"
                  }
                  className="w-full min-h-[120px] bg-ec-off-white/40 border border-ec-border focus:border-ec-green rounded-xl p-4 text-xs text-ec-black outline-none resize-none font-serif italic text-[15px]"
                />
              </div>

              {/* Keyword Presets */}
              <div className="space-y-1.5">
                <span className="block text-[9px] uppercase tracking-wider text-ec-gray-400 font-mono">
                  Suggested Artisan Recipes (click to apply)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(mode === "create" ? promptPresets : editPresets).map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setPrompt(preset.value)}
                      className="px-2.5 py-1 text-[10px] bg-ec-off-white hover:bg-ec-green-pale/40 border border-ec-border text-ec-ink rounded-md transition-all font-sans"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Custom Sliders for Image Configuration */}
            <div className="border-t border-ec-gray-100 pt-6 space-y-6">
              <h4 className="font-serif text-md text-ec-black flex items-center gap-2">
                <Sliders className="w-4 h-4 text-ec-green" /> Dimension & Spec Configuration
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Aspect Ratio Selector */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {["1:1", "4:3", "16:9", "3:4", "9:16"].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-2 text-[10.5px] font-mono border rounded-lg text-center transition-all ${
                          aspectRatio === ratio
                            ? "bg-ec-green text-white border-ec-green"
                            : "bg-white text-ec-ink border-ec-border hover:border-ec-green/30"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Resolution Selector */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">
                    Resolution Quality
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {["512px", "1K", "2K", "4K"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size)}
                        className={`py-2 text-[10.5px] font-mono border rounded-lg text-center transition-all ${
                          imageSize === size
                            ? "bg-ec-green text-white border-ec-green"
                            : "bg-white text-ec-ink border-ec-border hover:border-ec-green/30"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Designer controls footer */}
            <div className="border-t border-ec-gray-100 pt-6 flex justify-between items-center flex-wrap gap-4">
              <span className="text-[11px] text-ec-gray-400 font-sans flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-ec-green" />
                Powered by Gemini 3.1 Imaging Preview
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="px-5 py-2.5 rounded-full border border-ec-border hover:bg-ec-error/5 hover:text-ec-error hover:border-ec-error/25 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Reset
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-8 py-3 bg-ec-green hover:bg-ec-green-light text-white text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-2 transition-all hover:scale-103 shadow-md"
                >
                  {generating ? "Imaging..." : `Evolve Canvas`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Card: Pro Tip disclaimer */}
          <div className="bg-[#FAF9F6]/50 border border-ec-border rounded-xl p-5 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-ec-green mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-ec-black uppercase tracking-wider">Secrets Config Notice</h5>
              <p className="text-[11px] text-ec-ink leading-relaxed font-serif italic">
                Artisan Canvas triggers premium GPU model clusters. Ensure your server environment possesses a qualified **GEMINI_API_KEY** under Settings &gt; Secrets to avoid offline rendering.
              </p>
            </div>
          </div>

        </section>

        {/* Right Column: Visual Stage Frame & History Gallery */}
        <section className="space-y-8 lg:sticky lg:top-24">
          
          {/* Card: Main Render Frame container */}
          <div className="bg-white border border-ec-border rounded-2xl p-6 shadow-xl flex flex-col items-center space-y-6 relative overflow-hidden">
            
            <div className="absolute top-4 left-4 font-mono text-[9px] text-ec-gray-400 uppercase tracking-widest">
              Digital Render Frame
            </div>

            {/* Before/After Evolution Toggle for Editing */}
            {mode === "edit" && sourceImage && generatedImage && (
              <div className="absolute top-3 right-4 z-20 flex gap-1.5">
                <button
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onMouseLeave={() => setShowOriginal(false)}
                  className="px-3 py-1 bg-white border border-ec-border shadow-sm text-[9px] uppercase tracking-wider font-semibold text-ec-ink rounded-full flex items-center gap-1 hover:bg-ec-off-white active:scale-95"
                >
                  <Eye className="w-3 h-3 text-ec-green" /> Hold to view original
                </button>
              </div>
            )}

            {/* Render Canvas Frame */}
            <div className="relative w-full aspect-square max-w-sm rounded-xl overflow-hidden bg-ec-off-white border border-ec-border shadow-inner flex items-center justify-center group">
              
              {generating && (
                <div className="absolute inset-0 bg-[#FAF9F6]/95 z-10 flex flex-col items-center justify-center p-8 space-y-6 animate-fade-in">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <span className="absolute inset-0 border-4 border-ec-green-light/20 border-t-ec-green rounded-full animate-spin" />
                    <Sparkles className="w-5 h-5 text-ec-green animate-pulse" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h4 className="font-serif text-lg text-ec-black">Artisan Generator</h4>
                    <p className="text-xs text-ec-gray-400 font-mono animate-pulse">{statusMessage}</p>
                  </div>
                </div>
              )}

              {/* Visualized state: original vs generated */}
              {showOriginal && sourceImage ? (
                <img 
                  src={sourceImage} 
                  alt="Original Canvas" 
                  className="w-full h-full object-cover transition-all"
                  referrerPolicy="no-referrer"
                />
              ) : generatedImage ? (
                <div className="w-full h-full relative">
                  <img 
                    src={generatedImage} 
                    alt="Artisan Generated Composition" 
                    className="w-full h-full object-cover animate-scale-up"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Hover Overlay download */}
                  <div className="absolute inset-0 bg-ec-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleDownload(generatedImage, `moodoor-${mode}`)}
                      className="p-3 bg-white hover:bg-ec-off-white text-ec-green rounded-full transition-all hover:scale-110 shadow"
                      title="Download Render"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <ImageIcon className="w-12 h-12 text-ec-gray-300 mx-auto" />
                  <h4 className="font-serif text-lg text-ec-black">Awaiting Composition</h4>
                  <p className="text-xs text-ec-ink max-w-xs mx-auto leading-relaxed">
                    Set your aspect ratios, formulate your botanical descriptions, and evolved imagery will manifest inside this frame.
                  </p>
                </div>
              )}

              {/* Fallback Notice Indicator */}
              {generatedImage && isFallback && (
                <div className="absolute bottom-3 left-3 right-3 bg-ec-warning/90 backdrop-blur-sm text-white text-[10px] py-1.5 px-3 rounded-lg border border-ec-warning/30 flex items-center gap-1.5 shadow">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Showing offline seeded render (GEMINI_API_KEY inactive)</span>
                </div>
              )}

            </div>

            {/* Generated description caption */}
            {generatedImage && !generating && (
              <div className="text-center space-y-2">
                <p className="text-[10px] font-mono uppercase text-ec-gray-400">
                  {aspectRatio} Aspect Ratio • {imageSize} Scale Preset • {isFallback ? "Offline Seed" : "Gemini GPU"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(generatedImage, `moodoor-${mode}`)}
                    className="px-4 py-2 bg-ec-off-white hover:bg-ec-gray-100 border border-ec-border text-ec-ink rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-ec-green" /> Download PNG
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Card: Saved History / Studio Gallery */}
          <div className="bg-white border border-ec-border rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-serif text-lg text-ec-black flex items-center gap-2">
              <History className="w-4 h-4 text-ec-green" /> Studio Canvas Gallery
            </h4>

            {gallery.length === 0 ? (
              <p className="text-xs text-ec-gray-400 font-serif italic py-2">
                No past renders have been added to the archives yet.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-3 max-h-52 overflow-y-auto pr-2">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setGeneratedImage(item.url);
                      setPrompt(item.prompt);
                      setAspectRatio(item.aspectRatio);
                      setImageSize(item.imageSize);
                      setMode(item.mode);
                    }}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-ec-border cursor-pointer hover:ring-2 hover:ring-ec-green/30 transition-all bg-ec-off-white"
                  >
                    <img 
                      src={item.url} 
                      alt="Archived composition" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-ec-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[9px] font-mono text-white tracking-wider font-semibold">LOAD</span>
                    </div>

                    {/* Single Image Delete Button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleDeleteDesign(item.id);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-white hover:bg-ec-error hover:text-white text-ec-gray-500 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                      title="Delete Render"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {gallery.length > 0 && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to clear your entire rendering history?")) {
                      if (user && !user.isGuest) {
                        // Bulk delete all items in current view from Firestore
                        await Promise.all(
                          gallery.map(async (item) => {
                            try {
                              await deleteCanvasFromFirestore(item.id);
                            } catch (e) {
                              console.error("Could not delete:", item.id, e);
                            }
                          })
                        );
                      } else {
                        localStorage.removeItem("moodoor_canvas_gallery");
                      }
                      setGallery([]);
                    }
                  }}
                  className="text-[10px] font-semibold text-ec-gray-400 hover:text-ec-error uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear History
                </button>
              </div>
            )}

          </div>

        </section>

      </main>

    </div>
  );
}
