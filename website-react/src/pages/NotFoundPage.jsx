import React from "react";
import Link from "next/link";

export default function NotFoundPage({ message = "This page is not available or the link is incorrect." }) {
  return (
    <div className="pt-[70px]">
      <main className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-[28px] uppercase md:text-[46px]">Page Not Found</h1>
        <p className="font-light lg:text-lg text-neutral-600">
          {message}
        </p>
        <Link
          href="/"
          className="border-primary bg-primary hover:text-primary cursor-pointer rounded-xs border-2 px-4.5 py-3.5 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-white"
        >
          Back to Home
        </Link>
      </main>
    </div>
  );
}
