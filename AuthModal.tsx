import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Mail, Lock, User as UserIcon, Sparkles, AlertCircle, Chrome } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signInAsGuest, error: authError } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLocalError(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      // Friendly message handled by context, but we display local warning
      if (err.code === "auth/popup-blocked") {
        setLocalError("Your browser blocked the sign-in popup. Please allow popups or use Guest Mode below.");
      } else {
        setLocalError(err.message || "Failed to authenticate.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError("Please fill in all credentials.");
      return;
    }
    if (isSignUp && !name) {
      setLocalError("Please enter your name to register.");
      return;
    }

    setLoading(true);
    setLocalError(null);
    try {
      await signInWithEmail(email, password, isSignUp, name);
      onClose();
    } catch (err: any) {
      setLocalError(err.message || "Credential authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setLocalError("Please enter a guest nickname.");
      return;
    }
    signInAsGuest(guestName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ec-black/60 backdrop-blur-sm"
      />

      {/* Main Auth Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white w-full max-w-md border border-ec-border rounded-2xl shadow-2xl overflow-hidden z-10 p-6 md:p-8 space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ec-gray-400 hover:text-ec-black rounded-full hover:bg-ec-off-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-ec-green bg-ec-green-pale px-3 py-1 rounded-full border border-ec-green-light/10">
            <Sparkles className="w-3 h-3 animate-pulse" /> Botanical Atelier Auth
          </span>
          <h2 className="text-3xl font-serif text-ec-black">
            Join <em className="font-script text-ec-green text-2.5xl font-normal">Moodoor</em>
          </h2>
          <p className="text-xs text-ec-ink max-w-xs mx-auto leading-relaxed">
            Synchronize bespoke designs, access historic critique reports, and manage high-definition renders securely.
          </p>
        </div>

        {/* Form state picker (Database Auth vs Guest sandbox) */}
        {!isGuestMode ? (
          <div className="space-y-4">
            
            {/* Google Identity Sign-In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 border border-ec-border hover:border-ec-green bg-white hover:bg-ec-off-white text-ec-black text-xs font-semibold uppercase tracking-wider rounded-full flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <Chrome className="w-4 h-4 text-ec-green" />
              {loading ? "Authenticating..." : "Continue with Google"}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-ec-gray-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono text-ec-gray-400 uppercase tracking-widest">or email auth</span>
              <div className="flex-grow border-t border-ec-gray-100"></div>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">Your Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ec-gray-400" />
                    <input
                      type="text"
                      placeholder="E.g., Julian Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-4 bg-ec-off-white/40 border border-ec-border focus:border-ec-green rounded-xl text-xs text-ec-black outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ec-gray-400" />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-ec-off-white/40 border border-ec-border focus:border-ec-green rounded-xl text-xs text-ec-black outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ec-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-ec-off-white/40 border border-ec-border focus:border-ec-green rounded-xl text-xs text-ec-black outline-none"
                  />
                </div>
              </div>

              {/* Warnings and errors */}
              {(localError || authError) && (
                <div className="p-3 bg-ec-error/10 border border-ec-error/20 text-ec-error text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{localError || authError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-ec-green hover:bg-ec-green-light text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer text-center"
              >
                {loading ? "Please wait..." : isSignUp ? "Create Atelier Account" : "Enter Atelier Studio"}
              </button>
            </form>

            <div className="text-center space-y-3">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-ec-green hover:underline font-medium"
              >
                {isSignUp ? "Already registered? Sign In" : "Need an account? Sign Up"}
              </button>
              
              <div className="border-t border-ec-gray-100 pt-3">
                <button
                  onClick={() => { setIsGuestMode(true); setLocalError(null); }}
                  className="text-[11px] text-ec-gray-400 hover:text-ec-black font-semibold uppercase tracking-wider underline decoration-dotted"
                >
                  Or enter as Guest (Local Sandbox)
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Guest Mode Form */
          <div className="space-y-5">
            <div className="bg-[#FAF9F6] border border-ec-border rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-ec-black uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-ec-green" /> About Guest Mode
              </h4>
              <p className="text-[11px] text-ec-ink leading-relaxed font-serif italic">
                Because this application displays in an iframe preview, third-party cookies required by Google and security authentication services can sometimes be blocked by browser policies.
              </p>
              <p className="text-[11px] text-ec-ink leading-relaxed font-serif italic">
                Guest Mode utilizes secure local caching, granting you complete access to saving wreaths, matching memories, and compiling renders locally!
              </p>
            </div>

            <form onSubmit={handleGuestSignInSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-ec-gray-500">Your Guest Nickname</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ec-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="E.g., BotanicalLover"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 bg-ec-off-white/40 border border-ec-border focus:border-ec-green rounded-xl text-xs text-ec-black outline-none"
                  />
                </div>
              </div>

              {localError && (
                <div className="p-3 bg-ec-error/10 border border-ec-error/20 text-ec-error text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{localError}</p>
                </div>
              )}

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => { setIsGuestMode(false); setLocalError(null); }}
                  className="w-1/2 py-2.5 border border-ec-border text-ec-ink text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-ec-off-white transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-ec-green hover:bg-ec-green-light text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all cursor-pointer"
                >
                  Enter Sandbox
                </button>
              </div>
            </form>
          </div>
        )}

      </motion.div>
    </div>
  );
}
