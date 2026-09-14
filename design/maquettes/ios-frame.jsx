// ios-frame.jsx — iOS 26 "Liquid Glass" device frame kit

const GLASS = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.4)'
};
const GLASS_DARK = {
  background: 'rgba(20,20,26,0.55)',
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.08)'
};

function IOSStatusBar({ dark, time = '9:41' }) {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 54,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      padding: '0 24px 8px', fontFamily: '-apple-system, "Inter", sans-serif', fontWeight: 600, fontSize: 15, color: c, zIndex: 40
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="7" width="2.5" height="4" rx="0.5" fill={c} /><rect x="4" y="5" width="2.5" height="6" rx="0.5" fill={c} /><rect x="8" y="2.5" width="2.5" height="8.5" rx="0.5" fill={c} /><rect x="12" y="0" width="2.5" height="11" rx="0.5" fill={c} /></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="19" height="10" rx="2.5" stroke={c} strokeOpacity="0.5" fill="none" /><rect x="2" y="2" width="16" height="7" rx="1.5" fill={c} /></svg>
      </div>
    </div>);

}

function IOSGlassPill({ children, dark, style: extra = {} }) {
  return (
    <div style={{
      ...(dark ? GLASS_DARK : GLASS), borderRadius: 999, padding: '8px 16px',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)', ...extra
    }}>{children}</div>);

}

function IOSNavBar({ title, dark, large, left, right, onBack, accent }) {
  const c = dark ? '#fff' : '#0F2C63';
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 30,
      ...(dark ? GLASS_DARK : GLASS), borderLeft: 'none', borderRight: 'none', borderTop: 'none',
      paddingTop: 54
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', minHeight: 44 }}>
        <div style={{ minWidth: 44 }}>
          {left !== undefined ? left :
          onBack &&
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: accent || c, display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 4 }}>
              <Icon name="chevronL" size={24} color={accent || c} />
            </button>
          }
        </div>
        {!large && <div style={{ fontFamily: REL.font.display, fontWeight: 700, fontSize: 17, color: c }}>{title}</div>}
        <div style={{ minWidth: 44, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
      </div>
      {large &&
      <div style={{ padding: '4px 20px 14px' }}>
          <h1 style={{ margin: 0, fontFamily: REL.font.display, fontWeight: 800, fontSize: 30, letterSpacing: -0.5, color: c }}>{title}</h1>
        </div>
      }
    </div>);

}

function IOSListRow({ icon, label, value, onClick, danger, chevron = true, dark }) {
  const c = dark ? '#fff' : '#0F2C63';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
      cursor: onClick ? 'pointer' : 'default'
    }}>
      {icon && <div style={{ width: 28, display: 'flex', justifyContent: 'center' }}>{icon}</div>}
      <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: danger ? '#E5484D' : c }}>{label}</div>
      {value && <div style={{ fontSize: 14, color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>{value}</div>}
      {chevron && onClick && <Icon name="chevronR" size={17} color={dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'} />}
    </div>);

}

function IOSList({ children, dark }) {
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
    }}>
      {React.Children.map(children, (child, i) =>
      <>
          {i > 0 && <div style={{ height: 1, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', marginLeft: 56 }} />}
          {child}
        </>
      )}
    </div>);

}

function IOSDevice({ children, width = 402, height = 874, dark, statusBar = true, time, homeIndicator = true }) {
  return (
    <div style={{
      width, height, borderRadius: 56, position: 'relative', overflow: 'hidden',
      background: dark ? '#0B1220' : '#fff',
      boxShadow: '0 0 0 12px #0a0a0c, 0 0 0 14px rgba(255,255,255,0.06), 0 30px 60px rgba(0,0,0,0.35)',
      fontFamily: REL.font.body
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
      {statusBar && <IOSStatusBar dark={dark} time={time} />}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        width: 96, height: 30, borderRadius: 20, background: '#000', zIndex: 50
      }} />
      {homeIndicator &&
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 3, background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', zIndex: 50
      }} />
      }
    </div>);

}

function IOSKeyboard({ dark }) {
  const rows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫']];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      ...(dark ? GLASS_DARK : GLASS), padding: '10px 6px 26px', zIndex: 45
    }}>
      {rows.map((row, i) =>
      <div key={i} style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
          {row.map((k) =>
          <div key={k} style={{
            minWidth: k.length > 1 ? 40 : 28, height: 38, borderRadius: 7,
            background: dark ? 'rgba(255,255,255,0.12)' : '#fff',
            boxShadow: '0 1px 0 rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: dark ? '#fff' : '#0F2C63', flex: k.length > 1 ? 'none' : 1
          }}>{k}</div>
          )}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
        <div style={{ flex: 5, height: 38, borderRadius: 7, background: dark ? 'rgba(255,255,255,0.12)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: dark ? '#fff' : '#0F2C63' }}>espace</div>
      </div>
    </div>);

}

Object.assign(window, { IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard });