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

// TODO: point this at the real privacy policy once the page exists.
const PRIVACY_URL = "/privacy";

/* apiRequest throws `${status}: ${body}`. Pull the server's own wording out of
   it so a rate limit or a rejected address explains itself. */
function serverMessage(err: Error): string | null {
  const body = err.message.slice(err.message.indexOf(":") + 1).trim();
  try {
    const parsed = JSON.parse(body) as { message?: string };
    return typeof parsed.message === "string" ? parsed.message : null;
  } catch {
    return null;
  }
}

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name"),
  email: z.string().trim().email("Use an email we can reply to"),
  instagram: z.string().trim().optional(),
  clients: z.string().min(1, "Pick a range"),
  revenue: z.string().min(1, "Pick a range"),
  bottleneck: z.string().trim().min(10, "A sentence or two is plenty"),
  consent: z.boolean().refine((v) => v === true, {
    message: "Please tick the box so we're allowed to reply",
  }),
  // Bot trap - real people never see this field.
  website: z.string().max(0).optional(),
});

type Application = z.infer<typeof applicationSchema>;

function Field({
  htmlFor,
  label,
  hint,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="mono-label">
          {label}
        </label>
        {hint && <span className="text-[11px] text-ash-dim">{hint}</span>}
      </div>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-[12px] text-ember">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ApplyForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  /* Stamped once when the form mounts. The server rejects anything filled in
     faster than a human could read it. */
  const [renderedAt] = useState(() => Date.now());

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
      consent: false,
      website: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: Application) => {
      const lead: InsertLead & {
        consent: boolean;
        website?: string;
        renderedAt: number;
      } = {
        name: values.name,
        email: values.email,
        instagram: values.instagram || null,
        currentRevenue: values.revenue,
        goal: values.bottleneck,
        message: `Clients: ${values.clients}`,
        consent: values.consent,
        // Sent along so the trap is enforced server-side too — a bot that
        // posts straight to the endpoint never runs this component.
        website: values.website,
        renderedAt,
      };
      return apiRequest("POST", "/api/leads", lead);
    },
    onSuccess: () => setSubmitted(true),
    onError: (err: Error) =>
      toast({
        title: "That didn't send",
        description:
          serverMessage(err) ??
          "Check your connection and try again, or email us directly.",
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
        role="status"
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
        <h3 className="heading mb-4 text-[26px]">Almost there</h3>
        <p className="mx-auto max-w-[400px] text-[15px] leading-[1.75] text-ash">
          We've sent a confirmation link to your inbox. Please click it to
          confirm your application.{" "}
          <strong className="font-medium text-chalk">
            If it isn't there in a minute, check your spam folder.
          </strong>
        </p>
        <p className="mx-auto mt-4 max-w-[400px] text-[14px] leading-[1.7] text-ash-dim">
          Once confirmed, we read every application by hand. If your business is
          a fit for the free build, we'll reach out within two working days.
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
          <Field htmlFor="apply-name" label="Name" error={errors.name?.message}>
            <input
              {...register("name")}
              id="apply-name"
              className="field"
              placeholder="Alex Carter"
              autoComplete="name"
              data-testid="input-name"
            />
          </Field>
          <Field htmlFor="apply-email" label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              id="apply-email"
              type="email"
              className="field"
              placeholder="alex@coaching.com"
              autoComplete="email"
              data-testid="input-email"
            />
          </Field>
        </div>

        <Field
          htmlFor="apply-instagram"
          label="Instagram"
          hint="optional"
          error={errors.instagram?.message}
        >
          <input
            {...register("instagram")}
            id="apply-instagram"
            className="field"
            placeholder="@alexcarter"
            data-testid="input-instagram"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            htmlFor="apply-clients"
            label="Clients right now"
            error={errors.clients?.message}
          >
            <select
              {...register("clients")}
              id="apply-clients"
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
          <Field
            htmlFor="apply-revenue"
            label="Monthly revenue"
            error={errors.revenue?.message}
          >
            <select
              {...register("revenue")}
              id="apply-revenue"
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

        <Field
          htmlFor="apply-bottleneck"
          label="Your biggest time drain"
          error={errors.bottleneck?.message}
        >
          <textarea
            {...register("bottleneck")}
            id="apply-bottleneck"
            rows={3}
            className="field"
            placeholder="Sunday check-ins take me most of the day, and leads sit in my DMs for days before I get to them."
            data-testid="input-bottleneck"
          />
        </Field>

        <div>
          <label
            htmlFor="apply-consent"
            className="flex cursor-pointer items-start gap-3 text-[13px] leading-[1.6] text-ash"
          >
            <input
              {...register("consent")}
              id="apply-consent"
              type="checkbox"
              className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-ember"
              data-testid="input-consent"
            />
            <span>
              I agree that HustleCoreX may email me about my application and send
              occasional updates. I can withdraw this at any time using the
              unsubscribe link in every email. See our{" "}
              <a
                href={PRIVACY_URL}
                className="text-ember underline underline-offset-2"
              >
                privacy policy
              </a>
              .
            </span>
          </label>
          {errors.consent?.message && (
            <p role="alert" className="mt-1.5 text-[12px] text-ember">
              {errors.consent.message}
            </p>
          )}
        </div>

        {/* Bot trap - parked outside the viewport rather than sized to zero, so
            screen readers and autofill both leave it alone. */}
        <input
          {...register("website")}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="pointer-events-none absolute -left-[9999px] top-auto h-px w-px opacity-0"
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
