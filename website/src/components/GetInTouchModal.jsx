"use client";

import { useState } from "react";

export default function GetInTouchModal({ open, onClose }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [keepUpdated, setKeepUpdated] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // TODO: yaha apna API call / CRM submit lagana
      console.log("Get In Touch Submit:", { fullName, email, phone, keepUpdated });
      onClose();
    }
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* MODAL */}
      <div
        className={`fixed left-1/2 top-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-2xl transition-all duration-300 ${
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold uppercase tracking-wide text-black">
            Get in touch
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 transition-colors hover:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* FULL NAME */}
          <div className="space-y-1">
            <label
              className={`text-xs font-semibold uppercase tracking-wide ${
                errors.fullName ? "text-red-600" : "text-black"
              }`}
            >
              Full Name<span className="ml-0.5 text-red-600">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter Full Name"
              maxLength={40}
              className={`w-full border px-3 py-2.5 text-sm outline-none ${
                errors.fullName
                  ? "border-red-600"
                  : "border-gray-300 focus:border-black"
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-black">
              Email Address<span className="ml-0.5 text-red-600">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`w-full border px-3 py-2.5 text-sm outline-none ${
                errors.email
                  ? "border-red-600"
                  : "border-gray-300 focus:border-black"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* PHONE */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-black">
              Phone Number<span className="ml-0.5 text-red-600">*</span>
            </label>
            <div className="flex gap-2">
              <span className="flex w-16 items-center justify-center border border-gray-300 px-2 text-xs text-gray-700">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                maxLength={15}
                className={`min-w-0 flex-1 border px-3 py-2.5 text-sm outline-none ${
                  errors.phone
                    ? "border-red-600"
                    : "border-gray-300 focus:border-black"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* KEEP UPDATED */}
          <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={keepUpdated}
              onChange={(e) => setKeepUpdated(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-black"
            />
            Keep me updated on news and offers
          </label>

          {/* PRIVACY NOTE */}
          <p className="text-sm leading-snug text-gray-500">
            Please visit the{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              privacy policy
            </a>{" "}
            to understand how we handle your personal data.
          </p>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xs border-2 border-primary bg-primary px-4.5 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-primary"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
}