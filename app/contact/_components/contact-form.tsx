"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Download, Send } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { sendContactMessage } from "@/lib/api/pages";

const fieldClassName =
  "w-full rounded-none border border-border/30 bg-background/55 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary";

type ContactFormProps = {
  cvUrl?: string;
};

export function ContactForm({ cvUrl }: ContactFormProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;

    startTransition(async () => {
      setStatus(null);
      const response = await sendContactMessage({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        workType: String(formData.get("workType") ?? ""),
        timeline: String(formData.get("timeline") ?? ""),
        budget: String(formData.get("budget") ?? ""),
        details: String(formData.get("details") ?? ""),
      });

      if (!response?.success) {
        setStatus(response?.message || "Message did not send. Try again.");
        return;
      }

      form.reset();
      setStatus(response.message || "Message sent.");
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative border-y border-border/25 py-8"
    >
      <div className="absolute right-0 top-0 hidden -translate-y-1/2 rotate-3 border border-border/35 bg-accent px-4 py-2 text-xs font-black uppercase tracking-[0.16em] sm:block">
        open
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Your name
          <input
            name="name"
            required
            className={fieldClassName}
            placeholder="Jane Doe"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Email
          <input
            name="email"
            type="email"
            required
            className={fieldClassName}
            placeholder="you@example.com"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold">
          Work type
          <select name="workType" className={fieldClassName} defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            <option>Backend system</option>
            <option>Frontend product</option>
            <option>Fullstack product</option>
            <option>Solidity support</option>
            <option>Code review</option>
            <option>Mentorship</option>
            <option>Collaboration</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Timeline
          <input
            name="timeline"
            className={fieldClassName}
            placeholder="2-4 weeks"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Budget
          <input
            name="budget"
            className={fieldClassName}
            placeholder="Range is fine"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-2 text-sm font-bold">
        What are we making?
        <textarea
          name="details"
          required
          rows={8}
          className={fieldClassName}
          placeholder="Tell me the problem, what already exists, what needs to ship, and what a good outcome looks like."
        />
      </label>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="h-11 rounded-none bg-foreground px-5 text-background hover:bg-foreground/85"
        >
          {isPending ? "Sending..." : "Send message"}
          <Send className="h-4 w-4" />
        </Button>
        {cvUrl ? (
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 rounded-none border-border/40 bg-transparent px-5"
          >
            <a href={cvUrl} download data-umami-event="resume_downloaded">
              Download CV
              <Download className="h-4 w-4" />
            </a>
          </Button>
        ) : null}
      </div>
      {status ? (
        <p className="mt-4 border-l-2 border-primary pl-3 text-sm font-semibold text-muted-foreground">
          {status}
        </p>
      ) : null}
    </motion.form>
  );
}
