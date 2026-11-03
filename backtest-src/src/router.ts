import { useEffect, useState } from 'react'
import { pageFromLocation, hrefFor, onWebsite, type NavPage } from './navigation'

// Current page from the URL; follows Back/Forward and typed links.
// Composer Atlas: on the website the address is a clean path (/backtest/run-backtest/), and any
// old #/ link or ?p= redirect is rewritten to it. From disk the hash is kept, minus a bare '#/'.
function tidyUrl(page: NavPage) {
  if (onWebsite()) {
    const clean = hrefFor(page.id)
    if (window.location.pathname + window.location.search + window.location.hash !== clean) history.replaceState(null, '', clean)
  } else if (window.location.hash === '#/' || window.location.hash === '#') {
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
}

const NAV_EVENT = 'bt-navigate'

export function useRoute(): NavPage {
  const [page, setPage] = useState(() => { const p = pageFromLocation(); tidyUrl(p); return p })
  useEffect(() => {
    const onChange = () => { const p = pageFromLocation(); tidyUrl(p); setPage(p) }
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    window.addEventListener(NAV_EVENT, onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
      window.removeEventListener(NAV_EVENT, onChange)
    }
  }, [])
  return page
}

export function navigate(href: string) {
  if (onWebsite() && href.startsWith('/')) {
    history.pushState(null, '', href)
    window.dispatchEvent(new Event(NAV_EVENT))
    window.scrollTo(0, 0)
    return
  }
  window.location.hash = href.replace(/^#/, '')
}
