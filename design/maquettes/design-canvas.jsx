// design-canvas.jsx — figma-style canvas: viewport, sections, artboards, focus overlay, post-its

const DC = {
  bg: '#F5F6F8',
  grid: 'rgba(0,0,0,0.045)',
  sectionTitle: '#8A8F98',
  post: '#FFF3B0'
};

if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const style = document.createElement('style');
  style.id = 'dc-styles';
  style.textContent = `
    .dc-artboard { transition: box-shadow .15s ease; }
    .dc-artboard:hover { box-shadow: 0 0 0 2px rgba(31,91,196,0.35); }
    .dc-drag-handle { cursor: grab; }
    .dc-drag-handle:active { cursor: grabbing; }
  `;
  document.head.appendChild(style);
}

const DCCtx = React.createContext(null);

function DesignCanvas({ children, stateFile = '.design-canvas.state.json' }) {
  const [state, setState] = React.useState({ zoom: 1, pan: { x: 0, y: 0 } });

  React.useEffect(() => {
    fetch(stateFile).then((r) => r.ok ? r.json() : null).then((data) => {
      if (data) setState((s) => ({ ...s, ...data }));
    }).catch(() => {});
  }, []);

  const persist = React.useCallback((next) => {
    if (window.omelette?.writeFile) {
      window.omelette.writeFile(stateFile, JSON.stringify(next, null, 2));
    }
  }, [stateFile]);

  return (
    <DCCtx.Provider value={{ state, setState, persist }}>
      <div style={{ width: '100%', minHeight: '100%', background: DC.bg }}>
        <DCViewport>{children}</DCViewport>
      </div>
    </DCCtx.Provider>);

}

function DCViewport({ children }) {
  const ref = React.useRef(null);
  const [transform, setTransform] = React.useState({ x: 0, y: 0, scale: 0.55 });
  const dragRef = React.useRef(null);

  const onWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      setTransform((t) => ({ ...t, scale: Math.min(2.5, Math.max(0.1, t.scale + delta * t.scale)) }));
    } else {
      setTransform((t) => ({ ...t, x: t.x - e.deltaX, y: t.y - e.deltaY }));
    }
  };

  const onPointerDown = (e) => {
    if (e.target !== ref.current) return;
    dragRef.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setTransform((t) => ({ ...t, x: dragRef.current.tx + dx, y: dragRef.current.ty + dy }));
  };
  const onPointerUp = () => { dragRef.current = null; };

  return (
    <div
      ref={ref}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative', cursor: dragRef.current ? 'grabbing' : 'default' }}>

      <div style={{
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        transformOrigin: '0 0', padding: 80, display: 'flex', flexDirection: 'column', gap: 100
      }}>
        {children}
      </div>
    </div>);

}

function DCSection({ title, children }) {
  return (
    <div>
      <div style={{ fontFamily: REL.font.mono, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: DC.sectionTitle, marginBottom: 24 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 60, alignItems: 'flex-start' }}>{children}</div>
    </div>);

}

// Marker component — actual rendering handled by DCArtboardFrame wrapper in app.jsx usage
function DCArtboard({ children }) {
  return <DCArtboardFrame>{children}</DCArtboardFrame>;
}

function DCArtboardFrame({ title, children }) {
  const [dragging, setDragging] = React.useState(false);
  return (
    <div className="dc-artboard" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {title &&
      <div className="dc-drag-handle" onPointerDown={() => setDragging(true)} onPointerUp={() => setDragging(false)}
        style={{ fontFamily: REL.font.body, fontSize: 13, fontWeight: 600, color: '#444' }}>
          {title}
        </div>
      }
      <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}>
        {children}
      </div>
    </div>);

}

function DCEditable({ value, onChange, style: extra = {} }) {
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange && onChange(e.target.textContent)}
      style={{ outline: 'none', ...extra }}>

      {value}
    </span>);

}

function DCFocusOverlay({ artboards, index, onClose, onNavigate }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate(Math.min(artboards.length - 1, index + 1));
      if (e.key === 'ArrowLeft') onNavigate(Math.max(0, index - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, artboards.length]);

  if (!artboards || !artboards[index]) return null;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,10,14,0.92)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
        {artboards[index].content}
      </div>
      <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {artboards.map((_, i) =>
        <div key={i} onClick={() => onNavigate(i)} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: i === index ? '#fff' : 'rgba(255,255,255,0.3)', cursor: 'pointer'
        }} />
        )}
      </div>
    </div>,
    document.body);

}

function DCPostIt({ text, color = DC.post, style: extra = {} }) {
  return (
    <div style={{
      width: 180, minHeight: 120, background: color, padding: 14,
      fontFamily: '"Inter", sans-serif', fontSize: 13, lineHeight: 1.4, color: '#3a3410',
      boxShadow: '0 8px 20px rgba(0,0,0,0.12)', transform: 'rotate(-1.2deg)', ...extra
    }}>
      {text}
    </div>);

}

Object.assign(window, { DesignCanvas, DCSection, DCArtboard, DCPostIt });