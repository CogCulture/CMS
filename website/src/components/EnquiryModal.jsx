"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { submitEnquiry } from "@/services/enquiryService";

const EnquiryContext = createContext({ openEnquiry: () => {} });
export const useEnquiry = () => useContext(EnquiryContext);

const CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS = [
  "A property specialist contacts you within one working day.",
  "A private consultation: your goals, budget and shortlist.",
  "Viewings and unit selection, in person or remotely.",
];

const fieldCls =
  "w-full border-0 border-b border-white/25 bg-transparent px-0 py-3 text-[15px] text-white placeholder:text-white/35 focus:border-white focus:outline-none";
const labelCls = "mb-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60";
const errCls = "mt-1 block min-h-4 text-xs text-[#ff8a80]";

export function EnquiryProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const openEnquiry = useCallback((src = "") => {
    setSource(src);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <EnquiryContext.Provider value={{ openEnquiry }}>
      {children}
      {open && <EnquiryModal source={source} onClose={close} />}
    </EnquiryContext.Provider>
  );
}

export function EnquiryButton({ source, children, ...props }) {
  const { openEnquiry } = useEnquiry();
  return (
    <button type="button" aria-haspopup="dialog" onClick={() => openEnquiry(source)} {...props}>
      {children}
    </button>
  );
}

function EnquiryModal({ source, onClose }) {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errors, setErrors] = useState({});
  const cardRef = useRef(null);
  const nameRef = useRef(null);

  // focus trap + Escape + scroll lock + focus restore
  useEffect(() => {
    const prev = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nameRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !cardRef.current) return;
      const els = cardRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([type="hidden"]), select'
      );
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [onClose]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").replace(/\D/g, "");

    const next = {};
    if (name.length < 2) next.name = "Please enter your full name.";
    if (!EMAIL.test(email)) next.email = "Please enter a valid email address.";
    if (phone.length < 7 || phone.length > 12) next.phone = "Please enter a valid phone number.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    try {
      await submitEnquiry({
        name,
        email,
        phone,
        countryCode: fd.get("countryCode"),
        keepUpdated: fd.get("keepUpdated") === "on",
        source,
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" data-testid="enquire-modal">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        data-testid="enquire-modal-scrim"
        aria-hidden="true"
      />

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-title"
        className="relative max-h-[92svh] w-full overflow-y-auto bg-[#12110f] p-6 text-white shadow-2xl sm:max-w-[480px] sm:p-9"
      >
        {status === "sent" ? (
          <div data-testid="enquire-modal-sent">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full border border-white/30" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                  <path d="M3 8.5l3.4 3.4L13 4.6" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <h2 id="enquiry-title" className="font-serif text-3xl">Thank you.</h2>
            </div>
            <p className="mb-6 text-sm text-white/70">Your enquiry has been received. Here is what happens next:</p>
            <ol className="mb-8 space-y-4">
              {STEPS.map((s, i) => (
                <li key={s} className="flex gap-4 text-sm text-white/85">
                  <span className="font-nav text-xs tracking-widest text-white/50">0{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={onClose}
              data-testid="enquire-modal-done"
              className="w-full bg-white py-4 text-xs font-bold uppercase tracking-[0.2em] text-black"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="enquiry-title" className="font-serif text-3xl" data-testid="enquire-modal-title">
                  Get in touch
                </h2>
                <p className="mt-1 text-sm text-white/60">Tell us how to reach you.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close enquiry"
                data-testid="enquire-modal-close"
                className="grid size-10 flex-none place-items-center border border-white/20 hover:bg-white/10"
              >
                <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            </div>

            <form onSubmit={onSubmit} noValidate data-testid="enquire-modal-form" className="space-y-3">
              <div>
                <label htmlFor="enq-name" className={labelCls}>Full name</label>
                <input
                  ref={nameRef}
                  id="enq-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  aria-invalid={!!errors.name}
                  aria-describedby="enq-name-err"
                  data-testid="enquire-modal-name-input"
                  className={fieldCls}
                />
                <span id="enq-name-err" className={errCls} role="alert">{errors.name}</span>
              </div>

              <div>
                <label htmlFor="enq-email" className={labelCls}>Email address</label>
                <input
                  id="enq-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby="enq-email-err"
                  data-testid="enquire-modal-email-input"
                  className={fieldCls}
                />
                <span id="enq-email-err" className={errCls} role="alert">{errors.email}</span>
              </div>

              <div>
                <label htmlFor="enq-phone" className={labelCls}>Phone number</label>
                <div className="flex gap-3">
                  <select
                    name="countryCode"
                    aria-label="Country dialling code"
                    defaultValue="+91"
                    data-testid="enquire-modal-country-select"
                    className="w-[96px] flex-none border-0 border-b border-white/25 bg-transparent py-3 text-[15px] text-white focus:border-white focus:outline-none"
                  >
                    {CODES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#12110f]">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    id="enq-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel-national"
                    placeholder="98765 43210"
                    aria-invalid={!!errors.phone}
                    aria-describedby="enq-phone-err"
                    data-testid="enquire-modal-phone-input"
                    className={fieldCls}
                  />
                </div>
                <span id="enq-phone-err" className={errCls} role="alert">{errors.phone}</span>
              </div>

              <label className="flex cursor-pointer items-start gap-3 text-sm text-white/75">
                <input
                  type="checkbox"
                  name="keepUpdated"
                  data-testid="enquire-modal-keep-updated-checkbox"
                  className="mt-0.5 size-4 accent-white"
                />
                Keep me updated on launches and news
              </label>

              <p className="text-xs text-white/50">
                By submitting, you agree to our{" "}
                <a href="/privacy-policy" target="_blank" rel="noreferrer" className="underline" data-testid="enquire-modal-privacy-link">
                  privacy policy
                </a>
                .
              </p>

              {status === "error" && (
                <p role="alert" className="text-sm text-[#ff8a80]">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                data-testid="enquire-modal-submit"
                className="w-full bg-white py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition-opacity disabled:opacity-60"
              >
                {status === "sending" ? "Sending..." : "Submit"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}