import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { Micro } from '@/components/console'
import { useIsHandheld } from '@/hooks/useMedia'
import { AppShell, THEMES, ToastHost } from '../shared/kit'
import { DemoFull, DemoStage } from '../shared/DemoStage'
import { ScProvider, teamById, useSc } from './store'
import { CheckerApp } from './CheckerApp'
import { AdminApp } from './AdminApp'
import type { AdminScreen } from './AdminApp'

export type ScScreen =
  | 'checker'
  | 'issues'
  | 'history'
  | 'dashboard'
  | 'builder'
  | 'schedules'

const ADMIN_SCREENS: ScScreen[] = ['dashboard', 'builder', 'schedules']

function ModeSwitch({
  mode,
  setMode,
}: {
  mode: 'checker' | 'admin'
  setMode: (m: 'checker' | 'admin') => void
}) {
  const { state, set } = useSc()

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        <Micro>View</Micro>
        <div className="flex">
          {(['checker', 'admin'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'border px-2.5 py-1 label transition-colors first:rounded-l-xs last:rounded-r-xs',
                mode === m
                  ? 'border-brass-500/70 bg-brass-900/50 text-brass-200'
                  : 'border-ink-600 text-ink-400 hover:text-[#c9d5e5]',
              )}
            >
              {m === 'checker' ? 'Checker · phone' : 'Admin · desktop'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'checker' && (
        <div className="flex items-center gap-2">
          <Micro>Checker</Micro>
          <div className="flex items-center gap-1">
            {state.checkers.map((c) => {
              const active = c.id === state.currentUser
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set((prev) => ({ ...prev, currentUser: c.id }))}
                  title={teamById(state, c.teamId)?.name}
                  className={cn(
                    'rounded-xs border px-2 py-1 label transition-colors',
                    active
                      ? 'border-brass-500/70 bg-brass-900/50 text-brass-200'
                      : 'border-ink-600 text-ink-400 hover:border-ink-500 hover:text-[#c9d5e5]',
                  )}
                >
                  {c.rank} {c.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Inner({ framed, screen }: { framed: boolean; screen?: ScScreen }) {
  const { now, offsetMin, jump, resetClock, reset } = useSc()
  const handheld = useIsHandheld()
  const [mode, setMode] = useState<'checker' | 'admin'>(
    screen && ADMIN_SCREENS.includes(screen) ? 'admin' : 'checker',
  )

  // Deep-linking from a screen card on the project page has to move the device
  // as well as the screen — the admin views are desktop, the rest are phone.
  useEffect(() => {
    if (screen) setMode(ADMIN_SCREENS.includes(screen) ? 'admin' : 'checker')
  }, [screen])

  const clock = { now, offsetMin, jump, resetClock }
  const adminScreen: AdminScreen | undefined =
    screen && ADMIN_SCREENS.includes(screen) ? (screen as AdminScreen) : undefined
  const checkerTab =
    screen === 'issues' ? 'issues' : screen === 'history' ? 'history' : 'checks'

  const app =
    mode === 'admin' ? (
      <AdminApp initialScreen={adminScreen} />
    ) : (
      <CheckerApp initialTab={checkerTab} />
    )

  const body = (
    <AppShell theme={THEMES.smartcheck}>
      <ToastHost>{app}</ToastHost>
    </AppShell>
  )

  if (!framed) {
    return (
      <DemoFull
        name="SmartCheck"
        clock={clock}
        onReset={reset}
        controls={<ModeSwitch mode={mode} setMode={setMode} />}
      >
        {mode === 'checker' && !handheld ? (
          // On a desktop the checker still deserves a phone-shaped viewport;
          // on an actual phone the screen already is one.
          <div className="flex h-full items-center justify-center bg-ink-900 py-4">
            <div className="surface-bone h-full max-h-[820px] w-[390px] overflow-hidden rounded-[28px] border border-ink-600 shadow-device">
              {body}
            </div>
          </div>
        ) : (
          body
        )}
      </DemoFull>
    )
  }

  return (
    <DemoStage
      name="SmartCheck"
      clock={clock}
      onReset={reset}
      controls={<ModeSwitch mode={mode} setMode={setMode} />}
      kind={mode === 'checker' ? 'phone' : 'desktop'}
      fullBleedHref="#/demo/smartcheck"
    >
      {body}
    </DemoStage>
  )
}

export function SmartCheckDemo({
  framed = true,
  screen,
}: {
  framed?: boolean
  screen?: ScScreen
}) {
  return (
    <ScProvider>
      <Inner framed={framed} screen={screen} />
    </ScProvider>
  )
}
