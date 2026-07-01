import Image from "next/image";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/anhht" },
  { label: "LinkedIn", href: "https://linkedin.com/in/anhht" },
  { label: "Email", href: "mailto:anhht.fe@gmail.com" },
];

interface Props {
  name: string;
  image?: string | null;
}

export function PostAuthorCard({ name, image }: Props) {
  return (
    <div id="post-author-card" className="flex gap-4 py-8 border-t border-line/20">
      {image ? (
        <Image
          src={image}
          alt={name}
          width={56}
          height={56}
          className="w-14 h-14 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-surface border border-line shrink-0 flex items-center justify-center font-mono text-lg text-muted">
          {name[0]?.toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-ink mb-1">{name}</p>
        <p className="text-sm text-muted leading-relaxed mb-3">
          Frontend engineer. Viết về React, thiết kế, và những thứ mình thấy thú vị.
        </p>
        <div className="flex items-center gap-4">
          {SOCIALS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted hover:text-ink transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
