import Link from "next/link";

const LINKS = [
  { label: "GitHub", href: "https://github.com/anhht" },
  { label: "LinkedIn", href: "https://linkedin.com/in/anhht" },
  { label: "Email", href: "mailto:anhht.fe@gmail.com" },
];

export function SocialLinks() {
  return (
    <div className="py-6 flex flex-col items-center gap-3">
      <div className="flex items-center justify-center gap-7 flex-wrap">
        {LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="font-mono text-xs text-muted hover:text-ink transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
      <p className="font-mono text-[10px] text-muted/50">
        © {new Date().getFullYear()} anhht
      </p>
    </div>
  );
}
