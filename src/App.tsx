import { useEffect, useId, useRef, useState } from 'react'
import { GraphNav } from './components/GraphNav'
import { graphNodes, siteMeta, type NodeId } from './content/site'

const PRODUCT_WORDMARK = 'Simmer.com (visit)'
const PRODUCT_URL = 'https://simmer.com'
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./[]{}<>+-=*'
const SCRAMBLE_COOLDOWN_MS = 1000
const SIMULATION_FOOTNOTE =
  'If simulation theory is correct, the most interesting outcome is the most likely. Because simulations that are not interesting will be terminated, just like in this version of reality. So arguably, the most important thing is to keep things interesting enough that whoever’s paying the bills on some cosmic AWS… they’ll keep paying the bills. Like, it’s either that or we’re annihilated.'
type ResourceNotice = {
  label: string
  path: string
  href: string
  visitPhrase: string
}

const RESOURCE_NOTICES: Partial<Record<NodeId, ResourceNotice>> = {
  research: {
    label: 'Research',
    path: '/research',
    href: 'https://simmer.com/research',
    visitPhrase: 'visit our research',
  },
  blogs: {
    label: 'Blogs',
    path: '/blog',
    href: 'https://simmer.com/blog',
    visitPhrase: 'visit our blog',
  },
}

const DIAGRAM_NAV: { id: NodeId | null; label: string }[] = [
  { id: null, label: 'cd /company' },
  { id: 'about', label: 'About' },
  { id: 'more-info', label: 'More info' },
  { id: 'research', label: 'Research' },
  { id: 'blogs', label: 'Blogs' },
  { id: 'contact', label: 'Contact' },
  { id: 'team', label: 'Team' },
  { id: 'history', label: 'History' },
]

type ScrambleWordmarkProps = {
  label: string
}

function getRandomCharacter() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
}

function ScrambleWordmark({ label }: ScrambleWordmarkProps) {
  const [displayLabel, setDisplayLabel] = useState(label)
  const [isResolved, setIsResolved] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const isResolvedRef = useRef(false)
  const lastScrambleStartedAtRef = useRef(-SCRAMBLE_COOLDOWN_MS)
  const navigateAfterResolveRef = useRef(false)

  function updateResolved(nextValue: boolean) {
    isResolvedRef.current = nextValue
    setIsResolved(nextValue)
  }

  function clearScramble() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function startScramble(navigateAfterResolve = false) {
    if (isResolvedRef.current) {
      if (navigateAfterResolve) {
        window.location.href = PRODUCT_URL
      }
      return
    }

    if (intervalRef.current !== null) {
      navigateAfterResolveRef.current = navigateAfterResolveRef.current || navigateAfterResolve
      return
    }

    const now = window.performance.now()
    if (now - lastScrambleStartedAtRef.current < SCRAMBLE_COOLDOWN_MS) {
      if (navigateAfterResolve) {
        window.location.href = PRODUCT_URL
      }
      return
    }

    lastScrambleStartedAtRef.current = now
    navigateAfterResolveRef.current = navigateAfterResolve
    updateResolved(false)

    let frame = 0
    const totalFrames = 20
    const longestLength = Math.max(label.length, PRODUCT_WORDMARK.length)

    intervalRef.current = window.setInterval(() => {
      frame += 1

      if (frame >= totalFrames) {
        clearScramble()
        setDisplayLabel(PRODUCT_WORDMARK)
        updateResolved(true)
        if (navigateAfterResolveRef.current) {
          window.location.href = PRODUCT_URL
        }
        return
      }

      const progress = frame / totalFrames
      const resolvedCharacters = Math.floor(progress * PRODUCT_WORDMARK.length)
      const currentLength = Math.round(longestLength + (PRODUCT_WORDMARK.length - longestLength) * progress)
      const nextLabel = Array.from({ length: currentLength }, (_, index) => {
        if (index < resolvedCharacters && index < PRODUCT_WORDMARK.length) {
          return PRODUCT_WORDMARK[index]
        }

        return getRandomCharacter()
      }).join('')

      setDisplayLabel(nextLabel)
    }, 32)
  }

  function resetScramble() {
    if (navigateAfterResolveRef.current) {
      return
    }

    clearScramble()
    setDisplayLabel(label)
    updateResolved(false)
  }

  useEffect(() => clearScramble, [])

  return (
    <a
      className="wordmark"
      data-resolved={isResolved}
      href={isResolved ? PRODUCT_URL : '/'}
      aria-label={isResolved ? 'Visit Simmer.com' : 'Simulative Immersion home'}
      onBlur={resetScramble}
      onClick={(event) => {
        if (!isResolvedRef.current) {
          event.preventDefault()
          startScramble(true)
        }
      }}
      onFocus={() => startScramble()}
      onMouseEnter={() => startScramble()}
      onMouseLeave={resetScramble}
    >
      {displayLabel}
    </a>
  )
}

function App() {
  const [activeNode, setActiveNode] = useState<NodeId | null>(null)
  const [footnoteOpen, setFootnoteOpen] = useState(false)
  const footnoteId = useId()
  const footnoteMarkerId = `${footnoteId}-marker`
  const resourceNotice = activeNode ? RESOURCE_NOTICES[activeNode] : undefined

  function handleSelectNode(nodeId: NodeId) {
    const node = graphNodes.find((item) => item.id === nodeId)
    if (!node) {
      return
    }

    setActiveNode((currentNodeId) => {
      if (currentNodeId !== nodeId) {
        return nodeId
      }

      if (nodeId === 'seed') {
        return null
      }

      if (node.parent === 'about' || node.parent === 'more-info') {
        return node.parent
      }

      return 'seed'
    })
  }

  function openDiagramSection(targetId: NodeId | null) {
    setActiveNode(targetId)
  }

  function toggleFootnote() {
    setFootnoteOpen((open) => !open)
  }

  const year = new Date().getFullYear()

  useEffect(() => {
    window.history.replaceState(null, '', window.location.pathname)
  }, [])

  useEffect(() => {
    const target = activeNode && activeNode !== 'seed' ? `#${activeNode}` : ''
    const current = `${window.location.pathname}${window.location.hash}`
    const next = `${window.location.pathname}${target}`

    if (current !== next) {
      window.history.replaceState(null, '', target || window.location.pathname)
    }
  }, [activeNode])

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="site-header-row">
          <div className="site-header-brand">
            <ScrambleWordmark label={siteMeta.name} />
            <address className="site-address">
              <span className="site-address-line">1160 Battery St Ste 100</span>
              <span className="site-address-line">San Francisco, CA 94111</span>
            </address>
          </div>
          <button
            aria-controls={footnoteId}
            aria-expanded={footnoteOpen}
            className="footnote-marker"
            id={footnoteMarkerId}
            onClick={toggleFootnote}
            type="button"
          >
            <span aria-hidden="true">†</span>
            <span className="visually-hidden">Toggle footnote</span>
          </button>
        </div>
      </header>

      <section className="workspace" aria-label="Site diagram">
        <div className="diagram-stack">
          <GraphNav
            nodes={graphNodes}
            activeNode={activeNode}
            onSelectNode={handleSelectNode}
          />

          <footer className="page-footnotes" aria-label="Footnotes">
            <div className="page-footnotes-rule" aria-hidden="true" />
            <button
              aria-expanded={footnoteOpen}
              className={`page-footnote ${footnoteOpen ? 'is-open' : ''}`}
              id={footnoteId}
              onClick={toggleFootnote}
              type="button"
            >
              <div className="page-footnote-marker" aria-hidden="true">
                †
              </div>
              <div className="page-footnote-body">
                <p className="page-footnote-text">{SIMULATION_FOOTNOTE}</p>
                <p className="page-footnote-attribution">— Elon Musk</p>
              </div>
            </button>
          </footer>

          <div className="site-colophon">
            <p className="site-copyright">© {year} Simulative Immersion, Inc.</p>
            <nav aria-label="Diagram shortcuts" className="diagram-text-nav">
              {DIAGRAM_NAV.map((item, index) => (
                <span className="diagram-text-nav-item" key={item.id ?? 'open-dir'}>
                  {index > 0 ? (
                    <span aria-hidden="true" className="diagram-text-nav-sep">
                      ·
                    </span>
                  ) : null}
                  <button
                    className="diagram-text-nav-link"
                    onClick={() => openDiagramSection(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                </span>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {resourceNotice ? (
        <aside className="resource-popover" key={activeNode} aria-live="polite">
          <p>External page available</p>
          <a href={resourceNotice.href}>
            Simmer.com{resourceNotice.path}
            <span>{resourceNotice.visitPhrase}</span>
          </a>
        </aside>
      ) : null}
    </main>
  )
}

export default App
