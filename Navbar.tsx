import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon, ChevronDown, Sparkles } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onBeginMemory: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({ currentTab, setTab, onBeginMemory, onOpenAuth }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { id: "signature", label: "Signature wreaths" },
    { id: "blueprints", label: "Blueprints" },
    { id: "maker", label: "Maker Studio" },
    { id: "canvas", label: "Artisan Canvas" },
    { id: "locator", label: "Atelier Locator" },
    { id: "bundles", label: "Bundles" },
    { id: "territories", label: "Territories" },
    { id: "drops", label: "Drops" },
    { id: "how", label: "How matching works" },
  ];

  const getInitials = () => {
    if (!user?.displayName) return "U";
    return user.displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F9F7F4]/90 backdrop-blur-md shadow-sm py-3.5 border-b border-ec-gray-200"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab("home");
          }}
          className="font-serif text-2xl font-semibold tracking-wide text-ec-black hover:opacity-90 transition-opacity"
        >
          Mood<span className="text-ec-green">oor</span>
        </a>

        <ul className="hidden xl:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setTab(link.id);
                }}
                className={`text-[13px] font-medium tracking-wide transition-colors ${
                  currentTab === link.id
                    ? "text-ec-green font-semibold"
                    : "text-ec-ink hover:text-ec-green"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          
          {/* User Section (Google Auth / Email Auth / Guest Mode) */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 border border-ec-border hover:border-ec-green rounded-full bg-white transition-all cursor-pointer"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User avatar"}
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-ec-green-pale text-ec-green border border-ec-green-light/20 flex items-center justify-center font-mono text-[10px] font-semibold">
                    {getInitials()}
                  </div>
                )}
                <span className="text-[12px] font-semibold text-ec-black hidden sm:inline truncate max-w-[90px]">
                  {user.displayName || "Artisan"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-ec-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-60 bg-white border border-ec-border rounded-xl shadow-xl p-4 space-y-3.5 z-[60] animate-scale-up">
                  <div className="space-y-1 pb-2.5 border-b border-ec-gray-100">
                    <span className="block text-xs font-bold text-ec-black truncate">
                      {user.displayName || "Atelier Member"}
                    </span>
                    <span className="block text-[10px] text-ec-gray-400 truncate">
                      {user.email}
                    </span>
                    <span className={`inline-flex items-center gap-1 mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      user.isGuest 
                        ? "bg-[#FAF9F6] text-ec-ink border border-ec-border" 
                        : "bg-ec-green-pale text-ec-green border border-ec-green-light/20"
                    }`}>
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                      {user.isGuest ? "Atelier Sandbox Guest" : "Verified Botanist"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 hover:bg-ec-error/5 text-ec-gray-500 hover:text-ec-error text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out Session
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-[12.5px] font-semibold text-ec-ink hover:text-ec-green px-4 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            onClick={onBeginMemory}
            className="text-[13px] font-semibold text-ec-off-white bg-ec-green hover:bg-ec-green-light px-5 py-2.5 rounded-full transition-all hover:scale-103 hover:shadow-md active:scale-98"
          >
            Begin a memory
          </button>
        </div>
      </div>
    </nav>
  );
}

