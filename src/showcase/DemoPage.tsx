import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { Micro } from '@/components/console'
import { ArrowLeft } from '@/components/icons'
import { DECK, PROJECT_BY_ID } from '@/data/deck'
import type { ProjectId } from '@/data/deck'
import { FuaTrackerDemo } from '@/demos/fua'
import { SmartCheckDemo } from '@/demos/smartcheck'
import { DigitalIpsDemo } from '@/demos/ips'

/** The un-scaled replica, taking the whole window. */
export function DemoPage() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const project = id ? PROJECT_BY_ID[id as ProjectId] : undefined
  // Screen cards on the brief deep-link straight into a replica screen.
  const screen = params.get('screen') ?? undefined

  if (!project) return <Navigate to="/" replace />

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink-900">
      <div className="flex shrink-0 items-center gap-3 border-b border-ink-700 bg-ink-950 px-3 py-1.5 sm:gap-4 sm:px-4 sm:py-2">
        <Link
          to={`/project/${project.id}`}
          className="inline-flex shrink-0 items-center gap-2 label whitespace-nowrap text-ink-400 transition-colors hover:text-brass-200"
        >
          <ArrowLeft size={13} />
          <span className="hidden sm:inline">Back to the brief</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <span className="hidden h-3 w-px bg-ink-700 sm:block" />
        <Micro className="hidden text-[#c9d5e5] sm:block">{project.name}</Micro>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          <span className="h-1 w-1 bg-brass-500" aria-hidden="true" />
          <Micro className="whitespace-nowrap text-brass-400">
            {DECK.classification}
          </Micro>
        </span>
      </div>

      <div className="min-h-0 flex-1">
        {project.id === 'fua-tracker' && (
          <FuaTrackerDemo framed={false} screen={screen as never} />
        )}
        {project.id === 'smartcheck' && (
          <SmartCheckDemo framed={false} screen={screen as never} />
        )}
        {project.id === 'digital-ips' && (
          <DigitalIpsDemo framed={false} screen={screen as never} />
        )}
      </div>
    </div>
  )
}
