// tweaks-panel.jsx — generic design-tweaks control panel + host bridge

const __TWEAKS_STYLE = `
  .tw-panel { font-family: "Inter", sans-serif; }
  .tw-panel input[type=range] { accent-color: #1F5BC4; }
`;

if (typeof document !== 'undefined' && !document.getElementById('tw-styles')) {
  const style = document.createElement('style');
  style.id = 'tw-styles';
  style.textContent = __TWEAKS_STYLE;
  document.head.appendChild(style);
}

function useTweaks(defaults) {
  const [tweaks, setTweaks] = React.useState(defaults);
  const editModeRef = React.useRef(false);

  React.useEffect(() => {
    const onMessage = (e) => {
      const msg = e.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === '__activate_edit_mode') editModeRef.current = true;
      if (msg.type === '__deactivate_edit_mode') editModeRef.current = false;
    };
    window.addEventListener('message', onMessage);
    window.parent?.postMessage({ type: '__edit_mode_available', keys: Object.keys(defaults) }, '*');
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const set = React.useCallback((key, value) => {
    setTweaks((t) => {
      const next = { ...t, [key]: value };
      window.parent?.postMessage({ type: '__edit_mode_set_keys', keys: { [key]: value } }, '*');
      return next;
    });
  }, []);

  return [tweaks, set];
}

function TweaksPanel({ children, dark }) {
  return (
    <div className="tw-panel" style={{
      position: 'fixed', top: 20, right: 20, width: 280, maxHeight: '90vh', overflowY: 'auto',
      background: dark ? '#161B22' : '#fff', borderRadius: 16,
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      boxShadow: '0 20px 50px rgba(0,0,0,0.18)', padding: 16, zIndex: 2000, color: dark ? '#fff' : '#111'
    }}>
      {children}
    </div>);

}

function TweakSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.5, marginBottom: 8 }}>{title}</div>
      {children}
    </div>);

}

function TweakRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
      <div style={{ fontSize: 13, opacity: 0.8 }}>{label}</div>
      <div>{children}</div>
    </div>);

}

function TweakSlider({ value, min = 0, max = 100, step = 1, onChange }) {
  return <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />;
}

function TweakToggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 40, height: 24, borderRadius: 999, background: value ? '#1F5BC4' : 'rgba(128,128,128,0.3)',
      position: 'relative', cursor: 'pointer', transition: 'background .15s'
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3,
        left: value ? 19 : 3, transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }} />
    </div>);

}

function TweakRadio({ value, options, onChange }) {
  return (
    <div style={{ display: 'flex', border: '1px solid rgba(128,128,128,0.25)', borderRadius: 8, overflow: 'hidden' }}>
      {options.map((opt) =>
      <div key={opt.value} onClick={() => onChange(opt.value)} style={{
        padding: '4px 8px', fontSize: 12, cursor: 'pointer',
        background: value === opt.value ? '#1F5BC4' : 'transparent',
        color: value === opt.value ? '#fff' : 'inherit'
      }}>
          {opt.label}
        </div>
      )}
    </div>);

}

function TweakSelect({ value, options, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ fontSize: 12, padding: '4px 6px', borderRadius: 6 }}>
      {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>);

}

function TweakText({ value, onChange }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={{ fontSize: 12, padding: '4px 6px', borderRadius: 6, width: 120 }} />;
}

function TweakNumber({ value, onChange, step = 1 }) {
  const dragRef = React.useRef(null);
  const onPointerDown = (e) => { dragRef.current = { x: e.clientX, v: value }; };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    onChange(dragRef.current.v + Math.round(dx * step));
  };
  const onPointerUp = () => { dragRef.current = null; };
  return (
    <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, background: 'rgba(128,128,128,0.15)', cursor: 'ew-resize', userSelect: 'none' }}>
      {value}
    </div>);

}

function TweakColor({ value, onChange }) {
  return <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 32, height: 24, border: 'none', background: 'none', cursor: 'pointer' }} />;
}

function TweakButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 12, padding: '6px 10px', borderRadius: 8, border: 'none',
      background: '#1F5BC4', color: '#fff', cursor: 'pointer', width: '100%'
    }}>{label}</button>);

}

Object.assign(window, {
  useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider, TweakToggle,
  TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton
});