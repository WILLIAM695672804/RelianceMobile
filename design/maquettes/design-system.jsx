// design-system.jsx — Reliance mobile, sur le système Clean Lavender
// Tokens, icons, shared primitives used across all screens.

const REL = {
  // Color tokens — Clean Lavender (blanc d'abord, un seul accent violet)
  colors: {
    light: {
      bg: '#ffffff',                 // surface
      surface: '#ffffff',            // surface-container-lowest (cartes)
      surfaceMuted: '#f6f6f8',       // surface-container-low
      surfaceContainer: '#f0f0f3',
      surfaceHigh: '#eaeaef',        // surface-container-high
      text: '#17161f',               // on-surface
      textMuted: '#57556a',          // on-surface-variant
      border: '#ececf1',             // hairline
      divider: '#ececf1',            // hairline
      outlineVariant: '#d6d5df',
      outline: '#85839a',
      ink: '#17161f',
      primaryFixed: '#efeaff',
      onPrimaryFixed: '#4918c8',
      onPrimary: '#ffffff',
      scrim: 'rgba(10, 10, 18, 0.45)',
      shadowCard: '0 2px 8px rgba(23, 22, 31, 0.04)',
      shadowNav: '0 12px 32px -6px rgba(23, 22, 31, 0.14)',
      shadowSheet: '0 -12px 40px rgba(10, 10, 18, 0.18)'
    },
    dark: {
      bg: '#0e0e12',
      surface: '#16161b',
      surfaceMuted: '#1b1b21',
      surfaceContainer: '#212128',
      surfaceHigh: '#292931',
      text: '#ededf2',
      textMuted: '#a8a6b8',
      border: '#26262e',
      divider: '#26262e',
      outlineVariant: '#3a3946',
      outline: '#7a788c',
      ink: '#ededf2',
      primaryFixed: '#2a2350',
      onPrimaryFixed: '#cdc1ff',
      onPrimary: '#1f0a5c',
      scrim: 'rgba(0, 0, 0, 0.6)',
      shadowCard: 'none',
      shadowNav: '0 12px 32px -6px rgba(0, 0, 0, 0.5)',
      shadowSheet: '0 -12px 40px rgba(0, 0, 0, 0.5)'
    },
    // Accents sémantiques (clés héritées conservées pour les écrans)
    accentsLight: {
      red: '#5f3add',     // primary (ancienne clé de marque)
      blue: '#5f3add',    // primary
      amber: '#825100',   // tertiary
      green: '#006c49',   // secondary
      emerald: '#4918c8', // on-primary-fixed-variant
      error: '#ba1a1a'
    },
    accentsDark: {
      red: '#b5a3ff',
      blue: '#b5a3ff',
      amber: '#ffb95f',
      green: '#5ee0a8',
      emerald: '#cdc1ff',
      error: '#ff8a80'
    },
    accents: null
  },
  font: {
    display: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    body: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif'
  },
  // Échelle d'arrondis Clean Lavender
  radius: { xs: 8, sm: 10, md: 12, tile: 14, lg: 20, card: 20, xl: 28, sheet: 28, pill: 9999 }
};
REL.colors.accents = { ...REL.colors.accentsLight };

// Theme hook — palette Clean Lavender pour le thème courant
function useReliance(tweaks) {
  const dark = !!tweaks.dark;
  const c = REL.colors[dark ? 'dark' : 'light'];
  // Les écrans lisent REL.colors.accents : on l'aligne sur le thème courant.
  Object.assign(REL.colors.accents, dark ? REL.colors.accentsDark : REL.colors.accentsLight);
  const accent = REL.colors.accents.blue; // primary
  const density = { compact: 0.85, regular: 1, comfy: 1.15 }[tweaks.density] || 1;
  const fonts = { display: REL.font.display, body: REL.font.body, mono: REL.font.mono };
  return { ...c, accent, primary: accent, density, fonts, _t: tweaks };
}

// ── Icon set — minimal stroke icons. NEVER complex SVGs — only geometric primitives.
function Icon({ name, size = 20, color = 'currentColor' }) {
  // Trait Lucide : 2 jusqu'à 14 px, 1,85 de 15 à 18 px, 1,75 à partir de 20 px
  const s = size <= 14 ? 2 : size <= 18 ? 1.85 : 1.75;
  const props = { 'aria-hidden': true, width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: s, strokeLinecap: 'round', strokeLinejoin: 'round' };
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
        background: `repeating-linear-gradient(45deg, ${color || REL.colors.accents.blue}22, ${color || REL.colors.accents.blue}22 4px, ${color || REL.colors.accents.blue}33 4px, ${color || REL.colors.accents.blue}33 8px)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color || REL.colors.accents.blue, fontWeight: 700, fontSize: size * 0.36,
        fontFamily: REL.font.display
      }}>{initials}</div>);

  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color || REL.colors.accents.blue,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36,
      fontFamily: REL.font.display
    }}>{initials}</div>);

}

// Image placeholder — striped, with a label
function ImagePlaceholder({ label = 'image', height = 120, width = '100%', radius = 14, tone = 'neutral' }) {
  const tones = {
    neutral: ['#f6f6f8', '#eaeaef'],
    dark: ['#212128', '#292931'],
    red: ['#efeaff', '#e4dcff'],
    blue: ['#f0f0f3', '#e4e4ea']
  };
  const [a, b] = tones[tone] || tones.neutral;
  return (
    <div style={{
      width, height, borderRadius: radius, overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, ${a}, ${a} 8px, ${b} 8px, ${b} 16px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: REL.font.body, fontSize: 12, fontWeight: 600, color: tone === 'dark' ? '#a8a6b8' : '#57556a',
      letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 0
    }}>{label}</div>);

}

// Pill / chip
function Pill({ children, color, bg, border, size = 'md', icon }) {
  const sizes = {
    sm: { fs: 12, pad: '4px 10px', h: 24 },
    md: { fs: 13, pad: '5px 12px', h: 28 },
    lg: { fs: 13, pad: '7px 14px', h: 32 }
  }[size];
  return (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: sizes.fs, height: sizes.h, padding: sizes.pad,
        borderRadius: 9999, background: bg || 'rgba(127,127,140,0.12)',
        color: color || 'inherit', border: border || 'none',
        fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: REL.font.body
      }}>{icon}{children}</span>);

}

// Primary button
function Button({ children, variant = 'primary', size = 'md', icon, iconRight, accent, dark, onClick, full, style: extra = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: REL.font.body, fontWeight: 600,
    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    width: full ? '100%' : 'auto'
  };
  const sizes = {
    sm: { fs: 13, pad: '8px 16px', borderRadius: 9999, h: 36 },
    md: { fs: 15, pad: '12px 20px', borderRadius: 9999, h: 44 },
    lg: { fs: 15, pad: '15px 24px', borderRadius: 9999, h: 52 }
  }[size];
  const variants = {
    primary: { bg: accent || REL.colors.accents.blue, color: '#fff' },
    dark: { bg: REL.colors.accents.blue, color: dark ? '#1f0a5c' : '#ffffff' },
    ghost: { bg: 'transparent', color: dark ? '#ededf2' : '#17161f', border: `1px solid ${dark ? '#3a3946' : '#d6d5df'}` },
    soft: { bg: dark ? '#292931' : '#eaeaef', color: dark ? '#ededf2' : '#17161f' }
  }[variant];
  return (
    <button type="button" onClick={onClick} style={{
      ...base, ...sizes, background: variants.bg, color: variants.color,
      border: variants.border || 'none', height: sizes.h, padding: sizes.pad, fontSize: sizes.fs,
      ...extra
    }}>
      {icon}{children}{iconRight}
    </button>);

}

// Card
function Card({ children, theme, padding = 16, radius, style: extra = {} }) {
  // radius-card (20) pour toutes les cartes
  return (
    <div style={{
      background: theme.surface, borderRadius: REL.radius.card, padding,
      border: `1px solid ${theme.border}`, boxShadow: theme.shadowCard,
      ...extra
    }}>{children}</div>);

}

// Section title
function Section({ title, action, children, style: extra = {} }) {
  return (
    <div style={{ marginBottom: 24, ...extra }}>
      {title &&
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontFamily: REL.font.display, fontSize: 17, lineHeight: '24px', fontWeight: 600 }}>{title}</h3>
          {action}
        </div>
      }
      {children}
    </div>);

}

// Status bar (custom for screens that don't use IOSDevice nav)
function CustomStatusBar({ dark, time = '9:41' }) {
  const c = dark ? '#ededf2' : '#17161f';
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