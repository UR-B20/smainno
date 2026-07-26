import { Link, Navigate, useParams } from 'react-router-dom'
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
  const project = id ? PROJECT_BY_ID[id as ProjectId] : undefined

  if (!project) return <Navigate to="/" replace />

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink-900">
      <div className="flex shrink-0 items-center gap-4 border-b border-ink-700 bg-ink-950 px-4 py-2">
        <Link
          to={`/project/${project.id}`}
          className="inline-flex items-center gap-2 label text-ink-400 transition-colors hover:text-brass-200"
        >
          <ArrowLeft size={13} /> Back to the brief
        </Link>
        <span className="h-3 w-px bg-ink-700" />
        <Micro className="text-[#c9d5e5]">{project.name}</Micro>
        <span className="ml-auto flex items-center gap-2">
          <span className="h-1 w-1 bg-brass-500" aria-hidden="true" />
          <Micro className="text-brass-400">{DECK.classification}</Micro>
        </span>
      </div>

      <div className="min-h-0 flex-1">
        {project.id === 'fua-tracker' && <FuaTrackerDemo framed={false} />}
        {project.id === 'smartcheck' && <SmartCheckDemo framed={false} />}
        {project.id === 'digital-ips' && <DigitalIpsDemo framed={false} />}
      </div>
    </div>
  )
}
