export default function Icon({ name, className = "w-5 h-5" }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };
  switch (name) {
    case "code":
      return (
        <svg {...props}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...props}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...props}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "play":
      return (
        <svg {...props}>
          <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="4" y="11" width="16" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "zap":
      return (
        <svg {...props}>
          <polygon points="12 2 4 14 11 14 10 22 20 10 13 10 12 2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
        </svg>
      );
    case "cpu":
      return (
        <svg {...props}>
          <rect x="7" y="7" width="10" height="10" rx="1" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M12 7V4M7 12H4" />
        </svg>
      );
    case "eye":
      return (
        <svg {...props}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "infinity":
      return (
        <svg {...props}>
          <path d="M8.5 8.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5c3.5 0 6.5-9 10-9 2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5c-3.5 0-6.5-9-10-9z" />
        </svg>
      );
    case "braces":
      return (
        <svg {...props}>
          <path d="M8 4c-1.5 0-2.5 1-2.5 2.5V9c0 1-1 2-2 2 1 0 2 1 2 2v2.5c0 1.5 1 2.5 2.5 2.5" />
          <path d="M16 4c1.5 0 2.5 1 2.5 2.5V9c0 1 1 2 2 2-1 0-2 1-2 2v2.5c0 1.5-1 2.5-2.5 2.5" />
        </svg>
      );
    case "check-circle":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12.5l2.5 2.5 4.5-5.5" />
        </svg>
      );
    case "minimize":
      return (
        <svg {...props}>
          <path d="M9 4v3a2 2 0 0 1-2 2H4M15 4v3a2 2 0 0 0 2 2h3M9 20v-3a2 2 0 0 0-2-2H4M15 20v-3a2 2 0 0 1 2-2h3" />
        </svg>
      );
    case "crosshair":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "mouse":
      return (
        <svg {...props}>
          <rect x="7" y="2" width="10" height="18" rx="5" />
          <path d="M12 6v4" />
        </svg>
      );
    case "repeat":
      return (
        <svg {...props}>
          <path d="M17 2l4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 22l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      );
    case "list-tree":
      return (
        <svg {...props}>
          <path d="M4 4h6M4 4v6M4 10h4M4 10v6M4 16h6" />
          <circle cx="19" cy="4" r="0.5" />
          <circle cx="19" cy="4" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="14" cy="10" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="19" cy="16" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "git-compare":
      return (
        <svg {...props}>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="M8.5 6H15a3 3 0 0 1 3 3v6.5" />
          <path d="M15.5 18H9a3 3 0 0 1-3-3V8.5" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    default:
      return null;
  }
}
