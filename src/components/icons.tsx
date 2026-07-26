import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function S({ size = 16, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const ArrowRight = (p: P) => (
  <S {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </S>
)
export const ArrowLeft = (p: P) => (
  <S {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </S>
)
export const ChevronRight = (p: P) => (
  <S {...p}>
    <path d="M9 6l6 6-6 6" />
  </S>
)
export const ChevronLeft = (p: P) => (
  <S {...p}>
    <path d="M15 6l-6 6 6 6" />
  </S>
)
export const ChevronDown = (p: P) => (
  <S {...p}>
    <path d="M6 9l6 6 6-6" />
  </S>
)
export const Check = (p: P) => (
  <S {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </S>
)
export const X = (p: P) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </S>
)
export const Plus = (p: P) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
)
export const Minus = (p: P) => (
  <S {...p}>
    <path d="M5 12h14" />
  </S>
)
export const Alert = (p: P) => (
  <S {...p}>
    <path d="M12 3.5L1.8 20.5h20.4L12 3.5z" />
    <path d="M12 10v4.5M12 17.6v.1" />
  </S>
)
export const Clock = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </S>
)
export const Calendar = (p: P) => (
  <S {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.8h17M8 3.2v3.6M16 3.2v3.6" />
  </S>
)
export const Camera = (p: P) => (
  <S {...p}>
    <path d="M3.5 8.5h3.2L8.4 6h7.2l1.7 2.5h3.2v11H3.5z" />
    <circle cx="12" cy="13.6" r="3.3" />
  </S>
)
export const Search = (p: P) => (
  <S {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </S>
)
export const Filter = (p: P) => (
  <S {...p}>
    <path d="M3.5 5.5h17l-6.6 7.8v5.6l-3.8 2v-7.6z" />
  </S>
)
export const Bell = (p: P) => (
  <S {...p}>
    <path d="M6.5 10a5.5 5.5 0 0111 0c0 4.2 1.6 5.6 1.6 5.6H4.9S6.5 14.2 6.5 10z" />
    <path d="M10.2 19a2 2 0 003.6 0" />
  </S>
)
export const Shield = (p: P) => (
  <S {...p}>
    <path d="M12 3l7.5 3v5.4c0 4.6-3.1 8-7.5 9.6-4.4-1.6-7.5-5-7.5-9.6V6z" />
    <path d="M9 12l2.2 2.2L15.2 10" />
  </S>
)
export const Users = (p: P) => (
  <S {...p}>
    <circle cx="9" cy="8.5" r="3.3" />
    <path d="M2.8 19.5a6.2 6.2 0 0112.4 0" />
    <path d="M16 5.6a3.3 3.3 0 010 6M17.6 14.2a6.2 6.2 0 013.6 5.3" />
  </S>
)
export const User = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="8.4" r="3.6" />
    <path d="M4.8 20a7.2 7.2 0 0114.4 0" />
  </S>
)
export const Doc = (p: P) => (
  <S {...p}>
    <path d="M6 3.5h7.5L18.5 8.5v12H6z" />
    <path d="M13.2 3.6v5.2h5.1M9 13h6M9 16.4h4.4" />
  </S>
)
export const Clipboard = (p: P) => (
  <S {...p}>
    <path d="M9 4.6H7a1.6 1.6 0 00-1.6 1.6v13A1.6 1.6 0 007 20.8h10a1.6 1.6 0 001.6-1.6v-13A1.6 1.6 0 0017 4.6h-2" />
    <rect x="9" y="2.8" width="6" height="3.6" rx="1.1" />
    <path d="M8.8 12.6l2 2 4.4-4.4" />
  </S>
)
export const Grid = (p: P) => (
  <S {...p}>
    <rect x="3.6" y="3.6" width="7" height="7" rx="1.2" />
    <rect x="13.4" y="3.6" width="7" height="7" rx="1.2" />
    <rect x="3.6" y="13.4" width="7" height="7" rx="1.2" />
    <rect x="13.4" y="13.4" width="7" height="7" rx="1.2" />
  </S>
)
export const List = (p: P) => (
  <S {...p}>
    <path d="M8.2 6.5h12M8.2 12h12M8.2 17.5h12M3.8 6.5h.01M3.8 12h.01M3.8 17.5h.01" />
  </S>
)
export const Settings = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M19.4 14.4a1.7 1.7 0 00.35 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.35 1.7 1.7 0 00-1 1.56V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.55 1.7 1.7 0 00-1.87.35l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.35-1.87 1.7 1.7 0 00-1.56-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.55-1.1 1.7 1.7 0 00-.35-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.35H9a1.7 1.7 0 001-1.56V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.56 1.7 1.7 0 001.87-.35l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.35 1.87V9a1.7 1.7 0 001.56 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1.4z" />
  </S>
)
export const Lock = (p: P) => (
  <S {...p}>
    <rect x="4.6" y="10.4" width="14.8" height="10" rx="2" />
    <path d="M8.2 10.2V7.6a3.8 3.8 0 017.6 0v2.6" />
  </S>
)
export const Refresh = (p: P) => (
  <S {...p}>
    <path d="M20 11.5A8 8 0 006.3 6.3L4 8.5" />
    <path d="M4 4.5v4h4" />
    <path d="M4 12.5a8 8 0 0013.7 5.2L20 15.5" />
    <path d="M20 19.5v-4h-4" />
  </S>
)
export const External = (p: P) => (
  <S {...p}>
    <path d="M14 4.5h5.5V10" />
    <path d="M19 5l-8 8" />
    <path d="M18.5 14v4.5a1.6 1.6 0 01-1.6 1.6H5.9a1.6 1.6 0 01-1.6-1.6V7.1a1.6 1.6 0 011.6-1.6H10" />
  </S>
)
export const Play = (p: P) => (
  <S {...p}>
    <path d="M7.5 4.8l11.5 7.2-11.5 7.2z" />
  </S>
)
export const Flag = (p: P) => (
  <S {...p}>
    <path d="M5.5 21V3.8M5.5 4.6h10.8l-1.6 3.6 1.6 3.6H5.5" />
  </S>
)
export const Paperclip = (p: P) => (
  <S {...p}>
    <path d="M20.5 11.5l-8.4 8.4a5 5 0 01-7.1-7.1l8.6-8.6a3.4 3.4 0 014.8 4.8l-8.5 8.5a1.8 1.8 0 01-2.5-2.5l7.9-7.9" />
  </S>
)
export const Menu = (p: P) => (
  <S {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </S>
)
export const Home = (p: P) => (
  <S {...p}>
    <path d="M4 10.4L12 4l8 6.4V20a.9.9 0 01-.9.9h-4.3v-6h-5.6v6H4.9A.9.9 0 014 20z" />
  </S>
)
export const Chart = (p: P) => (
  <S {...p}>
    <path d="M4 20V4M4 20h16" />
    <path d="M8 16.5V12M12.4 16.5V7.8M16.8 16.5v-6.2" />
  </S>
)
export const Layers = (p: P) => (
  <S {...p}>
    <path d="M12 3.2l8.6 4.4L12 12 3.4 7.6z" />
    <path d="M3.4 12.2L12 16.6l8.6-4.4M3.4 16.6L12 21l8.6-4.4" />
  </S>
)
export const Send = (p: P) => (
  <S {...p}>
    <path d="M21 3.5L10.6 13.9M21 3.5l-6.6 17.2-3.8-6.8-6.8-3.8z" />
  </S>
)
export const Dot = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
  </S>
)
export const Pause = (p: P) => (
  <S {...p}>
    <path d="M9 4.8v14.4M15 4.8v14.4" />
  </S>
)
export const Copy = (p: P) => (
  <S {...p}>
    <rect x="8.6" y="8.6" width="11.8" height="11.8" rx="1.8" />
    <path d="M15.4 8.4V5.4a1.8 1.8 0 00-1.8-1.8H5.4a1.8 1.8 0 00-1.8 1.8v8.2a1.8 1.8 0 001.8 1.8h3" />
  </S>
)
export const Trash = (p: P) => (
  <S {...p}>
    <path d="M4.5 6.6h15M9.4 6.4V4.6a1.2 1.2 0 011.2-1.2h2.8a1.2 1.2 0 011.2 1.2v1.8" />
    <path d="M6.6 6.6l.9 13a1.3 1.3 0 001.3 1.2h6.4a1.3 1.3 0 001.3-1.2l.9-13" />
  </S>
)
export const Link = (p: P) => (
  <S {...p}>
    <path d="M10.2 13.8a4 4 0 006 .4l2.4-2.4a4 4 0 00-5.7-5.7l-1.4 1.4" />
    <path d="M13.8 10.2a4 4 0 00-6-.4L5.4 12.2a4 4 0 005.7 5.7l1.4-1.4" />
  </S>
)
export const Compass = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M15.4 8.6l-1.8 5-5 1.8 1.8-5z" />
  </S>
)
export const Sparkle = (p: P) => (
  <S {...p}>
    <path d="M12 3.4l1.9 5.3 5.3 1.9-5.3 1.9L12 17.8l-1.9-5.3-5.3-1.9 5.3-1.9z" />
  </S>
)
