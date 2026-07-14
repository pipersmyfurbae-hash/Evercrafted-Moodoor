import React from "react";
import { Sparkles, Activity, ShieldCheck, Heart, Trash2, ArrowRight } from "lucide-react";

interface HowViewProps {
  onBeginMemory: () => void;
}

export default function HowView({ onBeginMemory }: HowViewProps) {
  const steps = [
    {
      num: "01",
      title: "You write the memory",
      desc: "A porch, a person, a season, a year. Write it the way you'd tell a friend — a sentence is enough, a paragraph is better. There are no wrong answers and no design vocabulary required.",
      demo: "Sunday mornings at my grandmother's lake house, the summer before we sold it."
    },
    {
      num: "02",
      title: "The feeling gets read",
      desc: "Our Emotional Vector System scores the memory on seven dimensions — how warm it is, how quiet, how time-soaked, how close to the chest. This is the one step where AI is involved, and it does exactly one job: interpret the feeling.",
      demo: "warmth 0.79 • nostalgia 0.94 • intimacy 0.81 • valence 0.62 • restraint 0.55 • energy 0.33 • seasonal 0.71",
      tagline: "Honest note: the AI never chooses your wreath. It only translates words into the seven numbers above."
    },
    {
      num: "03",
      title: "The library is ranked",
      desc: "Every design in the library was profiled on the same seven dimensions when it was curated. Your memory's profile is compared against all sixty using a fixed, published formula. The same memory always produces the same matches — nothing is random, nothing is 'personalized' behind your back."
    },
    {
      num: "04",
      title: "The reveal",
      desc: "You see your top matches, each with its story, its emotional profile, and the choice that makes Moodoor different: order it finished from a small numbered run, or download the exact blueprint and build it yourself."
    }
  ];

  const dimensions = [
    { name: "Warmth", subtitle: "emotional temperature", desc: "The tenderness in the memory — its glow.", zero: "clinical, cold", one: "a kitchen in winter" },
    { name: "Energy", subtitle: "arousal level", desc: "Whether the memory sits still or moves.", zero: "perfect stillness", one: "a full house, music on" },
    { name: "Nostalgia", subtitle: "pull toward the past", desc: "How time-soaked the memory is. The strongest signal in most memories people share.", zero: "entirely present-tense", one: "aching for then" },
    { name: "Valence", subtitle: "positivity", desc: "The brightness of the feeling. Grief can run high on nostalgia and low here — the system keeps them separate on purpose.", zero: "grief, loss", one: "uncomplicated joy" },
    { name: "Intimacy", subtitle: "closeness of the circle", desc: "Whether the memory belongs to a crowd or to two people on a porch.", zero: "public, anonymous", one: "between two, or one" },
    { name: "Restraint", subtitle: "quietness", desc: "How composed the feeling is. Not the opposite of energy — a wedding toast can be loud and held at once.", zero: "loud, exuberant", one: "hushed, composed" },
    { name: "Seasonal affinity", subtitle: "anchoring to a season", desc: "How inseparable the memory is from its time of year — Octobers you can smell, Decembers with a temperature.", zero: "could be any month", one: "is its season" }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-24 space-y-24">
      
      {/* Header */}
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-ec-green bg-ec-green-pale px-3.5 py-1.5 rounded-full">
          How matching works
        </span>
        <h1 className="text-4xl md:text-6xl text-ec-black tracking-tight leading-tight">
          Three designs that <em className="font-script text-ec-green text-3xl md:text-5xl font-normal block mt-2">belong together</em>
        </h1>
        <p className="text-ec-ink font-serif text-lg leading-relaxed max-w-lg mx-auto">
          Blueprint sets curated around a single emotional thread — shared palette, shared movement, three distinct silhouettes. One story, told three ways through a home.
        </p>
      </header>

      {/* Step by Step Timeline */}
      <section className="space-y-12">
        <div className="border-l-2 border-ec-green/20 pl-6 md:pl-10 space-y-16">
          {steps.map((step, idx) => (
            <div key={idx} className="relative space-y-3">
              {/* Floating Step Badge */}
              <div className="absolute -left-12 md:-left-16 top-0 w-8 h-8 rounded-full bg-white border-2 border-ec-green flex items-center justify-center font-serif text-sm italic text-ec-green font-semibold">
                {step.num}
              </div>
              <h3 className="font-serif text-2xl text-ec-black">{step.title}</h3>
              <p className="text-sm text-ec-ink max-w-2xl leading-relaxed">{step.desc}</p>
              
              {step.demo && (
                <div className="p-4 bg-white border border-ec-border rounded-xl font-mono text-xs text-ec-ink max-w-xl">
                  {step.demo}
                </div>
              )}

              {step.tagline && (
                <p className="text-xs text-ec-gray-500 italic border-l-2 border-ec-green-light pl-3 max-w-xl">
                  {step.tagline}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Seven Dimensions details */}
      <section className="space-y-12 bg-ec-paper/30 p-8 md:p-12 rounded-2xl border border-ec-border">
        <div className="space-y-3 max-w-xl">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-ec-green">
            The Dimensions Grid
          </span>
          <h2 className="text-3xl text-ec-black">What the system actually listens for</h2>
          <p className="text-xs text-ec-ink font-sans">
            Each scale runs from 0.00 to 1.00. Together, they form a memory's unique vector fingerprint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dimensions.map((dim, idx) => (
            <div key={idx} className="bg-white border border-ec-border p-6 rounded-xl space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-baseline">
                <h4 className="font-serif text-xl text-ec-black font-semibold">{dim.name}</h4>
                <span className="text-[10px] font-mono uppercase text-ec-gray-500">{dim.subtitle}</span>
              </div>
              <p className="text-xs text-ec-ink leading-relaxed">{dim.desc}</p>
              <div className="flex justify-between items-center text-[10px] font-mono text-ec-gray-500 pt-3 border-t border-ec-gray-100">
                <span>0.00 — {dim.zero}</span>
                <span>1.00 — {dim.one}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy and Trust Agreement */}
      <section className="bg-ec-charcoal text-ec-paper p-8 md:p-12 rounded-2xl relative overflow-hidden space-y-8">
        <div className="absolute inset-0 bg-gradient-to-br from-ec-green/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-xl">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ec-green-light">
            Data Trust Agreement
          </span>
          <h2 className="text-3xl text-ec-white">You are trusting us with something personal. Here is our end of it.</h2>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/10">
          <div className="space-y-2">
            <h4 className="font-serif text-lg text-ec-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-ec-green-light" /> Used for matching, full stop
            </h4>
            <p className="text-xs text-ec-gray-300 leading-relaxed">
              Your memory and its vector profile are analyzed solely to fetch matches, improve quality, and return results. Your text is never published or exposed.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-lg text-ec-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-ec-green-light" /> It trains absolutely nothing
            </h4>
            <p className="text-xs text-ec-gray-300 leading-relaxed">
              Your words are never used to train neural weights or generic generative models. It is processed once, scored, and the session is cleared.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-lg text-ec-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-ec-green-light" /> We forget on demand
            </h4>
            <p className="text-xs text-ec-gray-300 leading-relaxed">
              Just write us an email, and your memory, vectors, and session ID are immediately erased from the host logs. The wreath remains yours.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-lg text-ec-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ec-green-light" /> Inspectable arithmetic
            </h4>
            <p className="text-xs text-ec-gray-300 leading-relaxed">
              Our Euclidean distance formulas are completely transparent. If you ever ask, we will supply the exact distance math behind any matched score.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="text-center space-y-4 pt-12 border-t border-ec-border">
        <h3 className="font-serif text-3xl text-ec-black">The explanation is over. <em className="font-script text-ec-green text-3xl font-normal">The memory is yours.</em></h3>
        <button
          onClick={onBeginMemory}
          className="inline-flex items-center gap-2 bg-ec-green hover:bg-ec-green-light text-white font-semibold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all hover:scale-103 active:scale-97"
        >
          Begin a memory
        </button>
      </div>

    </div>
  );
}
