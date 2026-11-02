import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-[28px] uppercase md:text-[46px]">Property Not Found</h1>
      <p className="font-light lg:text-lg">
        Ye property available nahi hai ya link galat hai.
      </p>
      <Link
        href="/"
        className="border-primary bg-primary hover:text-primary cursor-pointer rounded-xs border-2 px-4.5 py-3.5 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-white"
      >
        Back to Home
      </Link>
    </main>
  );
}