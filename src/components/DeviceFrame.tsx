import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Renders a replica at its natural size and scales it to fit the column, so the
 * app inside always sees a realistic viewport instead of being squeezed into
 * whatever width the page happens to have. Pointer input maps through the CSS
 * transform, so the scaled app stays fully interactive.
 */

interface FrameProps {
  kind?: 'desktop' | 'phone'
  /** Natural width of the app inside the frame. */
  width?: number
  /** Natural height of the app inside the frame. */
  height?: number
  /** Never scale above this, so the frame doesn't balloon on wide screens. */
  maxScale?: number
  title?: string
  /** Reports the applied scale, so callers can warn when it gets unreadable. */
  onScale?: (scale: number) => void
  children: ReactNode
  className?: string
}

function useFitScale(natural: number, maxScale: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ scale, available }, setFit] = useState({ scale: 1, available: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const width = el.clientWidth
      if (width > 0) {
        setFit({ scale: Math.min(maxScale, width / natural), available: width })
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [natural, maxScale])

  // A phone never fills a desktop column, so centre whatever is left over.
  const offsetX = Math.max(0, (available - natural * scale) / 2)

  return { ref, scale, offsetX }
}

export function DeviceFrame({
  kind = 'desktop',
  width = kind === 'phone' ? 390 : 1280,
  height = kind === 'phone' ? 780 : 800,
  maxScale = 1,
  title,
  onScale,
  children,
  className,
}: FrameProps) {
  const isPhone = kind === 'phone'
  // Bezel thickness has to be included in the measured natural width.
  const bezel = isPhone ? 11 : 0
  const chromeH = isPhone ? 0 : 34
  const naturalOuter = width + bezel * 2
  const { ref, scale, offsetX } = useFitScale(naturalOuter, maxScale)

  useEffect(() => {
    onScale?.(scale)
  }, [scale, onScale])

  const outerHeight = (height + chromeH + bezel * 2) * scale

  return (
    <div ref={ref} className={cn('w-full', className)}>
      <div style={{ height: outerHeight }} className="relative">
        <div
          style={{
            width: naturalOuter,
            transform: `translateX(${offsetX}px) scale(${scale})`,
            transformOrigin: 'top left',
          }}
          className="absolute top-0 left-0"
        >
          {isPhone ? (
            <PhoneShell width={width} height={height} bezel={bezel}>
              {children}
            </PhoneShell>
          ) : (
            <DesktopShell width={width} height={height} title={title}>
              {children}
            </DesktopShell>
          )}
        </div>
      </div>
    </div>
  )
}

function DesktopShell({
  width,
  height,
  title,
  children,
}: {
  width: number
  height: number
  title?: string
  children: ReactNode
}) {
  return (
    <div
      className="overflow-hidden rounded-md border border-ink-600 bg-ink-800 shadow-device"
      style={{ width }}
    >
      <div className="flex h-[34px] items-center gap-3 border-b border-ink-700 bg-ink-800 px-3.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-signal-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-450/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-jade-400/70" />
        </div>
        {title && (
          <div className="mx-auto flex max-w-[60%] items-center gap-2 truncate rounded-xs border border-ink-600 bg-ink-850 px-3 py-1">
            <span className="label truncate text-ink-400">{title}</span>
          </div>
        )}
      </div>
      <div
        className="surface-bone relative overflow-hidden bg-bone-100"
        style={{ width, height }}
      >
        {children}
      </div>
    </div>
  )
}

function PhoneShell({
  width,
  height,
  bezel,
  children,
}: {
  width: number
  height: number
  bezel: number
  children: ReactNode
}) {
  return (
    <div
      className="rounded-[42px] bg-ink-750 shadow-device ring-1 ring-ink-600"
      style={{ padding: bezel, width: width + bezel * 2 }}
    >
      <div
        className="surface-bone relative overflow-hidden rounded-[32px] bg-bone-100"
        style={{ width, height }}
      >
        {children}
        <div
          className="pointer-events-none absolute bottom-1.5 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-slate-ink/25"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
