import { cn } from '@/lib/cn'
import { Micro } from '@/components/console'
import { DemoFull, DemoStage } from '../shared/DemoStage'
import { FuaProvider, displayName, useFua } from './store'
import { FuaApp } from './FuaApp'
import type { FuaScreen } from './FuaApp'

function RoleSwitch() {
  const { state, set } = useFua()
  return (
    <div className="flex items-center gap-2">
      <Micro>Signed in as</Micro>
      <div className="flex items-center gap-1">
        {state.people.map((p) => {
          const active = p.id === state.currentUser
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => set((prev) => ({ ...prev, currentUser: p.id }))}
              title={`${displayName(p)} — ${p.appt}`}
              className={cn(
                'rounded-xs border px-2 py-1 label transition-colors',
                active
                  ? 'border-brass-500/70 bg-brass-900/50 text-brass-200'
                  : 'border-ink-600 text-ink-400 hover:border-ink-500 hover:text-[#c9d5e5]',
              )}
            >
              {p.rank} {p.name.split(' ')[0]}
              {p.leader && <span className="ml-1 text-brass-400">★</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Inner({
  framed,
  screen,
}: {
  framed: boolean
  screen?: FuaScreen
}) {
  const { now, offsetMin, jump, resetClock, reset } = useFua()
  const clock = { now, offsetMin, jump, resetClock }

  if (!framed) {
    return (
      <DemoFull
        name="FUA Tracker"
        clock={clock}
        onReset={reset}
        controls={<RoleSwitch />}
      >
        <FuaApp initialScreen={screen} />
      </DemoFull>
    )
  }

  return (
    <DemoStage
      name="FUA Tracker"
      clock={clock}
      onReset={reset}
      controls={<RoleSwitch />}
      fullBleedHref="#/demo/fua-tracker"
    >
      <FuaApp initialScreen={screen} />
    </DemoStage>
  )
}

export function FuaTrackerDemo({
  framed = true,
  screen,
}: {
  framed?: boolean
  screen?: FuaScreen
}) {
  return (
    <FuaProvider>
      <Inner framed={framed} screen={screen} />
    </FuaProvider>
  )
}
