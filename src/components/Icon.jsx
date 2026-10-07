const paths = {
  plate: (<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /><path d="M4 9H2.5M4 12H2M4 15H2.5M20 9h1.5M20 12h2M20 15h1.5" /></>),
  home: (<><path d="M4 11l8-7 8 7" /><path d="M6 9.5V20h12V9.5" /></>),
  leaf: (<><path d="M5 19C5 9 12 4 20 4c0 8-5 15-15 15" /><path d="M5 19c3-5 7-9 11-11" /></>),
  heart: (<><path d="M12 20s-7-4.5-9-9c-1.2-2.7.5-6 3.5-6 2 0 3.5 1.5 5.5 4 2-2.5 3.5-4 5.5-4 3 0 4.7 3.3 3.5 6-2 4.5-9 9-9 9z" /></>),
  shield: (<><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>),
  chat: (<><path d="M4 6h16v10H9l-5 4z" /></>),
  scooter: (<><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8 18h6l3-7h-4M12 4h3l2 7" /></>),
  clock: (<><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>),
  search: (<><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></>),
  cart: (<><path d="M3 4h2l2.5 12h11L21 8H7" /><circle cx="9" cy="20" r="1.5" /><circle cx="17" cy="20" r="1.5" /></>),
  menu: (<><path d="M4 7h16M4 12h16M4 17h16" /></>),
  chef: (<><path d="M7 13a3 3 0 1 1 1-5.9A4 4 0 0 1 12 5a4 4 0 0 1 4 2.1A3 3 0 1 1 17 13v2H7z" /><path d="M7 15v6h10v-6" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>),
  star: (<><path d="M12 3l2.7 5.8 6.3.8-4.6 4.3 1.2 6.1L12 17l-5.6 3 1.2-6.1L3 9.6l6.3-.8z" /></>),
  spark: (<><path d="M12 3v18M4 12h16M6 6l12 12M18 6L6 18" /></>),
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {paths[name] || paths.plate}
    </svg>
  );
}
