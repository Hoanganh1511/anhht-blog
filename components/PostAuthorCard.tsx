import Image from "next/image";
import { Mail } from "lucide-react";

function GitHubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0" fill="currentColor" stroke="none" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" strokeWidth="3" />
    </svg>
  );
}

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/anhht", Icon: GitHubIcon },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/anhht",
    Icon: LinkedInIcon,
  },
  { label: "Facebook", href: "https://facebook.com/anhht", Icon: FacebookIcon },
  {
    label: "Instagram",
    href: "https://instagram.com/anhht",
    Icon: InstagramIcon,
  },
  { label: "Email", href: "mailto:anhht.fe@gmail.com", Icon: Mail },
];

interface Props {
  name: string;
  image?: string | null;
  bio?: string | null;
}

export function PostAuthorCard({ name, image, bio }: Props) {
  return (
    <div id="post-author-card" className="flex gap-4 pb-4">
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
        <p className="font-bold text-ink mb-1">{name}</p>
        {bio && (
          <p className="text-sm text-muted leading-relaxed mb-3">{bio}</p>
        )}
        <div className="flex items-center gap-3">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              title={label}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="text-muted hover:text-ink transition-colors"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
