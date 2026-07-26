import { useState } from 'react'
import { cn } from '@/lib/cn'
import {
  AppBtn,
  Card,
  CardHead,
  Field,
  Input,
  Pill,
  Select,
  Textarea,
  useToast,
} from '../shared/kit'
import { makeId } from '@/lib/store'
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Layers,
  Plus,
  Search,
  Trash,
} from '@/components/icons'
import { useSc } from './store'
import type { Item, ItemType, Option, Page, ScState, Section, Template } from './store'

/* ------------------------------------------------------- immutable edits */

function mapTemplate(
  state: ScState,
  id: string,
  fn: (t: Template) => Template,
): ScState {
  return { ...state, templates: state.templates.map((t) => (t.id === id ? fn(t) : t)) }
}

const mapPages = (t: Template, fn: (p: Page) => Page): Template => ({
  ...t,
  pages: t.pages.map(fn),
})

const mapSections = (p: Page, fn: (s: Section) => Section): Page => ({
  ...p,
  sections: p.sections.map(fn),
})

function cloneItem(item: Item): Item {
  return {
    ...item,
    id: makeId('i'),
    options: item.options?.map((o) => ({ ...o })),
    followUp: item.followUp
      ? { ...item.followUp, item: cloneItem(item.followUp.item) }
      : undefined,
  }
}

const TYPE_LABEL: Record<ItemType, string> = {
  choice: 'Single choice',
  yesno: 'Yes / No',
  number: 'Number',
  text: 'Free text',
}

/* -------------------------------------------------------------- builder */

export function TemplateBuilder() {
  const { state, set } = useSc()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(state.templates[0]?.id ?? '')
  const [openPages, setOpenPages] = useState<string[]>(['p1'])
  const [openItem, setOpenItem] = useState<string | null>(null)

  const template = state.templates.find((t) => t.id === selectedId) ?? state.templates[0]

  // Search runs across every template — name, code, and every item label.
  const q = query.trim().toLowerCase()
  const list = state.templates.filter((t) => {
    if (!q) return true
    if (t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)) return true
    return t.pages.some((p) =>
      p.sections.some((s) => s.items.some((i) => i.label.toLowerCase().includes(q))),
    )
  })

  const edit = (fn: (t: Template) => Template) =>
    set((prev) => mapTemplate(prev, template.id, fn))

  const togglePage = (id: string) =>
    setOpenPages((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const publish = () => {
    edit((t) => ({ ...t, status: 'published' }))
    toast('Template published', { tone: 'ok', detail: 'It can now be scheduled to a team.' })
  }

  const duplicateTemplate = () => {
    const copy: Template = {
      ...template,
      id: makeId('t'),
      code: `${template.code}-COPY`,
      name: `${template.name} (copy)`,
      status: 'draft',
      version: 1,
      pages: template.pages.map((p) => ({
        ...p,
        id: makeId('p'),
        sections: p.sections.map((s) => ({
          ...s,
          id: makeId('sec'),
          items: s.items.map(cloneItem),
        })),
      })),
    }
    set((prev) => ({ ...prev, templates: [...prev.templates, copy] }))
    setSelectedId(copy.id)
    toast('Template duplicated as a draft')
  }

  const newTemplate = () => {
    const t: Template = {
      id: makeId('t'),
      code: 'NEW-CHK',
      name: 'Untitled check',
      status: 'draft',
      version: 1,
      pages: [
        {
          id: makeId('p'),
          title: 'Page 1',
          sections: [{ id: makeId('sec'), title: 'Section 1', items: [] }],
        },
      ],
    }
    set((prev) => ({ ...prev, templates: [...prev.templates, t] }))
    setSelectedId(t.id)
    setOpenPages([t.pages[0].id])
  }

  const addPage = () =>
    edit((t) => ({
      ...t,
      pages: [
        ...t.pages,
        {
          id: makeId('p'),
          title: `Page ${t.pages.length + 1}`,
          sections: [{ id: makeId('sec'), title: 'New section', items: [] }],
        },
      ],
    }))

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto @3xl:grid @3xl:grid-cols-[250px_minmax(0,1fr)] @3xl:overflow-hidden">
      {/* ------------------------------------------------------ template list */}
      <Card className="flex flex-col @3xl:min-h-0">
        <div className="shrink-0 border-b border-bone-200 p-3">
          <div className="relative">
            <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search every template"
              className="pl-8"
            />
          </div>
        </div>
        <ul className="max-h-[260px] overflow-y-auto @3xl:max-h-none @3xl:min-h-0 @3xl:flex-1">
          {list.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  'w-full border-l-2 px-3 py-2.5 text-left transition-colors',
                  t.id === template.id
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'border-transparent hover:bg-bone-50',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-slate-500">{t.code}</span>
                  <Pill tone={t.status === 'published' ? 'ok' : 'warn'}>
                    {t.status}
                  </Pill>
                </div>
                <p className="mt-1 text-[12px] leading-snug font-medium text-slate-ink">
                  {t.name}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  v{t.version} · {t.pages.length} page{t.pages.length === 1 ? '' : 's'} ·{' '}
                  {t.pages.reduce(
                    (n, p) => n + p.sections.reduce((m, s) => m + s.items.length, 0),
                    0,
                  )}{' '}
                  items
                </p>
              </button>
            </li>
          ))}
        </ul>
        <div className="shrink-0 border-t border-bone-200 p-2">
          <AppBtn variant="secondary" size="sm" className="w-full" onClick={newTemplate}>
            <Plus size={12} /> New template
          </AppBtn>
        </div>
      </Card>

      {/* ---------------------------------------------------------- structure */}
      <Card className="flex flex-col @3xl:min-h-0">
        <CardHead
          title={
            <input
              value={template.name}
              onChange={(e) => edit((t) => ({ ...t, name: e.target.value }))}
              className="w-full bg-transparent text-[14px] font-semibold text-slate-ink focus:outline-none"
            />
          }
          sub={
            <span className="flex items-center gap-2">
              <input
                value={template.code}
                onChange={(e) => edit((t) => ({ ...t, code: e.target.value }))}
                className="w-24 bg-transparent font-mono text-[11px] text-slate-500 focus:outline-none"
              />
              <Pill tone={template.status === 'published' ? 'ok' : 'warn'}>
                {template.status === 'published' ? `Published v${template.version}` : 'Draft'}
              </Pill>
            </span>
          }
          right={
            <>
              <AppBtn size="sm" variant="ghost" onClick={duplicateTemplate}>
                <Copy size={12} /> Duplicate
              </AppBtn>
              {template.status === 'draft' ? (
                <AppBtn size="sm" variant="primary" onClick={publish}>
                  Publish
                </AppBtn>
              ) : (
                <AppBtn
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    edit((t) => ({ ...t, status: 'draft', version: t.version + 1 }))
                  }
                >
                  Edit as draft
                </AppBtn>
              )}
            </>
          }
        />

        <div className="space-y-2 p-3 @3xl:min-h-0 @3xl:flex-1 @3xl:overflow-y-auto @3xl:p-4">
          {template.pages.map((page, pi) => {
            const open = openPages.includes(page.id)
            return (
              <div key={page.id} className="rounded-md border border-bone-300 bg-bone-50">
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => togglePage(page.id)}
                    aria-expanded={open}
                    className="text-slate-400"
                  >
                    {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <span className="label text-slate-400">Page {pi + 1}</span>
                  <input
                    value={page.title}
                    onChange={(e) =>
                      edit((t) =>
                        mapPages(t, (p) =>
                          p.id === page.id ? { ...p, title: e.target.value } : p,
                        ),
                      )
                    }
                    className="flex-1 bg-transparent text-[12.5px] font-semibold text-slate-ink focus:outline-none"
                  />
                  <button
                    type="button"
                    title="Duplicate page"
                    onClick={() =>
                      edit((t) => ({
                        ...t,
                        pages: [
                          ...t.pages,
                          {
                            ...page,
                            id: makeId('p'),
                            title: `${page.title} (copy)`,
                            sections: page.sections.map((s) => ({
                              ...s,
                              id: makeId('sec'),
                              items: s.items.map(cloneItem),
                            })),
                          },
                        ],
                      }))
                    }
                    className="rounded-sm p-1 text-slate-400 hover:bg-bone-200 hover:text-slate-ink"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    title="Delete page"
                    disabled={template.pages.length === 1}
                    onClick={() =>
                      edit((t) => ({ ...t, pages: t.pages.filter((p) => p.id !== page.id) }))
                    }
                    className="rounded-sm p-1 text-slate-400 hover:bg-bone-200 hover:text-[#a3302a] disabled:opacity-30"
                  >
                    <Trash size={13} />
                  </button>
                </div>

                {open && (
                  <div className="space-y-2 border-t border-bone-200 p-3">
                    {page.sections.map((section) => (
                      <div key={section.id} className="rounded-sm border border-bone-200 bg-white">
                        <div className="flex items-center gap-2 border-b border-bone-200 px-3 py-1.5">
                          <Layers size={12} className="text-slate-400" />
                          <input
                            value={section.title}
                            onChange={(e) =>
                              edit((t) =>
                                mapPages(t, (p) =>
                                  p.id !== page.id
                                    ? p
                                    : mapSections(p, (s) =>
                                        s.id === section.id
                                          ? { ...s, title: e.target.value }
                                          : s,
                                      ),
                                ),
                              )
                            }
                            className="flex-1 bg-transparent text-[11.5px] font-semibold text-slate-600 focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-400">
                            {section.items.length} item
                            {section.items.length === 1 ? '' : 's'}
                          </span>
                        </div>

                        <ul className="divide-y divide-bone-200">
                          {section.items.map((item) => (
                            <ItemEditor
                              key={item.id}
                              item={item}
                              pageId={page.id}
                              sectionId={section.id}
                              open={openItem === item.id}
                              onToggle={() =>
                                setOpenItem(openItem === item.id ? null : item.id)
                              }
                              edit={edit}
                            />
                          ))}
                        </ul>

                        <div className="p-2">
                          <AppBtn
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              edit((t) =>
                                mapPages(t, (p) =>
                                  p.id !== page.id
                                    ? p
                                    : mapSections(p, (s) =>
                                        s.id !== section.id
                                          ? s
                                          : {
                                              ...s,
                                              items: [
                                                ...s.items,
                                                {
                                                  id: makeId('i'),
                                                  type: 'yesno',
                                                  label: 'New question',
                                                  options: [
                                                    { id: 'yes', label: 'Yes', score: 2 },
                                                    { id: 'no', label: 'No', score: 0 },
                                                  ],
                                                },
                                              ],
                                            },
                                      ),
                                ),
                              )
                            }
                          >
                            <Plus size={12} /> Add item
                          </AppBtn>
                        </div>
                      </div>
                    ))}

                    <AppBtn
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        edit((t) =>
                          mapPages(t, (p) =>
                            p.id !== page.id
                              ? p
                              : {
                                  ...p,
                                  sections: [
                                    ...p.sections,
                                    { id: makeId('sec'), title: 'New section', items: [] },
                                  ],
                                },
                          ),
                        )
                      }
                    >
                      <Plus size={12} /> Add section
                    </AppBtn>
                  </div>
                )}
              </div>
            )
          })}

          <AppBtn variant="secondary" size="sm" onClick={addPage}>
            <Plus size={12} /> Add page
          </AppBtn>
        </div>
      </Card>
    </div>
  )
}

/* ---------------------------------------------------------- item editor */

function ItemEditor({
  item,
  pageId,
  sectionId,
  open,
  onToggle,
  edit,
}: {
  item: Item
  pageId: string
  sectionId: string
  open: boolean
  onToggle: () => void
  edit: (fn: (t: Template) => Template) => void
}) {
  const inSection = (t: Template, fn: (items: Item[]) => Item[]) =>
    mapPages(t, (p) =>
      p.id !== pageId ? p : mapSections(p, (s) => (s.id !== sectionId ? s : { ...s, items: fn(s.items) })),
    )

  const patch = (next: Partial<Item>) =>
    edit((t) => inSection(t, (items) => items.map((i) => (i.id === item.id ? { ...i, ...next } : i))))

  const patchOption = (optId: string, next: Partial<Option>) =>
    patch({
      options: item.options?.map((o) => (o.id === optId ? { ...o, ...next } : o)),
    })

  return (
    <li>
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="min-w-0 flex-1 text-left"
        >
          <span className="text-[12px] text-slate-ink">{item.label}</span>
          {item.followUp && (
            <span className="ml-2 text-[10px] font-semibold text-[var(--accent-deep)]">
              + logic
            </span>
          )}
        </button>
        <Pill tone="muted">{TYPE_LABEL[item.type]}</Pill>
        <button
          type="button"
          title="Duplicate item"
          onClick={() => edit((t) => inSection(t, (items) => [...items, cloneItem(item)]))}
          className="rounded-sm p-1 text-slate-400 hover:bg-bone-200 hover:text-slate-ink"
        >
          <Copy size={12} />
        </button>
        <button
          type="button"
          title="Delete item"
          onClick={() => edit((t) => inSection(t, (items) => items.filter((i) => i.id !== item.id)))}
          className="rounded-sm p-1 text-slate-400 hover:bg-bone-200 hover:text-[#a3302a]"
        >
          <Trash size={12} />
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-bone-200 bg-bone-50 p-3">
          <div className="grid gap-2 @xl:grid-cols-[minmax(0,1fr)_140px]">
            <Field label="Question">
              <Input value={item.label} onChange={(e) => patch({ label: e.target.value })} />
            </Field>
            <Field label="Type">
              <Select
                value={item.type}
                onChange={(e) => {
                  const type = e.target.value as ItemType
                  patch({
                    type,
                    options:
                      type === 'yesno'
                        ? [
                            { id: 'yes', label: 'Yes', score: 2 },
                            { id: 'no', label: 'No', score: 0 },
                          ]
                        : type === 'choice'
                          ? (item.options ?? [
                              { id: makeId('o'), label: 'Option A', score: 2 },
                              { id: makeId('o'), label: 'Option B', score: 0 },
                            ])
                          : undefined,
                    followUp: type === 'number' || type === 'text' ? undefined : item.followUp,
                  })
                }}
              >
                {(Object.keys(TYPE_LABEL) as ItemType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Description" hint="Shown under the question on the phone.">
            <Textarea
              rows={2}
              value={item.description ?? ''}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Optional guidance for the checker"
            />
          </Field>

          {item.type === 'number' && (
            <Field label="Unit">
              <Input
                value={item.unit ?? ''}
                onChange={(e) => patch({ unit: e.target.value })}
                placeholder="km, litres, keys…"
                className="w-40"
              />
            </Field>
          )}

          {item.options && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="label text-slate-500">Options & scores</span>
                <span className="text-[10px] text-slate-400">No code required</span>
              </div>
              <ul className="space-y-1.5">
                {item.options.map((o) => (
                  <li key={o.id} className="flex items-center gap-2">
                    <Input
                      value={o.label}
                      onChange={(e) => patchOption(o.id, { label: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={o.score}
                      onChange={(e) => patchOption(o.id, { score: Number(e.target.value) })}
                      className="w-20"
                    />
                    <span className="w-8 text-[10.5px] text-slate-400">pts</span>
                    <button
                      type="button"
                      onClick={() =>
                        patch({ options: item.options!.filter((x) => x.id !== o.id) })
                      }
                      className="rounded-sm p-1 text-slate-400 hover:text-[#a3302a]"
                      aria-label={`Remove ${o.label}`}
                    >
                      <Trash size={12} />
                    </button>
                  </li>
                ))}
              </ul>
              <AppBtn
                size="sm"
                variant="ghost"
                className="mt-1.5"
                onClick={() =>
                  patch({
                    options: [
                      ...(item.options ?? []),
                      { id: makeId('o'), label: 'New option', score: 1 },
                    ],
                  })
                }
              >
                <Plus size={11} /> Add option
              </AppBtn>
            </div>
          )}

          {item.options && (
            <div className="rounded-sm border border-dashed border-[var(--accent)]/35 bg-white p-2.5">
              <span className="label text-[var(--accent-deep)]">
                Conditional follow-up
              </span>
              {item.followUp ? (
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-slate-600">
                    <span>When the answer is</span>
                    <Select
                      value={item.followUp.whenOptionId}
                      onChange={(e) =>
                        patch({
                          followUp: { ...item.followUp!, whenOptionId: e.target.value },
                        })
                      }
                      className="w-36"
                    >
                      {item.options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                    <span>also ask</span>
                  </div>
                  <div className="grid gap-2 @xl:grid-cols-[minmax(0,1fr)_120px]">
                    <Input
                      value={item.followUp.item.label}
                      onChange={(e) =>
                        patch({
                          followUp: {
                            ...item.followUp!,
                            item: { ...item.followUp!.item, label: e.target.value },
                          },
                        })
                      }
                    />
                    <Select
                      value={item.followUp.item.type}
                      onChange={(e) =>
                        patch({
                          followUp: {
                            ...item.followUp!,
                            item: {
                              ...item.followUp!.item,
                              type: e.target.value as ItemType,
                              options: undefined,
                            },
                          },
                        })
                      }
                    >
                      <option value="number">Number</option>
                      <option value="text">Free text</option>
                    </Select>
                  </div>
                  <AppBtn
                    size="sm"
                    variant="ghost"
                    onClick={() => patch({ followUp: undefined })}
                  >
                    Remove logic
                  </AppBtn>
                </div>
              ) : (
                <AppBtn
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() =>
                    patch({
                      followUp: {
                        whenOptionId: item.options![item.options!.length - 1].id,
                        item: {
                          id: makeId('i'),
                          type: 'number',
                          label: 'Follow-up question',
                        },
                      },
                    })
                  }
                >
                  <Plus size={11} /> Add follow-up
                </AppBtn>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  )
}
