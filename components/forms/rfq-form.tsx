"use client";

import { useActionState, useId } from "react";
import { submitRfq, type RfqState } from "@/lib/actions/rfq";
import { Button } from "@/components/ui/button";

const initialState: RfqState = { ok: false };

const inputClass =
  "border-border bg-surface focus-visible:border-brand focus-visible:outline-brand w-full rounded-md border px-3.5 py-2.5 text-[0.9375rem] outline-none focus-visible:outline-2 focus-visible:outline-offset-1";

function Field({
  label,
  name,
  type = "text",
  required = false,
  error,
  defaultValue,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  defaultValue?: string;
  autoComplete?: string;
}) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div>
      <label htmlFor={id} className="text-ink-900 mb-1.5 block text-sm font-medium">
        {label}
        {required && (
          <span className="text-solar-600 ml-0.5" aria-hidden>
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        className={inputClass}
      />
      {error && (
        <p id={errId} className="text-solar-600 mt-1 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

export function RfqForm({ services, sourcePath }: { services: string[]; sourcePath: string }) {
  const [state, action, pending] = useActionState(submitRfq, initialState);
  const v = state.values;
  const msgId = useId();

  if (state.ok) {
    return (
      <div
        className="border-energy/30 bg-energy/5 rounded-lg border p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <h2 className="text-h3 text-ink-900 font-semibold">Thank you — request received.</h2>
        <p className="text-text-soft mt-2">
          One of our engineers will review your project and get back to you. For anything urgent,
          call us during business hours.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.errors?.form && (
        <p
          className="border-solar-600/30 bg-solar/5 text-solar-text rounded-md border px-4 py-3 text-sm"
          role="alert"
        >
          {state.errors.form}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Name"
          name="name"
          required
          autoComplete="name"
          defaultValue={v?.name}
          error={state.errors?.name}
        />
        <Field
          label="Company"
          name="company"
          autoComplete="organization"
          defaultValue={v?.company}
        />
        <Field
          label="Work email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={v?.email}
          error={state.errors?.email}
        />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" defaultValue={v?.phone} />
        <div>
          <label htmlFor={`${msgId}-svc`} className="text-ink-900 mb-1.5 block text-sm font-medium">
            Service of interest
          </label>
          <select
            id={`${msgId}-svc`}
            name="serviceInterest"
            defaultValue={v?.serviceInterest ?? ""}
            className={inputClass}
          >
            <option value="">Select a service…</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Multiple / Not sure">Multiple / Not sure</option>
          </select>
        </div>
        <Field label="Project location" name="location" defaultValue={v?.location} />
      </div>

      <div>
        <label htmlFor={msgId} className="text-ink-900 mb-1.5 block text-sm font-medium">
          About your project
          <span className="text-solar-600 ml-0.5" aria-hidden>
            *
          </span>
        </label>
        <textarea
          id={msgId}
          name="message"
          required
          rows={5}
          defaultValue={v?.message}
          aria-invalid={state.errors?.message ? true : undefined}
          aria-describedby={state.errors?.message ? `${msgId}-err` : undefined}
          className={inputClass}
          placeholder="Scope, scale, timeline, location, and anything else that helps us scope it."
        />
        {state.errors?.message && (
          <p id={`${msgId}-err`} className="text-solar-600 mt-1 text-sm">
            {state.errors.message}
          </p>
        )}
      </div>

      {/* Honeypot — hidden from users, catches bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${msgId}-hp`}>Leave this field empty</label>
        <input
          id={`${msgId}-hp`}
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="sourcePath" value={sourcePath} />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Request a Consultation"}
      </Button>
      <p className="text-text-soft text-xs">
        No obligation. We&rsquo;ll only use your details to respond to this request.
      </p>
    </form>
  );
}
