import { useState, useEffect } from 'react';

export const PixelDebugger = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      if ((window as any).whop?.q) {
        setEvents((window as any).whop.q.slice(-20).reverse());
      }
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside aria-label="Whop pixel event inspector" className="pixel-debugger">
      <button onClick={() => setOpen(!open)} className="pixel-debugger-toggle" aria-expanded={open}>
        <span className="pixel-dot">
          <span className="pixel-dot-ping"></span>
          <span className="pixel-dot-core"></span>
        </span>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span>Whop Pixel</span>
        <span className="pixel-count">{events.length}</span>
        {open ? (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>
      {open && (
        <div className="pixel-debugger-tray">
          <div className="pixel-debugger-head">
            <div>
              <span className="pixel-debugger-title">whop.track events</span>
              <span className="pixel-debugger-sub">PRODUCTION · biz_LHN26NTWx9YO5m</span>
            </div>
            <span className="pixel-status is-live">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              pixel live
            </span>
          </div>
          <div className="pixel-debugger-body">
            {events.length === 0 ? (
              <div className="pixel-empty">No events yet. Open a service, submit the estimate form, or start a checkout.</div>
            ) : (
              events.map((ev, idx) => (
                <div key={idx} className="pixel-event">
                  <div className="pixel-event-head">
                    <span className="pixel-event-name">
                      <span className="pixel-event-dot pixel"></span>
                      whop.track("{ev[1] || 'page'}")
                    </span>
                    <span className="pixel-event-meta">
                      <span className="pixel-delivery pixel">delivered</span>
                      {new Date(ev[0]).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="pixel-event-data">{JSON.stringify(ev.slice(1), null, 2)}</pre>
                </div>
              ))
            )}
          </div>
          <a className="pixel-debugger-foot" href="https://whop.com/dashboard/events" target="_blank" rel="noreferrer">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Verify the same events in Whop Dashboard → Events
          </a>
        </div>
      )}
    </aside>
  );
};
