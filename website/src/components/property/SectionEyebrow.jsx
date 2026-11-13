export default function SectionEyebrow({ children }) {
  return (
    <p className="m-0 flex items-center gap-5 font-nav text-[11px] font-semibold uppercase tracking-[1.65px] text-[#5D605E]">
      <span className="whitespace-nowrap">{children}</span>
      <span className="h-px flex-1 bg-[#1c1a17]/15" aria-hidden="true" />
    </p>
  );
}