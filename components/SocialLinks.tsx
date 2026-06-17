import Link from "next/link";

const LINKS = [
  { label: "GitHub", href: "https://github.com/anhht" },
  { label: "LinkedIn", href: "https://linkedin.com/in/anhht" },
  { label: "Email", href: "mailto:anhht.fe@gmail.com" },
];

export function SocialLinks() {
  return (
    <section className="py-12 flex flex-wrap items-center gap-6 md:gap-10">
      <span className="font-mono uppercase tracking-[3px] text-[10px] text-muted">
        Liên kết
      </span>
      {LINKS.map(({ label, href }) => (
        <Link
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="font-mono text-sm text-muted hover:text-ink transition-colors"
        >
          {label} →
        </Link>
      ))}
    </section>
  );
}
