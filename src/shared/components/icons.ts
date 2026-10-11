/**
 * Tracés repris à l'identique de `design/maquettes/design-system.jsx`.
 * Primitives géométriques uniquement : aucun tracé complexe, conformément à la note des maquettes.
 */
export interface PathShape {
  kind: 'path';
  d: string;
}
export interface CircleShape {
  kind: 'circle';
  cx: number;
  cy: number;
  r: number;
}
export interface RectShape {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
}
export type Shape = PathShape | CircleShape | RectShape;

const p = (d: string): PathShape => ({ kind: 'path', d });
const c = (cx: number, cy: number, r: number): CircleShape => ({ kind: 'circle', cx, cy, r });
const r = (x: number, y: number, width: number, height: number, rx?: number): RectShape => ({
  kind: 'rect',
  x,
  y,
  width,
  height,
  rx,
});

export const ICON_SHAPES = {
  home: [p('M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z')],
  search: [c(11, 11, 7), p('M20 20l-3.5-3.5')],
  plus: [p('M12 5v14M5 12h14')],
  inbox: [p('M3 13l3-9h12l3 9v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z'), p('M3 13h5l1 2h6l1-2h5')],
  chat: [p('M21 12a8 8 0 0 1-12.3 6.7L3 20l1.3-5.7A8 8 0 1 1 21 12z')],
  user: [c(12, 8, 4), p('M4 21a8 8 0 0 1 16 0')],
  map: [p('M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z'), p('M9 4v14M15 6v14')],
  pin: [p('M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z'), c(12, 9, 2.5)],
  filter: [p('M3 5h18M6 12h12M10 19h4')],
  star: [p('M12 3l2.6 5.5 6 .9-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.9z')],
  chevronR: [p('M9 6l6 6-6 6')],
  chevronL: [p('M15 6l-6 6 6 6')],
  chevronD: [p('M6 9l6 6 6-6')],
  chevronU: [p('M6 15l6-6 6 6')],
  close: [p('M6 6l12 12M18 6L6 18')],
  check: [p('M5 12l5 5L20 7')],
  bell: [p('M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8z'), p('M10 21a2 2 0 0 0 4 0')],
  shield: [p('M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z'), p('M9 12l2 2 4-4')],
  wallet: [r(3, 6, 18, 13, 2.5), p('M16 13h2'), p('M3 9V6a1 1 0 0 1 1.3-1L17 8')],
  camera: [r(3, 6, 18, 14, 3), c(12, 13, 4), p('M9 6l1.5-2h3L15 6')],
  image: [r(3, 4, 18, 16, 3), c(9, 10, 2), p('M3 18l5-5 4 4 3-3 6 6')],
  location: [c(12, 12, 3), p('M12 2v3M12 19v3M2 12h3M19 12h3')],
  settings: [
    c(12, 12, 3),
    p(
      'M19.4 15a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z',
    ),
  ],
  flash: [p('M13 2L4 14h7l-1 8 9-12h-7z')],
  arrowR: [p('M5 12h14M13 5l7 7-7 7')],
  arrowL: [p('M19 12H5M11 5l-7 7 7 7')],
  arrowUp: [p('M12 19V5M5 12l7-7 7 7')],
  send: [p('M22 2L11 13M22 2l-7 20-4-9-9-4z')],
  eye: [p('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z'), c(12, 12, 3)],
  google: [c(12, 12, 9), p('M12 8v4l3 2')],
  apple: [
    p(
      'M16 3a4 4 0 0 0-3 2M8 8c-2 0-4 2-4 5 0 4 3 8 5 8 1 0 1.5-.5 3-.5s2 .5 3 .5c2 0 5-4 5-8 0-3-2-5-4-5-1 0-2 .5-3 .5S9 8 8 8z',
    ),
  ],
  phone: [
    p(
      'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4 13 13 0 0 0 2.6.6 2 2 0 0 1 1.7 2z',
    ),
  ],
  grid: [r(3, 3, 7, 7, 1.5), r(14, 3, 7, 7, 1.5), r(3, 14, 7, 7, 1.5), r(14, 14, 7, 7, 1.5)],
  list: [p('M8 6h13M8 12h13M8 18h13'), c(3.5, 6, 1), c(3.5, 12, 1), c(3.5, 18, 1)],
  clock: [c(12, 12, 9), p('M12 7v5l3 2')],
  calendar: [r(3, 5, 18, 16, 2), p('M3 10h18M8 3v4M16 3v4')],
  wrench: [p('M14.7 6.3a4 4 0 0 0 5 5l-9.5 9.5a3 3 0 0 1-4.2-4.2z')],
  bolt: [p('M13 2L4 14h7l-1 8 9-12h-7z')],
  video: [r(3, 6, 13, 12, 2), p('M16 10l5-3v10l-5-3z')],
  laptop: [r(3, 5, 18, 11, 2), p('M2 19h20')],
  cog: [
    c(12, 12, 3),
    p(
      'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1',
    ),
  ],
  sun: [
    c(12, 12, 4),
    p('M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5'),
  ],
  moon: [p('M21 13a8 8 0 0 1-10-10 8 8 0 1 0 10 10z')],
  badge: [c(12, 9, 6), p('M9 14l-2 7 5-3 5 3-2-7')],
  heart: [p('M12 21s-7-4-7-11a4 4 0 0 1 7-3 4 4 0 0 1 7 3c0 7-7 11-7 11z')],
  bookmark: [p('M6 4h12v17l-6-4-6 4z')],
  upload: [p('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v13')],
  file: [p('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'), p('M14 2v6h6')],
  plug: [p('M9 2v6M15 2v6M6 8h12v4a6 6 0 1 1-12 0z'), p('M12 18v4')],
  edit: [p('M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z')],
  info: [c(12, 12, 9), p('M12 8h.01M12 12v5')],
  sparkle: [
    p('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z'),
    p('M19 16l.7 2L21 19l-1.3.5L19 21l-.7-1.5L17 19l1.3-1z'),
  ],
  minus: [p('M5 12h14')],
} as const satisfies Record<string, readonly Shape[]>;

export type IconName = keyof typeof ICON_SHAPES;

export const ICON_NAMES = Object.keys(ICON_SHAPES) as IconName[];
