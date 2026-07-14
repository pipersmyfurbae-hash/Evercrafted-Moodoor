import React from "react";
import { Sparkles, CalendarRange, Bell, Mail, CheckCircle } from "lucide-react";

export default function DropsView() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "drops-page" })
      });

      if (!res.ok) {
        throw new Error("Unable to register waitlist email.");
      }

      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred registering your address.");
    } finally {
      setLoading(false);
    }
  };

  const dropsList = [
    {
      version: "Drop 02",
      date: "Early July 2026",
      status: "next",
      statusLabel: "Next up",
      title: "High Summer",
      tagline: "Long evenings, screen doors open, nobody checking the time.",
      desc: "A Connection-led drop: paired-cluster compositions in linen whites and deep summer greens, built around porches and tables that stay full past dark. Three finished runs and eight new blueprints.",
      tags: ["Connection", "Comfort", "3 finished runs", "8 blueprints"]
    },
    {
      version: "Drop 03",
      date: "Late August 2026",
      status: "planned",
      statusLabel: "Planned",
      title: "The Turn",
      tagline: "The week summer starts ending and nobody says it out loud.",
      desc: "Seasonal Nostalgia's deep end — early-autumn compositions that bridge the seasons, including the next run of September Porch. The waitlist hears first; the last run sold through in days.",
      tags: ["Seasonal Nostalgia", "Renewal", "September Porch returns"]
    },
    {
      version: "Drop 01",
      date: "June 2026",
      status: "live",
      statusLabel: "Live now",
      title: "The Founding Library",
      tagline: "Sixty designs across all six territories.",
      desc: "The launch collection — every territory mapped, ten designs available finished, and the three founding bundles: Autumn Memories, Gathered Grace, and Legacy Garden.",
      tags: ["All six territories", "60 designs", "3 bundles"]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-24 space-y-20">
      
      {/* Header segment */}
      <header className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ec-green bg-ec-green-pale px-3.5 py-1.5 rounded-full border border-ec-green-light/20">
          Upcoming drops
        </span>
        <h1 className="text-4xl md:text-6xl text-ec-black tracking-tight leading-tight">
          New designs arrive <em className="font-script text-ec-green text-3xl md:text-5xl font-normal block mt-2">in small seasons</em>
        </h1>
        <p className="text-ec-ink font-serif text-lg leading-relaxed italic">
          The library grows deliberately — weekly additions, seasonal collection drops, and finished runs that don't restock until a design's season comes back around.
        </p>
      </header>

      {/* Cadence cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-ec-border p-6 rounded-xl text-center space-y-2">
          <div className="font-serif text-4xl text-ec-green font-light">5–10</div>
          <p className="text-xs text-ec-ink font-sans">
            new designs join the library every week, each one storied and profiled
          </p>
        </div>
        <div className="bg-white border border-ec-border p-6 rounded-xl text-center space-y-2">
          <div className="font-serif text-4xl text-ec-green font-light">Seasonal</div>
          <p className="text-xs text-ec-ink font-sans">
            collection drops a few times a season — three designs, one thread
          </p>
        </div>
        <div className="bg-white border border-ec-border p-6 rounded-xl text-center space-y-2">
          <div className="font-serif text-4xl text-ec-green font-light">Runs of 5</div>
          <p className="text-xs text-ec-ink font-sans">
            finished wreaths per design; sold through means resting, not restocked
          </p>
        </div>
      </section>

      {/* Drops Timeline List */}
      <section className="divide-y divide-ec-border border-t border-b border-ec-border py-4">
        {dropsList.map((drop, idx) => {
          return (
            <article key={idx} className="grid grid-cols-1 md:grid-cols-[170px,1fr] gap-6 md:gap-12 py-10 items-start">
              
              {/* Date details */}
              <div className="space-y-1 font-mono text-[11px] text-ec-gray-500">
                <span className="block text-ec-black font-serif italic text-2xl font-normal not-mono">
                  {drop.version}
                </span>
                <span>{drop.date}</span>
                <div className="pt-2">
                  <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                    drop.status === "next" ? "bg-ec-warning/10 text-ec-warning border border-ec-warning/20 animate-pulse" :
                    drop.status === "planned" ? "bg-ec-gray-100 text-ec-gray-500 border border-ec-border" :
                    "bg-ec-green-pale text-ec-green border border-ec-green-light/20"
                  }`}>
                    {drop.statusLabel}
                  </span>
                </div>
              </div>

              {/* Copy content */}
              <div className="space-y-3">
                <h3 className="font-serif text-2xl md:text-3xl text-ec-black leading-none">
                  {drop.title}
                </h3>
                <p className="font-serif italic text-sm text-ec-ink">
                  {drop.tagline}
                </p>
                <p className="text-xs text-ec-ink leading-relaxed max-w-xl">
                  {drop.desc}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {drop.tags.map((t, tIdx) => (
                    <span 
                      key={tIdx} 
                      className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full ${
                        t.includes("finished") || t.includes("returns")
                          ? "bg-ec-warning/10 text-ec-warning border border-ec-warning/20"
                          : "bg-ec-green-pale text-ec-green border border-ec-green-light/10"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

            </article>
          );
        })}
      </section>

      {/* functional Waitlist Box */}
      <section id="waitlist" className="bg-ec-green-pale/40 border border-ec-green-light/20 rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ec-green flex items-center gap-1.5 justify-center">
            <Bell className="w-4 h-4 text-ec-green animate-bounce" /> The Drop Waitlist Ledger
          </span>
          <h2 className="text-3xl text-ec-black tracking-tight leading-none">
            Hear it first, <em className="font-script text-ec-green text-3xl font-normal block sm:inline">every time</em>
          </h2>
          <p className="text-xs text-ec-ink leading-relaxed max-w-md mx-auto">
            Drop announcements arrive a few days early for the waitlist ledger — which matters most for finished physical runs of five and returning seasonal designs.
          </p>
        </div>

        {success ? (
          <div className="animate-fade-in p-6 bg-white border border-ec-green-light/30 rounded-xl max-w-md mx-auto flex flex-col items-center space-y-2">
            <CheckCircle className="w-8 h-8 text-ec-green" />
            <h4 className="font-serif text-lg text-ec-black">You are on the list</h4>
            <p className="text-[11px] text-ec-ink leading-relaxed">
              We've registered your confirm credentials in our ledger. The next collection announcement will reach your inbox first.
            </p>
          </div>
        ) : (
          <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 bg-white p-1.5 border border-ec-border rounded-full focus-within:ring-4 focus-within:ring-ec-green-dim transition-all shadow-md">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="evelyn@example.com"
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-ec-black placeholder:text-ec-gray-400"
              aria-label="Email Address"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-ec-green hover:bg-ec-green-light text-white font-semibold py-3 px-6 rounded-full text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join list"}
            </button>
          </form>
        )}

        {error && (
          <p className="text-xs text-ec-error">{error}</p>
        )}

        <p className="text-[10px] text-ec-gray-500 font-sans">
          No noise. Drop announcements and the occasional story behind a design.
        </p>
      </section>

    </div>
  );
}
