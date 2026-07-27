import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertLead } from "@shared/schema";

/**
 * The qualification form.
 *
 * The live `leads` table has six columns, so the extra qualification answers
 * (business type, roster size) are folded into `message` as a readable line
 * rather than adding columns. Nothing here needs a migration - answers land
 * in the existing lead dashboard at /developer as soon as they're submitted.
 */

const CLIENT_COUNTS = [
  "Just starting - under 5",
  "5 - 15 clients",
  "16 - 30 clients",
  "31 - 60 clients",
  "60+ clients",
];

const REVENUE_BANDS = [
  "Under $2k / month",
  "$2k - $5k / month",
  "$5k - $10k / month",
  "$10k - $25k / month",
  "$25k+ / month",
];

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name"),
  email: z.string().trim().email("Use an email we can reply to"),
  instagram: z.string().trim().optional(),
  clients: z.string().min(1, "Pick a range"),
  revenue: z.string().min(1, "Pick a range"),
  bottleneck: z.string().trim().min(10, "A sentence or two is plenty"),
  // Bot trap - real people never see this field.
  website: z.string().max(0).optional(),
});

type Application = z.infer<typeof applicationSchema>;

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="mono-label">{label}</label>
        {hint && <span className="text-[11px] text-ash-dim">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-[12px] text-ember">{error}</p>}
    </div>
  );
}

export default function ApplyForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Application>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      instagram: "",
      clients: "",
      revenue: "",
      bottleneck: "",
      website: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: Application) => {
      const lead: InsertLead = {
        name: values.name,
        email: values.email,
        instagram: values.instagram || null,
        currentRevenue: values.revenue,
        goal: values.bottleneck,
        message: `Clients: ${values.clients}`,
      };
      return apiRequest("POST", "/api/leads", lead);
    },
    onSuccess: () => setSubmitted(true),
    onError: () =>
      toast({
        title: "That didn't send",
        description: "Check your connection and try again, or email us directly.",
        variant: "destructive",
      }),
  });

  const onSubmit = (values: Application) => {
    if (values.website) {
      setSubmitted(true); // swallow bots without a round trip
      return;
    }
    mutation.mutate(values);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="panel relative overflow-hidden rounded-[28px] p-10 text-center md:p-14"
        data-testid="apply-success"
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,74,23,0.7), transparent)",
          }}
        />
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-ember/30 bg-ember/10 text-ember">
          <Check size={20} strokeWidth={2.5} />
        </div>
        <h3 className="heading mb-4 text-[26px]">Application received</h3>
        <p className="mx-auto max-w-[380px] text-[15px] leading-[1.75] text-ash">
          We read every one by hand. If your business is a fit for the free
          build, we'll reach out within two working days with the system we'd
          build for you first.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="panel relative overflow-hidden rounded-[28px] p-6 md:p-9"
    >
      {/* Ember edge - the panel catches the light like everything else */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,74,23,0.65), transparent)",
        }}
      />

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <input
              {...register("name")}
              className="field"
              placeholder="Alex Carter"
              autoComplete="name"
              data-testid="input-name"
            />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              className="field"
              placeholder="alex@coaching.com"
              autoComplete="email"
              data-testid="input-email"
            />
          </Field>
        </div>

        <Field label="Instagram" hint="optional" error={errors.instagram?.message}>
          <input
            {...register("instagram")}
            className="field"
            placeholder="@alexcarter"
            data-testid="input-instagram"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Clients right now" error={errors.clients?.message}>
            <select
              {...register("clients")}
              data-empty={!watch("clients")}
              className="field"
              data-testid="select-clients"
            >
              <option value="">Select one</option>
              {CLIENT_COUNTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Monthly revenue" error={errors.revenue?.message}>
            <select
              {...register("revenue")}
              data-empty={!watch("revenue")}
              className="field"
              data-testid="select-revenue"
            >
              <option value="">Select one</option>
              {REVENUE_BANDS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Your biggest time drain" error={errors.bottleneck?.message}>
          <textarea
            {...register("bottleneck")}
            rows={3}
            className="field"
            placeholder="Sunday check-ins take me most of the day, and leads sit in my DMs for days before I get to them."
            data-testid="input-bottleneck"
          />
        </Field>

        {/* Bot trap */}
        <input
          {...register("website")}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="btn-ember mt-7 w-full rounded-2xl py-4 text-[15px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
        data-testid="button-submit"
      >
        {mutation.isPending ? "Sending…" : "Apply for the free build"}
      </button>

      <p className="mt-4 text-center text-[12.5px] leading-relaxed text-ash-dim">
        No call required to apply. We'll only get in touch if we think we can
        build you something worth having.
      </p>
    </form>
  );
}
