// Tiny inline-SVG icons so we don't pull in an icon library.
// Each takes a `className` for sizing/color via Tailwind.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};

export function LogoMark({ className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" className="fill-leaf" />
      <path
        d="M8 14.5 10.5 12 13 14l3-3.5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="8.5" r="1.4" fill="#fff" />
    </svg>
  );
}

export function UploadCloud({ className = "h-6 w-6" }) {
  return (
    <svg className={className} {...base} aria-hidden="true">
      <path d="M12 16V9m0 0-3 3m3-3 3 3" />
      <path d="M6.5 19a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 9.5a3.5 3.5 0 0 1 1 6.86" />
    </svg>
  );
}

export function Download({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base} aria-hidden="true">
      <path d="M12 4v10m0 0-3.5-3.5M12 14l3.5-3.5" />
      <path d="M5 18.5h14" />
    </svg>
  );
}

export function Lock({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base} aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

export function Gauge({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base} aria-hidden="true">
      <path d="M5 16a7 7 0 1 1 14 0" />
      <path d="M12 16l3.5-3.5" />
    </svg>
  );
}

export function Resize({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base} aria-hidden="true">
      <path d="M9 4H5a1 1 0 0 0-1 1v4m11-5h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4m11 5h4a1 1 0 0 0 1-1v-4" />
    </svg>
  );
}

export function Chevron({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function Spinner({ className = "h-5 w-5" }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Check({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base} aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function Warning({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base} aria-hidden="true">
      <path d="M12 8.5v4.5m0 3h.01" />
      <path d="M10.3 4.2 3.5 16a2 2 0 0 0 1.7 3h13.6a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

export function X({ className = "h-5 w-5" }) {
  return (
    <svg className={className} {...base} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
