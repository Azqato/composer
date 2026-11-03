import { useEffect, useState } from 'react'
import { pageFromHash, type NavPage } from './navigation'

// Current page from the URL hash; follows Back/Forward and typed links.
// Composer Atlas: the welcome page lives at the bare URL, so '#/' and '#' are stripped.
function tidyHash() {
  if (window.location.hash === '#/' || window.location.hash === '#') {
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }
}

export function useRoute(): NavPage {
  const [page, setPage] = useState(() => { tidyHash(); return pageFromHash(window.location.hash) })
  useEffect(() => {
    const onChange = () => { tidyHash(); setPage(pageFromHash(window.location.hash)) }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return page
}

export function navigate(href: string) {
  window.location.hash = href.replace(/^#/, '')
}
