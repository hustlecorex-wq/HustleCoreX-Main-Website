import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useLocation } from "wouter";
import { setAdminPasscode } from "@/lib/queryClient";

/* The passcode is verified by the server. Nothing here knows the right
   answer, so reading the bundle no longer hands anyone the keys. */
async function verifyPasscode(code: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/verify", {
      headers: { "x-admin-passcode": code },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function AdminAccess() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /* Click-away and Escape both close it, so the panel never sits open over
     the page after someone loses interest. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setCode("");
    setError(false);
  }

  async function submit(value: string) {
    if (!value || checking) return;
    setChecking(true);
    const ok = await verifyPasscode(value);
    setChecking(false);
    if (ok) {
      setAdminPasscode(value);
      close();
      navigate("/developer");
    } else {
      setError(true);
      setCode("");
    }
  }

  function onChange(raw: string) {
    // No longer digits-only: the passcode now lives in an env var and should
    // be free to be something longer than five digits.
    setCode(raw.slice(0, 64));
    if (error) setError(false);
  }

  return (
    <div
      ref={panelRef}
      className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2 md:bottom-5 md:right-5"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-[220px] rounded-2xl border border-white/[0.08] bg-panel/95 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash-dim">
                Admin access
              </span>
              <button
                onClick={close}
                aria-label="Close admin access"
                className="text-ash-dim transition-colors hover:text-chalk"
              >
                <X size={13} />
              </button>
            </div>

            <input
              ref={inputRef}
              type="password"
              autoComplete="off"
              value={code}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit(code);
              }}
              disabled={checking}
              placeholder="•••••"
              aria-label="Admin passcode"
              className={`h-11 w-full rounded-xl border bg-void text-center font-mono text-[18px] tracking-[0.35em] text-chalk placeholder:text-white/15 focus:outline-none ${
                error
                  ? "border-red-500/50"
                  : "border-white/[0.08] focus:border-ember/50"
              } transition-colors`}
            />

            <p
              className={`mt-2 text-center text-[10.5px] ${
                error ? "text-red-400/80" : "text-ash-dim"
              }`}
            >
              {checking
                ? "Checking…"
                : error
                  ? "Incorrect code"
                  : "Enter the passcode, then press Enter"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="Admin access"
        title="Admin access"
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-panel/80 backdrop-blur-md transition-all hover:border-ember/40 hover:text-ember ${
          open ? "border-ember/40 text-ember" : "text-white/25"
        }`}
      >
        <Lock size={13} />
      </button>
    </div>
  );
}
