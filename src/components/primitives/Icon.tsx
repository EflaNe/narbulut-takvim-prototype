/**
 * Canonical ekranlardaki SVG'lerin birebir karşılığı.
 * 16×16 viewBox, currentColor, stroke tabanlı.
 */
import type { CSSProperties } from 'react';

export type IconName =
  | 'calendar' | 'list' | 'building' | 'chevronLeft' | 'chevronRight' | 'chevronUp'
  | 'chevronDown' | 'plus' | 'plusBold' | 'plusCircle' | 'person' | 'people' | 'search'
  | 'check' | 'dots' | 'recurrence' | 'clock' | 'close' | 'trash' | 'pencil' | 'warning'
  | 'info' | 'door' | 'lock' | 'arrowRight' | 'share' | 'palette' | 'checkCircle' | 'xCircle';

const paths: Record<IconName, React.ReactNode> = {
  calendar: (<>
    <rect x="2.5" y="3.4" width="11" height="10.1" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2.5 6.6h11M5.6 2.2v2.2M10.4 2.2v2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>),
  list: <path d="M3 4.2h10M3 8h7M3 11.8h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />,
  building: (<>
    <path d="M2.6 13.4V5.2L8 2.6l5.4 2.6v8.2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M6.4 13.4V9.2h3.2v4.2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </>),
  chevronLeft: <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  chevronRight: <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  chevronUp: <path d="M4 9.5l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />,
  chevronDown: <path d="M4 6.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />,
  plus: <path d="M8 3.4v9.2M3.4 8h9.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  plusBold: <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />,
  plusCircle: (<>
    <circle cx="8" cy="8" r="5.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 5.4v5.2M5.4 8h5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>),
  person: (<>
    <circle cx="8" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3.6 13c.4-2.1 2.2-3.4 4.4-3.4S12 10.9 12.4 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>),
  people: (<>
    <circle cx="6.2" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2.2 13c.4-2 2-3.2 4-3.2s3.6 1.2 4 3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M10.6 4.1a2.2 2.2 0 0 1 0 3.9M11.4 9.9c1.4.3 2.4 1.5 2.6 3.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>),
  search: (<>
    <circle cx="7" cy="7" r="4.2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M10.3 10.3L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>),
  check: <path d="M3.6 8.4l2.8 2.8 5.8-6.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />,
  dots: (<>
    <circle cx="3.4" cy="8" r="1.05" fill="currentColor" />
    <circle cx="8" cy="8" r="1.05" fill="currentColor" />
    <circle cx="12.6" cy="8" r="1.05" fill="currentColor" />
  </>),
  recurrence: (<>
    <path d="M12.6 7.2A4.9 4.9 0 1 1 7.7 2.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M7.7 1.2v2.4h2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </>),
  clock: (<>
    <circle cx="8" cy="8" r="5.4" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 5.2V8l2 1.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </>),
  close: <path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />,
  trash: (<>
    <path d="M3.4 4.6h9.2M6.4 4.6V3.2h3.2v1.4M4.8 4.6l.5 8.2h5.4l.5-8.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  pencil: <path d="M11.2 2.8l2 2-7.4 7.4-2.6.6.6-2.6 7.4-7.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />,
  warning: (<>
    <path d="M8 2.8l5.6 9.8H2.4L8 2.8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M8 6.4v2.8M8 10.9v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>),
  info: (<>
    <circle cx="8" cy="8" r="5.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 7.2v3.4M8 5.2v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>),
  door: (<>
    <path d="M4 2.8h8v10.4H4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="9.8" cy="8.2" r=".9" fill="currentColor" />
  </>),
  lock: (<>
    <rect x="3.4" y="7" width="9.2" height="6.2" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5.6 7V5.4a2.4 2.4 0 0 1 4.8 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>),
  arrowRight: <path d="M3 8h9M8.6 4.6L12 8l-3.4 3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />,
  share: (<>
    <circle cx="11.6" cy="4" r="1.9" stroke="currentColor" strokeWidth="1.35" />
    <circle cx="4.4" cy="8" r="1.9" stroke="currentColor" strokeWidth="1.35" />
    <circle cx="11.6" cy="12" r="1.9" stroke="currentColor" strokeWidth="1.35" />
    <path d="M6.1 7.1l3.8-2.1M6.1 8.9l3.8 2.1" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
  </>),
  palette: (<>
    <path d="M8 2.6a5.4 5.4 0 1 0 0 10.8c.9 0 1.3-.6 1.3-1.2 0-.7-.6-1.1-.6-1.7 0-.5.4-.9 1-.9h1.1a3 3 0 0 0 3-3c0-2.3-2.6-4-5.8-4z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
    <circle cx="5.6" cy="7" r=".95" fill="currentColor" />
    <circle cx="8.4" cy="5.4" r=".95" fill="currentColor" />
  </>),
  checkCircle: (<>
    <circle cx="8" cy="8" r="5.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5.6 8.2l1.7 1.7 3.3-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  xCircle: (<>
    <circle cx="8" cy="8" r="5.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M6.2 6.2l3.6 3.6M9.8 6.2l-3.6 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </>),
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

export function Icon({ name, size = 15, color, style, className }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true"
      className={className}
      style={{ flex: 'none', color, display: 'block', ...style }}
    >
      {paths[name]}
    </svg>
  );
}
