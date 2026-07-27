import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Lead } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Search, LogOut, ArrowLeft, Loader2, ShieldAlert, Sparkles, Mail, Instagram, TrendingUp, Target, MessageSquare, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Developer() {
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return localStorage.getItem("dev_auth") === "true";
  });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterContacted, setFilterContacted] = useState<"all" | "pending" | "contacted">("all");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "44445") {
      setIsAuthorized(true);
      localStorage.setItem("dev_auth", "true");
      setError("");
      toast({
        title: "Access Granted",
        description: "Welcome back, Lead Developer.",
      });
    } else {
      setError("Incorrect developer passcode");
      setPasscode("");
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem("dev_auth");
    toast({
      title: "Logged Out",
      description: "Secure session ended.",
    });
  };

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: isAuthorized,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, contacted }: { id: string; contacted: boolean }) => {
      return apiRequest("PATCH", `/api/leads/${id}`, { contacted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Status Updated",
        description: "Application status has been updated in Supabase.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update status on Supabase.",
        variant: "destructive",
      });
    },
  });

  const filteredLeads = leads
    .filter((lead) => {
      const matchSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.instagram && lead.instagram.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterContacted === "pending") return matchSearch && !lead.contacted;
      if (filterContacted === "contacted") return matchSearch && lead.contacted;
      return matchSearch;
    });

  const pendingCount = leads.filter(l => !l.contacted).length;
  const contactedCount = leads.filter(l => l.contacted).length;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF4500]/[0.03] rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md border border-white/[0.06] rounded-2xl p-8 bg-[#0D0D0D] relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="text-[#FF4500]" size={22} />
            </div>
            <h2 className="text-[20px] font-bold text-white tracking-tight">Developer Access Only</h2>
            <p className="text-[13px] text-white/35 mt-1.5">
              Please enter the 5-digit passcode to proceed
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="•••••"
                className="w-full h-12 text-center text-[22px] tracking-[0.4em] font-mono rounded-xl bg-[#111] border border-white/[0.07] text-white placeholder-white/10 focus:outline-none focus:border-white/18 transition-all"
                maxLength={8}
                autoFocus
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400/70 text-[11px] mt-2 text-center font-medium"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#FF4500] hover:bg-[#FF5500] active:scale-[0.98] text-white text-[13px] font-bold transition-all flex items-center justify-center gap-2"
            >
              Verify Credentials
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-[11px] text-white/20 hover:text-[#FF4500] transition-colors">
              <ArrowLeft size={12} /> Return to Website
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.05] bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-[#FF4500] hover:border-[#FF4500]/30 transition-all">
            <ArrowLeft size={14} />
          </Link>
          <div>
            <h1 className="text-[15px] font-bold tracking-tight flex items-center gap-2">
              Developer Dashboard <span className="text-[9px] px-2 py-0.5 rounded bg-[#FF4500]/10 border border-[#FF4500]/25 text-[#FF4500] font-bold uppercase tracking-wider">Supabase Live</span>
            </h1>
            <p className="text-[10px] text-white/30">Active Application Inbound Forms</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/60 hover:text-white text-[11px] font-bold transition-all"
        >
          <LogOut size={12} /> Secure Exit
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="border border-white/[0.05] rounded-xl p-5 bg-[#0D0D0D] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider">Total Applications</p>
              <h3 className="text-3xl font-bold tracking-tight mt-1">{leads.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/40">
              <Sparkles size={16} />
            </div>
          </div>

          <div className="border border-white/[0.05] rounded-xl p-5 bg-[#0D0D0D] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider">Pending Action</p>
              <h3 className="text-3xl font-bold text-orange-400 tracking-tight mt-1">{pendingCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Circle size={16} />
            </div>
          </div>

          <div className="border border-white/[0.05] rounded-xl p-5 bg-[#0D0D0D] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider">Contacted / Closed</p>
              <h3 className="text-3xl font-bold text-green-400 tracking-tight mt-1">{contactedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input
              type="text"
              placeholder="Search by name, email, instagram..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#0D0D0D] border border-white/[0.06] text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-white/15 transition-all"
            />
          </div>

          <div className="flex gap-1.5 bg-[#0D0D0D] p-1 rounded-lg border border-white/[0.05]">
            {(["all", "pending", "contacted"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilterContacted(opt)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                  filterContacted === opt
                    ? "bg-[#FF4500] text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/30 gap-3 border border-white/[0.05] rounded-xl bg-[#0D0D0D]">
            <Loader2 className="animate-spin text-[#FF4500]" size={24} />
            <p className="text-[12px] font-medium font-mono">Synchronizing Supabase recordsets...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/20 gap-2 border border-white/[0.05] rounded-xl bg-[#0D0D0D]">
            <p className="text-[13px] font-semibold">No applications found</p>
            <p className="text-[11px] text-white/10">Try adjusting your search criteria or filter options.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`border border-white/[0.05] rounded-xl bg-[#0D0D0D] overflow-hidden transition-all duration-300 hover:border-white/[0.08] ${
                    lead.contacted ? "opacity-75 border-green-500/10" : ""
                  }`}
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    {/* Primary client details */}
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-[16px] font-bold tracking-tight text-white leading-none">
                          {lead.name}
                        </h4>
                        <span className="text-[10px] text-white/30 font-mono px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.05]">
                          {lead.id.substring(0, 8)}
                        </span>
                        {lead.contacted ? (
                          <span className="text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Contacted
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            New Inbound
                          </span>
                        )}
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3.5 pt-1">
                        <div className="flex items-center gap-2.5 text-[12.5px] text-white/40">
                          <Mail size={13} className="text-white/20" />
                          <a href={`mailto:${lead.email}`} className="text-white/60 hover:text-[#FF4500] hover:underline transition-colors">
                            {lead.email}
                          </a>
                        </div>

                        {lead.instagram ? (
                          <div className="flex items-center gap-2.5 text-[12.5px] text-white/40">
                            <Instagram size={13} className="text-white/20" />
                            <a
                              href={`https://instagram.com/${lead.instagram.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white/60 hover:text-[#FF4500] hover:underline transition-colors font-medium"
                            >
                              @{lead.instagram.replace("@", "")}
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 text-[12.5px] text-white/20 italic">
                            <Instagram size={13} />
                            No Instagram handle
                          </div>
                        )}

                        <div className="flex items-center gap-2.5 text-[12.5px] text-white/40">
                          <TrendingUp size={13} className="text-white/20" />
                          <span>Rev: <strong className="text-white/80">{lead.currentRevenue}</strong></span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[12.5px] text-white/40">
                          <Target size={13} className="text-white/20" />
                          <span>6mo Goal: <strong className="text-[#FF4500]/80">{lead.goal}</strong></span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[12.5px] text-white/40">
                          <Calendar size={13} className="text-white/20" />
                          <span>{new Date(lead.createdAt).toLocaleDateString()} at {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Bottleneck/Message */}
                      {lead.message && (
                        <div className="mt-4 p-4 rounded-xl bg-white/[0.015] border border-white/[0.04] space-y-1.5">
                          <p className="text-[10px] font-bold text-[#FF4500]/60 uppercase tracking-wider flex items-center gap-1.5">
                            <MessageSquare size={10} /> Biggest Bottleneck
                          </p>
                          <p className="text-[13px] text-white/50 leading-relaxed">
                            {lead.message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Contacted status action button */}
                    <div className="flex-shrink-0 flex items-center self-center">
                      <button
                        onClick={() => toggleMutation.mutate({ id: lead.id, contacted: !lead.contacted })}
                        disabled={toggleMutation.isPending}
                        className={`h-11 px-5 rounded-xl border text-[12px] font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                          lead.contacted
                            ? "bg-green-500/5 hover:bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08] text-white/60 hover:text-white"
                        }`}
                      >
                        {lead.contacted ? (
                          <>
                            <CheckCircle2 size={13} />
                            Mark Inbound
                          </>
                        ) : (
                          <>
                            <Circle size={13} />
                            Mark Contacted
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
