export default function StageSection({
  as: Tag = "section",
  height, // optional: "250svh" (pin / tall section)
  className = "",
  style,
  children,
  ...rest
}) {
  return (
    <Tag
      data-stage
      style={{ ...(height ? { height } : null), ...style }}
      // overflow-clip (hidden nahi): hidden se andar ka sticky pin tut jata hai
      className={`sticky top-0 w-full overflow-clip bg-black text-white ${className}`}
      {...rest}
    >
      {children}

      {/* Cover dim: jab agla section upar aata hai, ye section poora dark hota hai */}
      <div
        aria-hidden="true"
        data-stage-dim
        className="pointer-events-none absolute inset-0 z-[60] bg-black"
        style={{ opacity: "calc(var(--cover, 0) * 0.55)" }}
      />
    </Tag>
  );
}