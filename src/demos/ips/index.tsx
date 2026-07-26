import { cn } from '@/lib/cn'
import { Micro } from '@/components/console'
import { DemoFull, DemoStage } from '../shared/DemoStage'
import { IpsProvider, useIps } from './store'
import { IpsApp } from './IpsApp'
import type { IpsScreen } from './IpsApp'

function RoleSwitch() {
  const { state, set } = useIps()
  return (
    <div className="flex items-center gap-2">
      <Micro>Signed in as</Micro>
      <div className="flex items-center gap-1">
        {state.officers.map((o) => {
          const active = o.id === state.currentUser
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => set((prev) => ({ ...prev, currentUser: o.id }))}
              title={`${o.appt}${o.deliberator ? ' · may record awards' : ''}`}
              className={cn(
                'rounded-xs border px-2 py-1 label transition-colors',
                active
                  ? 'border-brass-500/70 bg-brass-900/50 text-brass-200'
                  : 'border-ink-600 text-ink-400 hover:border-ink-500 hover:text-[#c9d5e5]',
              )}
            >
              {o.rank} {o.name.split(' ')[0]}
              {o.deliberator && <span className="ml-1 text-brass-400">★</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Inner({ framed, screen }: { framed: boolean; screen?: IpsScreen }) {
  const { now, offsetMin, jump, resetClock, reset } = useIps()
  const clock = { now, offsetMin, jump, resetClock }

  if (!framed) {
    return (
      <DemoFull
        name="Digital IPS"
        clock={clock}
        onReset={reset}
        controls={<RoleSwitch />}
      >
        <IpsApp initialScreen={screen} />
      </DemoFull>
    )
  }

  return (
    <DemoStage
      name="Digital IPS"
      clock={clock}
      onReset={reset}
      controls={<RoleSwitch />}
      fullBleedHref="#/demo/digital-ips"
    >
      <IpsApp initialScreen={screen} />
    </DemoStage>
  )
}

export function DigitalIpsDemo({
  framed = true,
  screen,
}: {
  framed?: boolean
  screen?: IpsScreen
}) {
  return (
    <IpsProvider>
      <Inner framed={framed} screen={screen} />
    </IpsProvider>
  )
}
