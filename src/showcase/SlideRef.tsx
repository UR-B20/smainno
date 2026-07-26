import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { Micro } from '@/components/console'
import { X } from '@/components/icons'

/**
 * A reference still from the original slides, shown beside the screen it
 * documents.
 *
 * The image is looked up by convention — `public/slides/<project>-<screen>.png`
 * — and nothing is rendered until that file is confirmed to have loaded. So
 * slides can be dropped into the folder one at a time with no code change, and
 * a screen without one shows no caption, no frame and no broken image.
 */
export function SlideRef({
  projectId,
  screenKey,
  label = 'Reference slide',
  className,
}: {
  projectId: string
  screenKey: string
  label?: string
  className?: string
}) {
  const src = `${import.meta.env.BASE_URL}slides/${projectId}-${screenKey}.png`
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Probe first; the visible figure is only built once the file really exists.
  if (!loaded) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="hidden"
        onLoad={() => setLoaded(true)}
      />
    )
  }

  return (
    <figure className={className}>
      <Micro className="mb-2.5 block">{label}</Micro>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full overflow-hidden border border-ink-700 bg-ink-950 transition-colors hover:border-brass-500/60"
      >
        <img
          src={src}
          alt={`${label} for this screen`}
          loading="lazy"
          className="block w-full opacity-85 transition-opacity duration-200 group-hover:opacity-100"
        />
      </button>
      <figcaption className="mt-2 text-[11px] text-ink-400">
        Tap to enlarge
      </figcaption>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/92 p-4 backdrop-blur-sm sm:p-10"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className={cn(
              'absolute top-4 right-4 rounded-xs border border-ink-600 p-2 text-ink-400',
              'transition-colors hover:border-brass-500/60 hover:text-brass-200',
            )}
          >
            <X size={18} />
          </button>
          <img
            src={src}
            alt={`${label}, enlarged`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full border border-ink-700 object-contain"
          />
        </div>
      )}
    </figure>
  )
}
