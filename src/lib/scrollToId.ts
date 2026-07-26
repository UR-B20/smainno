/**
 * Scroll to an element by id.
 *
 * Nothing in this app may use a plain `href="#some-id"`. The router is a
 * HashRouter, so the fragment *is* the route — setting it to "#replica" makes
 * the router look for a route called "replica", miss, and fall through to the
 * catch-all, which redirects to the landing page. Scroll programmatically and
 * leave the hash alone.
 */
export function scrollToId(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
