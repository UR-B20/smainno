import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { AppShell, Avatar, Pill, THEMES, ToastHost } from '../shared/kit'
import {
  Bell,
  Calendar,
  Chart,
  Clipboard,
  Doc,
  Home,
  Menu,
  Plus,
  Search,
  Users,
} from '@/components/icons'
import { displayName, kpis, personById, useFua } from './store'
import { Activity, MySubtasks, Overview, Register } from './screens'
import { RaiseFua } from './RaiseFua'
import { UpdateDrawer } from './UpdateDrawer'

export type FuaScreen =
  | 'overview'
  | 'register'
  | 'my-subtasks'
  | 'raise'
  | 'activity'

const LEADER_ONLY: FuaScreen[] = ['overview', 'register', 'raise']

const NAV: {
  id: FuaScreen
  label: string
  icon: ReactNode
  leaderOnly?: boolean
}[] = [
  { id: 'overview', label: 'Overview', icon: <Home size={15} />, leaderOnly: true },
  { id: 'register', label: 'FUA register', icon: <Clipboard size={15} />, leaderOnly: true },
  { id: 'my-subtasks', label: 'My subtasks', icon: <Doc size={15} /> },
  { id: 'raise', label: 'Raise an FUA', icon: <Plus size={15} />, leaderOnly: true },
  { id: 'activity', label: 'Audit trail', icon: <Chart size={15} /> },
]

/* ------------------------------------------------------------ Teams chrome */

const RAIL = [
  { icon: <Bell size={17} />, label: 'Activity' },
  { icon: <Users size={17} />, label: 'Chat' },
  { icon: <Home size={17} />, label: 'Teams' },
  { icon: <Calendar size={17} />, label: 'Calendar' },
]

function TeamsChrome({ children }: { children: ReactNode }) {
  const { state } = useFua()
  const me = personById(state, state.currentUser)

  return (
    <div className="flex h-full w-full">
      {/* app rail */}
      <nav className="flex w-14 shrink-0 flex-col items-center gap-1 bg-[#2b2b32] py-2">
        {RAIL.map((item) => (
          <span
            key={item.label}
            title={item.label}
            className="flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-sm text-[#a9adb8]"
          >
            {item.icon}
            <span className="text-[8px] tracking-wide">{item.label}</span>
          </span>
        ))}
        <span
          title="FUA Tracker"
          className="relative mt-1 flex h-11 w-11 flex-col items-center justify-center gap-0.5 rounded-sm bg-white/10 text-white"
        >
          <span className="absolute top-2 bottom-2 -left-1.5 w-[3px] rounded-full bg-[#5b5fc7]" />
          <Clipboard size={17} />
          <span className="text-[8px] tracking-wide">FUA</span>
        </span>
        <span className="mt-auto">
          <Avatar name={me.name} size={28} />
        </span>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* search bar */}
        <div className="flex h-10 shrink-0 items-center gap-3 border-b border-bone-300 bg-bone-200/70 px-3">
          <Menu size={15} className="text-slate-500" />
          <div className="mx-auto flex w-[420px] items-center gap-2 rounded-sm border border-bone-300 bg-white px-2.5 py-1">
            <Search size={13} className="text-slate-400" />
            <span className="text-[11.5px] text-slate-400">
              Search or type a command
            </span>
          </div>
          <span className="text-[11px] text-slate-500">{displayName(me)}</span>
        </div>

        {/* channel header + tab strip */}
        <div className="shrink-0 border-b border-bone-300 bg-white px-5 pt-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#5b5fc7] text-[10px] font-bold text-white">
              15
            </span>
            <span className="text-[13px] font-semibold text-slate-ink">
              15C4I Innovation Branch
            </span>
            <span className="text-slate-300">›</span>
            <span className="text-[12.5px] text-slate-500">General</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {['Posts', 'Files', 'FUA Tracker', 'Wiki'].map((t) => (
              <span
                key={t}
                className={cn(
                  '-mb-px border-b-2 px-3 py-1.5 text-[12px]',
                  t === 'FUA Tracker'
                    ? 'border-[#5b5fc7] font-semibold text-[#3f43a0]'
                    : 'border-transparent text-slate-500',
                )}
              >
                {t}
              </span>
            ))}
            <span className="px-2 text-slate-400">
              <Plus size={13} />
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- app */

export function FuaApp({ initialScreen }: { initialScreen?: FuaScreen }) {
  const { state, now } = useFua()
  const [screen, setScreen] = useState<FuaScreen>(initialScreen ?? 'overview')
  const [openSubtask, setOpenSubtask] = useState<string | null>(null)

  const me = personById(state, state.currentUser)
  const k = kpis(state, now)

  // The menu adapts to your role — and so does where you land.
  useEffect(() => {
    if (!me.leader && LEADER_ONLY.includes(screen)) setScreen('my-subtasks')
  }, [me.leader, screen])

  useEffect(() => {
    if (initialScreen) setScreen(initialScreen)
  }, [initialScreen])

  const visible = NAV.filter((n) => !n.leaderOnly || me.leader)
  const myOpen = state.subtasks.filter(
    (s) => s.assignee === state.currentUser && s.status !== 'Completed',
  ).length

  return (
    <AppShell theme={THEMES.fua}>
      <ToastHost>
        <TeamsChrome>
          <div className="flex h-full min-h-0">
            {/* app nav */}
            <nav className="flex w-52 shrink-0 flex-col border-r border-bone-300 bg-bone-50 py-3">
              <div className="px-4 pb-3">
                <span className="label text-slate-400">FUA Tracker</span>
                <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
                  {me.leader ? 'Team leader view' : 'Member view'}
                </p>
              </div>
              <ul className="space-y-0.5 px-2">
                {visible.map((item) => {
                  const active = screen === item.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setScreen(item.id)}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-[12.5px] transition-colors',
                          active
                            ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent-deep)]'
                            : 'text-slate-600 hover:bg-bone-200',
                        )}
                      >
                        <span className={active ? 'text-[var(--accent)]' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.id === 'my-subtasks' && myOpen > 0 && (
                          <span className="numerals rounded-full bg-[var(--accent)] px-1.5 py-px text-[10px] font-semibold text-white">
                            {myOpen}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>

              {me.leader && (
                <div className="mt-auto px-4 pt-4">
                  <div className="rounded-md border border-bone-300 bg-white p-3">
                    <span className="label text-slate-400">Unit position</span>
                    <div className="mt-2 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Open</span>
                        <span className="numerals font-semibold text-slate-ink">{k.open}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Overdue</span>
                        <span className="numerals font-semibold text-[#a3302a]">
                          {k.overdue}
                        </span>
                      </div>
                    </div>
                    {k.overdue > 0 && (
                      <Pill tone="danger" dot className="mt-2.5">
                        Action required
                      </Pill>
                    )}
                  </div>
                </div>
              )}
            </nav>

            {/* screen */}
            <main className="min-w-0 flex-1 overflow-hidden bg-bone-100 p-5">
              {screen === 'overview' && <Overview onOpen={setOpenSubtask} />}
              {screen === 'register' && <Register onOpen={setOpenSubtask} />}
              {screen === 'my-subtasks' && <MySubtasks onOpen={setOpenSubtask} />}
              {screen === 'raise' && (
                <RaiseFua onDone={() => setScreen('register')} />
              )}
              {screen === 'activity' && <Activity />}
            </main>
          </div>
        </TeamsChrome>

        <UpdateDrawer
          subtaskId={openSubtask}
          onClose={() => setOpenSubtask(null)}
        />
      </ToastHost>
    </AppShell>
  )
}
