import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").replace(/\D/g, "");

  if (name.length < 2 || !EMAIL.test(email) || phone.length < 7 || phone.length > 12) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 422 });
  }

  // Forward submitted enquiry to CMS Leads database
  try {
    await fetch("http://127.0.0.1:5000/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: `${body.countryCode || "+91"} ${phone}`,
        source: body.source ? `Website Modal (${body.source})` : "Get In Touch Modal",
        message: body.message || "Customer submitted enquiry on official website",
      }),
    });
  } catch (err) {
    console.error("Failed to forward lead to CMS:", err);
  }

  return NextResponse.json({ ok: true, success: true });
}
