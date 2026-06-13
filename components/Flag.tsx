// Renders a crisp SVG flag via flag-icons (works everywhere, including
// Windows Chrome where flag emoji fall back to bare letter codes).
export default function Flag({
  code,
  name,
  className = "",
}: {
  code: string; // flag-icons code, e.g. "us", "gb-eng"
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`fi fi-${code} rounded-[2px] align-[-0.125em] ${className}`}
      role="img"
      aria-label={name}
    />
  );
}
