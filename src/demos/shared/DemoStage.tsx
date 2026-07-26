import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { DeviceFrame } from '@/components/DeviceFrame'
import { Micro } from '@/components/console'
import { ChevronDown, Clock, External, Refresh, Settings } from '@/components/icons'
import { hhmm, shortDate } from '@/lib/time'
import { useIsHandheld } from '@/hooks/useMedia'

/**
 * The strip of meta-controls that sits *outside* every replica: the simulated
 * clock, a reset, and whatever role switch the app needs. Keeping it out of the
 * frame is deliberate — inside the frame, the app has to look like the app.
 *
 * On a phone the strip collapses to one line, because every pixel it takes is a
 * pixel the replica doesn't get.
 */

export interface StageClock {
  now: number
  offsetMin: number
  jump: (minutes: number) => void
  resetClock: () => void
}

const JUMPS: { label: string; minutes: number }[] = [
  { label: '+1h', minutes: 60 },
  { label: '+4h', minutes: 240 },
  { label: '+1d', minutes: 1440 },
]

function CtlBtn({
  children,
  onClick,
  title,
  className,
}: {
  children: ReactNode
  onClick: () => void
  title?: string
  className?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-xs border border-ink-600 px-2.5 label text-ink-400 transition-colors hover:border-brass-500/60 hover:text-brass-200',
        className,
      )}
    >
      {children}
    </button>
  )
}

function ClockReadout({ clock }: { clock: StageClock }) {
  return (
    <div className="flex items-center gap-1.5 rounded-xs border border-ink-600 bg-ink-800 px-2 py-1">
      <Clock size={11} className="text-brass-400" />
      <span className="label text-[#c9d5e5]">
        {shortDate(clock.now)} · {hhmm(clock.now)}
      </span>
      {clock.offsetMin !== 0 && (
        <span className="label text-brass-400">
          {clock.offsetMin > 0 ? '+' : ''}
          {Math.round(clock.offsetMin / 60)}h
        </span>
      )}
    </div>
  )
}

function ClockButtons({ clock }: { clock: StageClock }) {
  return (
    <div className="flex items-center gap-1">
      {JUMPS.map((j) => (
        <CtlBtn
          key={j.label}
          title={`Advance the simulated clock by ${j.label.slice(1)}`}
          onClick={() => clock.jump(j.minutes)}
        >
          {j.label}
        </CtlBtn>
      ))}
      {clock.offsetMin !== 0 && (
        <CtlBtn title="Return to real time" onClick={clock.resetClock}>
          Now
        </CtlBtn>
      )}
    </div>
  )
}

export function DemoToolbar({
  name,
  clock,
  onReset,
  controls,
  className,
}: {
  name: string
  clock: StageClock
  onReset: () => void
  controls?: ReactNode
  className?: string
}) {
  const handheld = useIsHandheld()
  const [open, setOpen] = useState(false)

  if (handheld) {
    return (
      <div className={cn('border-b border-ink-700 bg-ink-850', className)}>
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="ping-ring h-1.5 w-1.5 shrink-0 rounded-full bg-jade-400 text-jade-400" />
          <Micro className="shrink-0 text-jade-300">Live</Micro>
          <ClockReadout clock={clock} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-xs border border-ink-600 px-2.5 label text-ink-400"
          >
            <Settings size={12} />
            <ChevronDown
              size={11}
              className={cn('transition-transform', open && 'rotate-180')}
            />
          </button>
        </div>

        {open && (
          <div className="flex flex-col gap-3 border-t border-ink-800 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <ClockButtons clock={clock} />
              <CtlBtn title="Wipe demo data and re-seed" onClick={onReset}>
                <Refresh size={11} />
                Reset
              </CtlBtn>
            </div>
            {controls}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 border border-ink-700 bg-ink-850 px-3 py-2',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="ping-ring h-1.5 w-1.5 rounded-full bg-jade-400 text-jade-400" />
        <Micro className="text-jade-300">Live replica</Micro>
        <span className="hidden h-3 w-px bg-ink-600 sm:block" />
        <Micro className="hidden text-ink-400 sm:block">{name}</Micro>
      </div>

      {controls}

      <div className="ml-auto flex items-center gap-2">
        <ClockReadout clock={clock} />
        <ClockButtons clock={clock} />
        <CtlBtn title="Wipe demo data and re-seed" onClick={onReset}>
          <Refresh size={11} />
          Reset
        </CtlBtn>
      </div>
    </div>
  )
}

/** The un-scaled variant: the replica takes the whole window. */
export function DemoFull({
  name,
  clock,
  onReset,
  controls,
  children,
}: {
  name: string
  clock: StageClock
  onReset: () => void
  controls?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-ink-900">
      <DemoToolbar
        name={name}
        clock={clock}
        onReset={onReset}
        controls={controls}
        className="shrink-0 border-x-0 border-t-0"
      />
      <div className="surface-bone relative min-h-0 flex-1 overflow-hidden bg-bone-100">
        {children}
      </div>
    </div>
  )
}

export function DemoStage({
  name,
  clock,
  onReset,
  controls,
  kind = 'desktop',
  width,
  height,
  fullBleedHref,
  children,
}: {
  name: string
  clock: StageClock
  onReset: () => void
  controls?: ReactNode
  kind?: 'desktop' | 'phone'
  width?: number
  height?: number
  /** Route to the un-scaled, full-window version of this replica. */
  fullBleedHref?: string
  children: ReactNode
}) {
  const [scale, setScale] = useState(1)
  const onScale = useCallback((s: number) => setScale(s), [])

  return (
    <div>
      <DemoToolbar
        name={name}
        clock={clock}
        onReset={onReset}
        controls={controls}
      />
      <div className="relative border-x border-b border-ink-700 bg-ink-900/70 p-3 sm:p-5">
        <DeviceFrame
          kind={kind}
          width={width}
          height={height}
          title={name}
          onScale={onScale}
        >
          {children}
        </DeviceFrame>

        {scale < 0.62 && fullBleedHref && (
          <a
            href={fullBleedHref}
            className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-xs border border-brass-500/50 bg-ink-900/95 px-3 py-2 label text-brass-200 backdrop-blur"
          >
            <External size={12} />
            Small screen — open the replica full size
          </a>
        )}
      </div>
    </div>
  )
}
