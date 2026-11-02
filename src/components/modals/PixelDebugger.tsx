import { useEffect, useState } from 'react';
import {
  getPixelEventLog,
  subscribeToPixelEvents,
  type CapturedPixelEvent,
} from '../../lib/tracking';

export const PixelDebugger = () => {
  const [events, setEvents] = useState<CapturedPixelEvent[]>(getPixelEventLog());
  const [open, setOpen] = useState(false);
  const delivered = events.length > 0;

  useEffect(() => subscribeToPixelEvents(setEvents), []);

  return (
    <aside aria-label="Whop pixel event inspector" className="pixel-debugger">
      <button onClick={() => setOpen(!open)} className="pixel-debugger-toggle" aria-expanded={open}>
        <span className="pixel-dot">
          <span className="pixel-dot-ping"></span>
          <span className="pixel-dot-core"></span>
        </span>
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
        </svg>
        <span>Whop Pixel</span>
        <span className="pixel-count">{events.length}</span>
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="pixel-debugger-tray">
          <div className="pixel-debugger-head">
            <div>
              <span className="pixel-debugger-title">whop.track events</span>
              <span className="pixel-debugger-sub">Whop Live · biz_LHN26NTWx9YO5m</span>
            </div>
            {delivered ? (
              <span className="pixel-status is-live">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                pixel live
              </span>
            ) : (
              <span className="pixel-status is-pending">
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16.247 7.761a6 6 0 0 1 0 8.478" />
                  <path d="M19.075 4.933a10 10 0 0 1 0 14.134" />
                  <path d="M4.925 19.067a10 10 0 0 1 0-14.134" />
                  <path d="M7.753 16.239a6 6 0 0 1 0-8.478" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                not delivered yet
              </span>
            )}
          </div>
          <div className="pixel-debugger-body">
            {events.length === 0 ? (
              <div className="pixel-empty">
                No events yet. Open a service, submit the estimate form, or start a checkout.
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="pixel-event">
                  <div className="pixel-event-head">
                    <span className="pixel-event-name">
                      <span className="pixel-event-dot pixel"></span>
                      whop.track("{ev.name}")
                    </span>
                    <span className="pixel-event-meta">
                      <span className="pixel-delivery pixel">delivered</span>
                      {new Date(ev.time).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="pixel-event-data">{JSON.stringify(ev.properties, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
          <a
            className="pixel-debugger-foot"
            href="https://whop.com/dashboard/events"
            target="_blank"
            rel="noreferrer"
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            Verify the same events in Whop Dashboard → Events
          </a>
        </div>
      )}
    </aside>
  );
};
