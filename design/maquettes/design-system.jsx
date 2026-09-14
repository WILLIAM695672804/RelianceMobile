// design-system.jsx — Reliance mobile design system
// Tokens, icons, shared primitives used across all screens.

const REL = {
  // Color tokens — blue + white identity
  colors: {
    light: {
      bg: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceMuted: '#EEF3FB',
      text: '#101828',
      textMuted: '#5B6472',
      border: 'rgba(31,91,196,0.16)',
      divider: 'rgba(31,91,196,0.10)',
      ink: '#0F2C63'
    },
    dark: {
      bg: '#0B1220',
      surface: '#111A2B',
      surfaceMuted: '#1A2437',
      text: '#F2F6FF',
      textMuted: 'rgba(240,245,255,0.55)',
      border: 'rgba(240,245,255,0.08)',
      divider: 'rgba(240,245,255,0.06)',
      ink: '#FFFFFF'
    },
    accents: {
      red: '#1F5BC4', // legacy key → Reliance blue
      blue: '#1F5BC4', // Reliance blue
      amber: '#3B82D6', // bleu clair
      green: '#0F2C63', // bleu nuit
      emerald: '#0EA5E9' // cyan
    }
  },
  font: {
    display: '"Bricolage Grotesque", "Montserrat", -apple-system, system-ui, sans-serif',
    body: '"Inter", "Roboto", -apple-system, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace'
  },
  radius: { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 }
};

// Theme hook — returns palette for current dark/accent
function useReliance(tweaks) {
  const c = REL.colors[tweaks.dark ? 'dark' : 'light'];
  const accent = REL.colors.accents[tweaks.accent] || REL.colors.accents.red;
  const density = { compact: 0.85, regular: 1, comfy: 1.15 }[tweaks.density] || 1;
  const fonts = {
    display: tweaks.font === 'helvetica' ? '"Helvetica Neue", Helvetica, Arial, sans-serif' :
    tweaks.font === 'serif' ? '"Fraunces", "Playfair Display", Georgia, serif' :
    tweaks.font === 'mono' ? '"JetBrains Mono", ui-monospace, monospace' :
    REL.font.display,
    body: tweaks.font === 'helvetica' ? '"Helvetica Neue", Helvetica, Arial, sans-serif' :
    tweaks.font === 'mono' ? '"JetBrains Mono", ui-monospace, monospace' :
    REL.font.body
  };
  return { ...c, accent, density, fonts, _t: tweaks };
}

// ── Icon set — minimal stroke icons. NEVER complex SVGs — only geometric primitives.
function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.8 }) {
  const s = strokeWidth;
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: s, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    inbox: <><path d="M3 13l3-9h12l3 9v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M3 13h5l1 2h6l1-2h5" /></>,
    chat: <><path d="M21 12a8 8 0 0 1-12.3 6.7L3 20l1.3-5.7A8 8 0 1 1 21 12z" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    map: <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" /><path d="M9 4v14M15 6v14" /></>,
    pin: <><path d="M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
    filter: <><path d="M3 5h18M6 12h12M10 19h4" /></>,
    star: <><path d="M12 3l2.6 5.5 6 .9-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.9z" /></>,
    chevronR: <><path d="M9 6l6 6-6 6" /></>,
    chevronL: <><path d="M15 6l-6 6 6 6" /></>,
    chevronD: <><path d="M6 9l6 6 6-6" /></>,
    chevronU: <><path d="M6 15l6-6 6 6" /></>,
    close: <><path d="M6 6l12 12M18 6L6 18" /></>,
    check: <><path d="M5 12l5 5L20 7" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    shield: <><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
    wallet: <><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M16 13h2" /><path d="M3 9V6a1 1 0 0 1 1.3-1L17 8" /></>,
    camera: <><rect x="3" y="6" width="18" height="14" rx="3" /><circle cx="12" cy="13" r="4" /><path d="M9 6l1.5-2h3L15 6" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="M3 18l5-5 4 4 3-3 6 6" /></>,
    location: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></>,
    flash: <><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></>,
    arrowR: <><path d="M5 12h14M13 5l7 7-7 7" /></>,
    arrowL: <><path d="M19 12H5M11 5l-7 7 7 7" /></>,
    arrowUp: <><path d="M12 19V5M5 12l7-7 7 7" /></>,
    send: <><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    google: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></>,
    apple: <><path d="M16 3a4 4 0 0 0-3 2M8 8c-2 0-4 2-4 5 0 4 3 8 5 8 1 0 1.5-.5 3-.5s2 .5 3 .5c2 0 5-4 5-8 0-3-2-5-4-5-1 0-2 .5-3 .5S9 8 8 8z" /></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4 13 13 0 0 0 2.6.6 2 2 0 0 1 1.7 2z" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
    wrench: <><path d="M14.7 6.3a4 4 0 0 0 5 5l-9.5 9.5a3 3 0 0 1-4.2-4.2z" /></>,
    bolt: <><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3z" /></>,
    laptop: <><rect x="3" y="5" width="18" height="11" rx="2" /><path d="M2 19h20" /></>,
    cog: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></>,
    moon: <><path d="M21 13a8 8 0 0 1-10-10 8 8 0 1 0 10 10z" /></>,
    badge: <><circle cx="12" cy="9" r="6" /><path d="M9 14l-2 7 5-3 5 3-2-7" /></>,
    heart: <><path d="M12 21s-7-4-7-11a4 4 0 0 1 7-3 4 4 0 0 1 7 3c0 7-7 11-7 11z" /></>,
    bookmark: <><path d="M6 4h12v17l-6-4-6 4z" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v13" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
    plug: <><path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 1 1-12 0z" /><path d="M12 18v4" /></>,
    edit: <><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M12 12v5" /></>,
    sparkle: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M19 16l.7 2L21 19l-1.3.5L19 21l-.7-1.5L17 19l1.3-1z" /></>,
    minus: <><path d="M5 12h14" /></>
  };
  return <svg {...props}>{paths[name] || paths.info}</svg>;
}

// ── Reusable shapes ─────────────────────────────────────────────
function Avatar({ name = 'AB', size = 40, color, src }) {
  const initials = (name || '').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  // Stripe-pattern placeholder
  if (src === 'placeholder') {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: `repeating-linear-gradient(45deg, ${color || '#1F5BC4'}22, ${color || '#1F5BC4'}22 4px, ${color || '#1F5BC4'}33 4px, ${color || '#1F5BC4'}33 8px)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color || '#1F5BC4', fontWeight: 700, fontSize: size * 0.36,
        fontFamily: REL.font.display
      }}>{initials}</div>);

  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color || '#1F5BC4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36,
      fontFamily: REL.font.display, letterSpacing: -0.5
    }}>{initials}</div>);

}

// Image placeholder — striped, with a label
function ImagePlaceholder({ label = 'image', height = 120, width = '100%', radius = 14, tone = 'neutral' }) {
  const tones = {
    neutral: ['#E4ECF8', '#CFDDF2'],
    dark: ['#123A7A', '#1B2C4B'],
    red: ['#DCE7FA', '#C6D8F4'],
    blue: ['#D6DEEF', '#C0CCE6']
  };
  const [a, b] = tones[tone] || tones.neutral;
  return (
    <div style={{
      width, height, borderRadius: radius, overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, ${a}, ${a} 8px, ${b} 8px, ${b} 16px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: REL.font.mono, fontSize: 10, color: tone === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
      letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 0
    }}>{label}</div>);

}

// Pill / chip
function Pill({ children, color, bg, border, size = 'md', icon }) {
  const sizes = {
    sm: { fs: 11, pad: '4px 8px', h: 22 },
    md: { fs: 12, pad: '5px 10px', h: 26 },
    lg: { fs: 13, pad: '7px 14px', h: 32 }
  }[size];
  return (
    <span style={{ ...{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: sizes.fs, height: sizes.h, padding: sizes.pad,
        borderRadius: 999, background: bg || 'rgba(0,0,0,0.06)',
        color: color || 'inherit', border: border || 'none',
        fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap'
      }, background: "rgb(214, 82, 47)" }}>{icon}{children}</span>);

}

// Primary button
function Button({ children, variant = 'primary', size = 'md', icon, iconRight, accent, dark, onClick, full, style: extra = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: REL.font.body, fontWeight: 600, letterSpacing: -0.1,
    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    width: full ? '100%' : 'auto'
  };
  const sizes = {
    sm: { fs: 13, pad: '8px 14px', radius: 10, h: 34 },
    md: { fs: 14, pad: '12px 18px', radius: 12, h: 44 },
    lg: { fs: 15, pad: '15px 22px', radius: 14, h: 52 }
  }[size];
  const variants = {
    primary: { bg: accent, color: '#fff' },
    dark: { bg: dark ? '#fff' : '#0F2C63', color: dark ? '#0F2C63' : '#fff' },
    ghost: { bg: 'transparent', color: dark ? '#fff' : '#0F2C63', border: `1px solid ${dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'}` },
    soft: { bg: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: dark ? '#fff' : '#0F2C63' }
  }[variant];
  return (
    <button onClick={onClick} style={{
      ...base, ...sizes, background: variants.bg, color: variants.color,
      border: variants.border || 'none', height: sizes.h,
      ...extra
    }}>
      {icon}{children}{iconRight}
    </button>);

}

// Card
function Card({ children, theme, padding = 16, radius = 18, style: extra = {} }) {
  return (
    <div style={{
      background: theme.surface, borderRadius: radius, padding,
      border: `1px solid ${theme.border}`,
      ...extra
    }}>{children}</div>);

}

// Section title
function Section({ title, action, children, style: extra = {} }) {
  return (
    <div style={{ marginBottom: 18, ...extra }}>
      {title &&
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontFamily: REL.font.display, fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>{title}</h3>
          {action}
        </div>
      }
      {children}
    </div>);

}

// Status bar (custom for screens that don't use IOSDevice nav)
function CustomStatusBar({ dark, time = '9:41' }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 28px 4px', fontFamily: REL.font.body, fontWeight: 600, fontSize: 15, color: c,
      position: 'relative', zIndex: 5
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="7" width="2.5" height="4" rx="0.5" fill={c} /><rect x="4" y="5" width="2.5" height="6" rx="0.5" fill={c} /><rect x="8" y="2.5" width="2.5" height="8.5" rx="0.5" fill={c} /><rect x="12" y="0" width="2.5" height="11" rx="0.5" fill={c} /></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="19" height="10" rx="2.5" stroke={c} strokeOpacity="0.5" fill="none" /><rect x="2" y="2" width="16" height="7" rx="1.5" fill={c} /></svg>
      </div>
    </div>);

}

Object.assign(window, { REL, useReliance, Icon, Avatar, ImagePlaceholder, Pill, Button, Card, Section, CustomStatusBar });