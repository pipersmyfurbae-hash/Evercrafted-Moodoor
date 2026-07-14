import React from "react";
import { X, ShoppingBag, Download, AlertTriangle, Sparkles, Check, Heart, ShieldCheck, Lock } from "lucide-react";
import { WreathDesign } from "../types";

interface WreathDetailModalProps {
  wreath: WreathDesign | null;
  onClose: () => void;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}

// Function to render custom SVGs matching the design models of each wreath type
export function renderWreathSVG(svgPath: string, sizeClass = "w-48 h-48") {
  switch (svgPath) {
    case "september-porch":
      return (
        <svg viewBox="0 0 140 140" fill="none" className={sizeClass}>
          <circle cx="70" cy="70" r="50" stroke="#8A7458" strokeWidth="2" opacity=".55" strokeDasharray="22 7 14 5"/>
          <circle cx="68" cy="72" r="47" stroke="#A8916F" strokeWidth="1.5" opacity=".45" strokeDasharray="16 8"/>
          <g transform="translate(40,40)">
            <circle r="14" fill="#F2EFE9" stroke="#4A6741" strokeWidth="1.3"/>
            <circle cx="18" cy="9" r="9" fill="#EEF2ED" stroke="#6B8F67" strokeWidth="1.1"/>
          </g>
          <circle cx="100" cy="100" r="8" fill="#EEF2ED" stroke="#4A6741" strokeWidth="1.1"/>
          <path d="M32 34 C22 26 16 18 14 8" stroke="#6B8F67" strokeWidth="1.3"/>
          <circle cx="92" cy="38" r="3.5" fill="#C4922A" opacity=".8"/>
        </svg>
      );
    case "cider-house":
      return (
        <svg viewBox="0 0 140 140" fill="none" className={sizeClass}>
          <circle cx="70" cy="70" r="50" stroke="#A8916F" strokeWidth="2" opacity=".55" strokeDasharray="16 6 26 5"/>
          <g transform="translate(96,46)">
            <circle r="13" fill="#F2EFE9" stroke="#C4922A" strokeWidth="1.2"/>
            <circle cx="-16" cy="10" r="8" fill="#F9F7F4" stroke="#4A6741" strokeWidth="1.1"/>
          </g>
          <circle cx="44" cy="98" r="9" fill="#EEF2ED" stroke="#6B8F67" strokeWidth="1.1"/>
          <path d="M106 38 C116 30 122 22 124 12" stroke="#6B8F67" strokeWidth="1.3"/>
          <circle cx="52" cy="86" r="3.5" fill="#C4922A" opacity=".8"/>
          <circle cx="60" cy="92" r="2.5" fill="#C4922A" opacity=".7"/>
        </svg>
      );
    case "kept-letters":
      return (
        <svg viewBox="0 0 100 100" fill="none" className={sizeClass}>
          <circle cx="50" cy="50" r="36" stroke="#4A6741" strokeWidth="1" strokeDasharray="6 4"/>
          <circle cx="50" cy="74" r="7" fill="#F9F7F4" stroke="#4A6741" strokeWidth="1"/>
          <circle cx="32" cy="40" r="4.5" fill="#F2EFE9" stroke="#6B8F67" strokeWidth=".9"/>
          <circle cx="65" cy="42" r="4" fill="#F9F7F4" stroke="#4A6741" strokeWidth=".8"/>
        </svg>
      );
    case "last-bonfire":
      return (
        <svg viewBox="0 0 100 100" fill="none" className={sizeClass}>
          <circle cx="50" cy="50" r="36" stroke="#4A6741" strokeWidth="1" strokeDasharray="4 3"/>
          <circle cx="66" cy="64" r="8" fill="#EEF2ED" stroke="#4A6741" strokeWidth="1"/>
          <circle cx="36" cy="34" r="4.5" fill="#F2EFE9" stroke="#C4922A" strokeWidth=".9"/>
          <circle cx="45" cy="72" r="3.5" fill="#C4922A" stroke="#C4922A" strokeWidth=".8"/>
        </svg>
      );
    case "linen-cedar":
      return (
        <svg viewBox="0 0 140 140" fill="none" className={sizeClass}>
          <circle cx="70" cy="70" r="50" stroke="#8A7458" strokeWidth="2" opacity=".5" strokeDasharray="28 6 12 5"/>
          <g transform="translate(44,92)">
            <circle r="13" fill="#fff" stroke="#4A6741" strokeWidth="1.3"/>
            <circle cx="17" cy="-8" r="8" fill="#EEF2ED" stroke="#6B8F67" strokeWidth="1.1"/>
          </g>
          <circle cx="98" cy="44" r="7" fill="#F9F7F4" stroke="#4A6741" strokeWidth="1"/>
          <path d="M34 102 C24 110 18 118 16 128" stroke="#6B8F67" strokeWidth="1.3"/>
        </svg>
      );
    case "quiet-hearth":
      return (
        <svg viewBox="0 0 140 140" fill="none" className={sizeClass}>
          <circle cx="70" cy="70" r="50" stroke="#A8916F" strokeWidth="2" opacity=".5" strokeDasharray="20 7 16 4"/>
          <g transform="translate(70,104)">
            <circle r="14" fill="#F2EFE9" stroke="#4A6741" strokeWidth="1.3"/>
            <circle cx="-19" cy="-5" r="8" fill="#fff" stroke="#6B8F67" strokeWidth="1.1"/>
            <circle cx="18" cy="-7" r="7" fill="#EEF2ED" stroke="#4A6741" strokeWidth="1"/>
          </g>
          <path d="M50 96 C40 88 34 80 32 70" stroke="#6B8F67" strokeWidth="1.2"/>
        </svg>
      );
    case "sunday-bread":
      return (
        <svg viewBox="0 0 100 100" fill="none" className={sizeClass}>
          <circle cx="50" cy="50" r="36" stroke="#4A6741" strokeWidth="1" strokeDasharray="6 4"/>
          <circle cx="62" cy="58" r="7" fill="#F9F7F4" stroke="#4A6741" strokeWidth="1"/>
          <circle cx="40" cy="36" r="5" fill="#EEF2ED" stroke="#6B8F67" strokeWidth=".9"/>
        </svg>
      );
    case "first-light":
      return (
        <svg viewBox="0 0 140 140" fill="none" className={sizeClass}>
          <circle cx="70" cy="70" r="50" stroke="#8A7458" strokeWidth="2" opacity=".5" strokeDasharray="14 5 24 6"/>
          <g transform="translate(54,38)">
            <circle r="13" fill="#fff" stroke="#C4922A" strokeWidth="1.2"/>
            <circle cx="18" cy="8" r="8" fill="#EEF2ED" stroke="#6B8F67" strokeWidth="1.1"/>
          </g>
          <circle cx="96" cy="98" r="7" fill="#F9F7F4" stroke="#4A6741" strokeWidth="1"/>
          <path d="M44 28 C36 18 32 10 30 2" stroke="#6B8F67" strokeWidth="1.3"/>
          <circle cx="84" cy="32" r="3" fill="#C4922A" opacity=".8"/>
        </svg>
      );
    case "gathered-grace":
      return (
        <svg viewBox="0 0 140 140" fill="none" className={sizeClass}>
          <circle cx="70" cy="70" r="50" stroke="#A8916F" strokeWidth="2" opacity=".55" strokeDasharray="24 6 14 5"/>
          <g transform="translate(92,88)">
            <circle r="15" fill="#F2EFE9" stroke="#C4922A" strokeWidth="1.3"/>
            <circle cx="-20" cy="-6" r="9" fill="#fff" stroke="#4A6741" strokeWidth="1.1"/>
          </g>
          <circle cx="42" cy="44" r="8" fill="#EEF2ED" stroke="#6B8F67" strokeWidth="1.1"/>
          <path d="M104 100 C114 110 120 118 122 128" stroke="#6B8F67" strokeWidth="1.3"/>
        </svg>
      );
    case "legacy-garden":
      return (
        <svg viewBox="0 0 140 140" fill="none" className={sizeClass}>
          <circle cx="70" cy="70" r="50" stroke="#8A7458" strokeWidth="1.8" opacity=".5" strokeDasharray="30 8"/>
          <g transform="translate(48,52)">
            <path d="M0,-16 C7,-8 7,8 0,16 C-7,8 -7,-8 0,-16Z" stroke="#4A6741" strokeWidth="1.2" fill="#F9F7F4"/>
            <circle cx="16" cy="12" r="8" fill="#EEF2ED" stroke="#6B8F67" strokeWidth="1"/>
          </g>
          <circle cx="96" cy="96" r="6" fill="#F2EFE9" stroke="#4A6741" strokeWidth="1"/>
        </svg>
      );
    case "white-hour":
      return (
        <svg viewBox="0 0 140 140" fill="none" className={sizeClass}>
          <circle cx="70" cy="70" r="50" stroke="#A8916F" strokeWidth="1.8" opacity=".5" strokeDasharray="26 9"/>
          <g transform="translate(86,48)">
            <circle r="12" fill="#fff" stroke="#4A4A4A" strokeWidth="1.1"/>
            <circle cx="-15" cy="9" r="7" fill="#F9F7F4" stroke="#4A6741" strokeWidth="1"/>
          </g>
          <path d="M96 38 C104 30 109 22 111 13" stroke="#6B8F67" strokeWidth="1.1" opacity=".8"/>
        </svg>
      );
    case "long-table":
      return (
        <svg viewBox="0 0 140 140" fill="none" className={sizeClass}>
          <circle cx="70" cy="70" r="50" stroke="#8A7458" strokeWidth="2" opacity=".5" strokeDasharray="18 6 24 5"/>
          <g transform="translate(46,58)">
            <circle r="12" fill="#EEF2ED" stroke="#4A6785" strokeWidth="1.2"/>
          </g>
          <g transform="translate(74,76)">
            <circle r="12" fill="#F9F7F4" stroke="#4A6741" strokeWidth="1.2"/>
          </g>
          <path d="M36 50 C28 42 23 34 21 25" stroke="#6B8F67" strokeWidth="1.2"/>
        </svg>
      );
    case "green-morning":
      return (
        <svg viewBox="0 0 140 140" fill="none" className={sizeClass}>
          <circle cx="70" cy="70" r="50" stroke="#A8916F" strokeWidth="2" opacity=".5" strokeDasharray="22 6 16 5"/>
          <path d="M40 100 C40 70 58 50 90 46" stroke="#6B8F67" strokeWidth="1.6"/>
          <ellipse cx="60" cy="72" rx="8" ry="3.4" transform="rotate(-46 60 72)" fill="#6B8F67" opacity=".7"/>
          <circle cx="64" cy="33" r="5.5" fill="#EEF2ED" stroke="#4A6741" strokeWidth=".9"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" fill="none" className={sizeClass}>
          <circle cx="50" cy="50" r="36" stroke="#4A6741" strokeWidth="1.5" strokeDasharray="5 4"/>
          <circle cx="50" cy="50" r="28" stroke="#6B8F67" strokeWidth="1" strokeDasharray="3 2"/>
        </svg>
      );
  }
}

export default function WreathDetailModal({ wreath, onClose, isFavorited, onToggleFavorite }: WreathDetailModalProps) {
  const [purchaseType, setPurchaseType] = React.useState<"finished" | "blueprint">("finished");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMsg, setSuccessMessage] = React.useState<string | null>(null);
  
  // Checkout details
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: ""
  });

  if (!wreath) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (purchaseType === "finished") {
        setSuccessMessage(`Thank you, ${formData.name}. Since Moodoor operates in strictly limited physical runs of five, your reservation for a hand-crafted finished "${wreath.name}" has been placed in our review ledger. We will confirm your details at ${formData.email} shortly.`);
      } else {
        setSuccessMessage(`Your digital blueprint files (SVG blueprints, clock-placement templates, and materials lists) for the "${wreath.name}" have been generated and sent to ${formData.email}. Start building your botanical memory at your own pace.`);
      }
    }, 1500);
  };

  // Convert fractional vector keys to display titles
  const vectorList = [
    { key: "warmth", label: "Warmth", desc: "Emotional temperature" },
    { key: "energy", label: "Energy", desc: "Arousal and movement" },
    { key: "nostalgia", label: "Nostalgia", desc: "Pull toward the past" },
    { key: "valence", label: "Valence", desc: "Brightness of feeling" },
    { key: "intimacy", label: "Intimacy", desc: "Closeness of circle" },
    { key: "restraint", label: "Restraint", desc: "Composure and quiet" },
    { key: "seasonal", label: "Seasonal affinity", desc: "Anchoring to season" }
  ];

  const hasStock = wreath.remainingFinished > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ec-charcoal/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Drawer */}
      <div className="relative w-full max-w-4xl h-full bg-ec-off-white shadow-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden z-10 animate-slide-in">
        
        {/* Close Button on Mobile (absolute top-right) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:right-auto md:left-4 z-20 w-10 h-10 rounded-full bg-white/80 border border-ec-gray-200 hover:border-ec-green flex items-center justify-center text-ec-charcoal transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Dialog overlay */}
        {successMsg && (
          <div className="absolute inset-0 bg-ec-off-white/95 z-40 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-ec-green-pale border border-ec-green-light rounded-full flex items-center justify-center text-ec-green mb-6 animate-scale-up">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-serif text-3xl text-ec-black mb-4">Belongs to you</h3>
            <p className="max-w-md text-ec-ink text-[15.5px] leading-relaxed mb-8">
              {successMsg}
            </p>
            <button
              onClick={() => {
                setSuccessMessage(null);
                onClose();
              }}
              className="px-6 py-2.5 rounded-full bg-ec-green hover:bg-ec-green-light text-white text-xs font-semibold tracking-wider transition-all hover:scale-103 active:scale-97"
            >
              Close details
            </button>
          </div>
        )}

        {/* LEFT COLUMN: VISUAL REPRESENTATION & STORY CARD (or scrolling top on mobile) */}
        <div className="w-full md:w-[45%] border-r border-ec-border flex flex-col h-full overflow-y-auto bg-white">
          <div className="relative flex-1 flex flex-col items-center justify-center p-8 pt-16 min-h-[300px]">
            {/* Top Stats */}
            <div className="absolute top-4 left-16 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-ec-green bg-ec-green-pale px-3 py-1 rounded-full border border-ec-green-light/20">
                {wreath.territoryName}
              </span>
              <span className="text-[10px] font-mono text-ec-gray-500">
                {wreath.id}
              </span>
            </div>

            <button
              onClick={() => onToggleFavorite(wreath.id)}
              className="absolute top-4 right-4 md:right-4 text-ec-ink hover:text-red-500 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
            </button>

            {/* Render the core SVG model */}
            <div className="my-6 hover:rotate-2 transition-transform duration-500">
              {renderWreathSVG(wreath.svgPath, "w-64 h-64 md:w-72 md:h-72 drop-shadow-xl")}
            </div>

            {/* Material specs */}
            <div className="w-full text-center px-4 mb-4">
              <p className="text-xs font-mono text-ec-gray-500">
                {wreath.size} • {wreath.totalStems} stems • polar polar-grid template
              </p>
            </div>
          </div>

          {/* EVS Vector horizontal barchart */}
          <div className="p-6 bg-ec-off-white border-t border-ec-border">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-ec-green mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> EVS Emotional Coordinates
            </h4>
            <div className="space-y-3">
              {vectorList.map((item) => {
                const val = (wreath.vector as any)[item.key];
                return (
                  <div key={item.key} className="text-xs">
                    <div className="flex justify-between text-ec-ink mb-1">
                      <span>
                        <span className="font-medium text-ec-black">{item.label}</span>{" "}
                        <span className="text-[10px] text-ec-gray-500">({item.desc})</span>
                      </span>
                      <span className="font-mono text-ec-green font-semibold">{(val).toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-ec-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-ec-green-light to-ec-green rounded-full transition-all duration-1000"
                        style={{ width: `${val * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL TEXT & TRANSACTION PANEL */}
        <div className="w-full md:w-[55%] flex flex-col h-full overflow-y-auto">
          <div className="p-8 md:p-12 flex-1 space-y-8">
            <div>
              <span className="text-xs font-serif italic text-ec-ink">{wreath.tagline}</span>
              <h2 className="text-4xl text-ec-black mt-2 tracking-tight">{wreath.name}</h2>
              <p className="text-sm text-ec-ink mt-4 leading-relaxed font-serif text-[17px] italic">
                {wreath.description}
              </p>
            </div>

            {/* Physical layout bullets */}
            <div className="space-y-3 border-t border-b border-ec-border py-6">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-ec-green">
                Placement &amp; Geometry
              </h4>
              <ul className="grid gap-2">
                {wreath.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex gap-3 text-xs text-ec-ink items-start">
                    <div className="w-4 h-1 px-1.5 bg-ec-green-light mt-1.5 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing Selection */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-ec-green">
                Choose Form
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Finished option */}
                <button
                  type="button"
                  onClick={() => { if (hasStock) setPurchaseType("finished"); }}
                  disabled={!hasStock}
                  className={`relative p-5 border rounded-xl text-left transition-all flex flex-col justify-between ${
                    !hasStock 
                      ? "opacity-50 cursor-not-allowed bg-ec-gray-100 border-ec-gray-200" 
                      : purchaseType === "finished"
                        ? "border-ec-green bg-ec-green-pale/40 ring-2 ring-ec-green/20"
                        : "border-ec-border bg-white hover:border-ec-green-light"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-ec-black flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" /> Finished Wreath
                      </span>
                      {hasStock && (
                        <span className="text-[10px] font-mono text-ec-warning bg-ec-warning/10 border border-ec-warning/20 px-2 py-0.5 rounded-full">
                          {wreath.remainingFinished} of 5 left
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ec-gray-500 mt-1">
                      {hasStock 
                        ? "Artisan-crafted 1:1, exposed grapevine, premium silk blooms. Arrives finished."
                        : "Limited physical run of 5 fully sold through. Blueprint option remains buildable."}
                    </p>
                  </div>
                  <div className="text-2xl font-serif text-ec-green mt-4 font-semibold">
                    ${wreath.priceFinished}
                  </div>
                </button>

                {/* Blueprint option */}
                <button
                  type="button"
                  onClick={() => setPurchaseType("blueprint")}
                  className={`p-5 border rounded-xl text-left transition-all flex flex-col justify-between ${
                    purchaseType === "blueprint"
                      ? "border-ec-green bg-ec-green-pale/40 ring-2 ring-ec-green/20"
                      : "border-ec-border bg-white hover:border-ec-green-light"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-ec-black flex items-center gap-1.5">
                        <Download className="w-4 h-4" /> Digital Blueprint
                      </span>
                      <span className="text-[10px] font-mono text-ec-green bg-ec-green-pale px-2 py-0.5 rounded-full border border-ec-green-light/20">
                        Instant
                      </span>
                    </div>
                    <p className="text-xs text-ec-gray-500 mt-1">
                      High-res SVG grid map, full materials list with substitutions, and clock-placement guidebook.
                    </p>
                  </div>
                  <div className="text-2xl font-serif text-ec-green mt-4 font-semibold">
                    ${wreath.priceBlueprint}
                  </div>
                </button>
              </div>
            </div>

            {/* Checkout Ledger Form */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 bg-ec-gray-100 p-6 rounded-xl border border-ec-gray-200">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-ec-green flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Checkout Ledger
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-ec-gray-500 mb-1">Full name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Evelyn Carter"
                    className="w-full bg-white border border-ec-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ec-green"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-ec-gray-500 mb-1">Email address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="evelyn@example.com"
                    className="w-full bg-white border border-ec-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ec-green"
                  />
                </div>
              </div>

              {purchaseType === "finished" && (
                <div className="animate-fade-in space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-ec-gray-500 mb-1">Shipping address</label>
                    <input
                      type="text"
                      name="address"
                      required={purchaseType === "finished"}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="124 Olive Branch Way"
                      className="w-full bg-white border border-ec-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ec-green"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-ec-gray-500 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        required={purchaseType === "finished"}
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Portland"
                        className="w-full bg-white border border-ec-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ec-green"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold text-ec-gray-500 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        name="zip"
                        required={purchaseType === "finished"}
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="97201"
                        className="w-full bg-white border border-ec-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ec-green"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-ec-green hover:bg-ec-green-light text-white font-semibold py-3 rounded-full text-sm mt-4 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
              >
                {isSubmitting 
                  ? "Verifying composition ledger..." 
                  : purchaseType === "finished" 
                    ? `Reserve Finished Wreath ($${wreath.priceFinished})` 
                    : `Acquire Digital Recipe ($${wreath.priceBlueprint})`
                }
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

function successText(name: string, pType: string): string {
  if (pType === "finished") {
    return `We have successfully recorded your reservation for a physical '${name}' wreath. Our makers will review the registry entries and verify secure packaging details. A invoice receipt has been recorded on the ledger.`;
  } else {
    return `Your request for the digital '${name}' blueprint has been registered on the server. Your files have been packaged into a unified vector package and dispatched to your email ledger for download.`;
  }
}
