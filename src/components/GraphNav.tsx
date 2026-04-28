import type { GraphNode, NodeId } from '../content/site'

type GraphNavProps = {
  nodes: GraphNode[]
  activeNode: NodeId | null
  onSelectNode: (nodeId: NodeId) => void
}

type Edge = {
  parent: GraphNode
  child: GraphNode
}

function getVisibleNodes(nodes: GraphNode[], activeNode: NodeId | null) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const selected = activeNode ? nodeMap.get(activeNode) : undefined
  const visibleIds = new Set<NodeId>(['seed'])

  if (activeNode) {
    nodeMap.get('seed')?.children.forEach((childId) => visibleIds.add(childId))
  }

  if (selected) {
    visibleIds.add(selected.id)
  }

  const revealParent = selected?.children.length
    ? selected.id
    : selected?.parent === 'about' || selected?.parent === 'more-info'
      ? selected.parent
      : undefined

  if (revealParent) {
    nodeMap.get(revealParent)?.children.forEach((childId) => visibleIds.add(childId))
  }

  return nodes.filter((node) => visibleIds.has(node.id))
}

function getVisibleEdges(visibleNodes: GraphNode[], copyBranchNodeIds: Set<NodeId>) {
  const visibleIds = new Set(visibleNodes.map((node) => node.id))
  return visibleNodes.reduce<Edge[]>((edges, parent) => {
    if (copyBranchNodeIds.has(parent.id)) {
      return edges
    }

    parent.children.forEach((childId) => {
      const child = visibleNodes.find((node) => node.id === childId)
      if (child && visibleIds.has(child.id)) {
        edges.push({ parent, child })
      }
    })
    return edges
  }, [])
}

type CoordinateSet = 'desktop' | 'mobile'

type CopyLayout = {
  x: number
  y: number
  top: number
  bottom: number
  kind: 'branch' | 'terminal'
}

function getEdgePath(parent: GraphNode, child: GraphNode, coordinateSet: CoordinateSet) {
  const parentPosition = parent[coordinateSet]
  const childPosition = child[coordinateSet]
  const startY = parentPosition.y + 4.4
  const endY = childPosition.y - 4.4

  if (parent.id === 'more-info') {
    const branchY = coordinateSet === 'desktop' ? 48 : 50

    return `M ${parentPosition.x} ${startY} V ${branchY} H ${childPosition.x} V ${endY}`
  }

  const midY = startY + (endY - startY) * 0.54

  return `M ${parentPosition.x} ${startY} V ${midY} H ${childPosition.x} V ${endY}`
}

function getCopyChildPath(child: GraphNode, coordinateSet: CoordinateSet) {
  const childPosition = child[coordinateSet]
  const copyBottomY = coordinateSet === 'desktop' ? 67 : 66
  const branchY = coordinateSet === 'desktop' ? 75 : 76
  const endY = childPosition.y - 4.4

  return `M 50 ${copyBottomY} V ${branchY} H ${childPosition.x} V ${endY}`
}

function getCopyLayout(coordinateSet: CoordinateSet): CopyLayout {
  const y = coordinateSet === 'desktop' ? 58 : 55

  return {
    x: 50,
    y,
    top: coordinateSet === 'desktop' ? 49 : 44,
    bottom: coordinateSet === 'desktop' ? 67 : 66,
    kind: 'branch',
  }
}

function getCopyPath(selected: GraphNode, coordinateSet: CoordinateSet) {
  const selectedPosition = selected[coordinateSet]
  const copyLayout = getCopyLayout(coordinateSet)
  const startY = selectedPosition.y + 4.4
  const branchY = coordinateSet === 'desktop' ? 42 : 39

  return `M ${selectedPosition.x} ${startY} V ${branchY} H ${copyLayout.x} V ${copyLayout.top}`
}

function getTerminalCopyLayout(coordinateSet: CoordinateSet): CopyLayout {
  const y = coordinateSet === 'desktop' ? 95 : 94

  return {
    x: 50,
    y,
    top: coordinateSet === 'desktop' ? 89 : 88,
    bottom: coordinateSet === 'desktop' ? 99 : 98,
    kind: 'terminal',
  }
}

function getTerminalCopyPath(selected: GraphNode, coordinateSet: CoordinateSet) {
  const selectedPosition = selected[coordinateSet]
  const copyLayout = getTerminalCopyLayout(coordinateSet)
  const startY = selectedPosition.y + 4.4

  return `M ${selectedPosition.x} ${startY} V ${copyLayout.top}`
}

function getLeafGraphPath(selected: GraphNode, coordinateSet: CoordinateSet) {
  const selectedPosition = selected[coordinateSet]
  const startY = selectedPosition.y + 4.4
  const branchY = coordinateSet === 'desktop' ? 98 : 97

  return `M ${selectedPosition.x} ${startY} V ${branchY} H 50 V 100`
}

export function GraphNav({ nodes, activeNode, onSelectNode }: GraphNavProps) {
  const selectedNode = activeNode ?? 'seed'
  const visibleNodes = getVisibleNodes(nodes, activeNode)
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const selected = nodeMap.get(selectedNode)
  const branchCopyNode =
    selected?.children.length && selected.copy
      ? selected
      : selected?.parent === 'about'
        ? nodeMap.get('about')
        : undefined
  const terminalCopyNode =
    selected?.copy && selected.children.length === 0 && selected.parent === 'more-info' ? selected : undefined
  const leafCopyNode =
    selected?.copy && selected.children.length === 0 && selected.parent !== 'more-info' ? selected : undefined
  const copyBranchNodeIds = new Set<NodeId>(branchCopyNode ? [branchCopyNode.id] : [])
  const visibleEdges = getVisibleEdges(visibleNodes, copyBranchNodeIds)
  const desktopBranchCopyLayout = branchCopyNode ? getCopyLayout('desktop') : undefined
  const mobileBranchCopyLayout = branchCopyNode ? getCopyLayout('mobile') : undefined
  const desktopTerminalCopyLayout = terminalCopyNode ? getTerminalCopyLayout('desktop') : undefined
  const mobileTerminalCopyLayout = terminalCopyNode ? getTerminalCopyLayout('mobile') : undefined
  const sortedMobileNodes = [...visibleNodes].sort((a, b) => a.mobileOrder - b.mobileOrder)

  return (
    <nav className="graph-nav" aria-label="Primary diagram">
      <div className="graph-desktop" data-copy-kind={desktopBranchCopyLayout?.kind ?? 'none'} aria-hidden="true">
        <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <marker id="arrow" markerHeight="6" markerWidth="6" orient="auto" refX="5" refY="3">
              <path d="M 0 0 L 6 3 L 0 6 z" />
            </marker>
          </defs>
          {visibleEdges.map(({ parent, child }) => (
            <path key={`${parent.id}-${child.id}`} d={getEdgePath(parent, child, 'desktop')} />
          ))}
          {branchCopyNode ? <path d={getCopyPath(branchCopyNode, 'desktop')} /> : null}
          {branchCopyNode && desktopBranchCopyLayout
            ? branchCopyNode.children
                .map((childId) => nodeMap.get(childId))
                .filter((node): node is GraphNode => Boolean(node))
                .map((child) => <path key={`copy-${child.id}`} d={getCopyChildPath(child, 'desktop')} />)
            : null}
          {terminalCopyNode ? (
            <>
              <path className="terminal-copy-path" d={getTerminalCopyPath(terminalCopyNode, 'desktop')} />
              <path className="terminal-copy-arrow" d="M 49.76 88.15 L 50 88.85 L 50.24 88.15" />
            </>
          ) : null}
          {leafCopyNode ? <path className="leaf-graph-path" d={getLeafGraphPath(leafCopyNode, 'desktop')} /> : null}
          {visibleNodes
            .filter((node) => node.children.some((childId) => visibleNodes.some((item) => item.id === childId)))
            .map((node) => (
              <circle key={`${node.id}-junction`} cx={node.desktop.x} cy={node.desktop.y + 4.4} r="0.45" />
            ))}
        </svg>

        {visibleNodes.map((node) => (
          <button
            className="graph-node"
            data-actionable={selectedNode !== node.id}
            data-active={selectedNode === node.id}
            data-root={node.id === 'seed'}
            data-terminal={node.children.length === 0 && !node.copy}
            key={node.id}
            onClick={() => onSelectNode(node.id)}
            style={{
              left: `${node.desktop.x}%`,
              top: `${node.desktop.y}%`,
            }}
            type="button"
          >
            <span>{node.notation}</span>
            {node.label}
          </button>
        ))}

        {branchCopyNode && desktopBranchCopyLayout ? (
          <article
            className="graph-copy"
            data-copy-kind={desktopBranchCopyLayout.kind}
            aria-live="polite"
            style={{
              left: `${desktopBranchCopyLayout.x}%`,
              top: `${desktopBranchCopyLayout.y}%`,
            }}
          >
            {branchCopyNode.copy?.split('\n').map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        ) : null}

        {terminalCopyNode && desktopTerminalCopyLayout ? (
          <article
            className="graph-copy"
            data-copy-kind={desktopTerminalCopyLayout.kind}
            aria-live="polite"
            style={{
              left: `${desktopTerminalCopyLayout.x}%`,
              top: `${desktopTerminalCopyLayout.y}%`,
            }}
          >
            {terminalCopyNode.copy?.split('\n').map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        ) : null}

      </div>

      <div className="graph-mobile" data-copy-kind={mobileBranchCopyLayout?.kind ?? 'none'}>
        <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <marker id="arrow" markerHeight="6" markerWidth="6" orient="auto" refX="5" refY="3">
              <path d="M 0 0 L 6 3 L 0 6 z" />
            </marker>
          </defs>
          {visibleEdges.map(({ parent, child }) => (
            <path key={`${parent.id}-${child.id}`} d={getEdgePath(parent, child, 'mobile')} />
          ))}
          {branchCopyNode ? <path d={getCopyPath(branchCopyNode, 'mobile')} /> : null}
          {branchCopyNode && mobileBranchCopyLayout
            ? branchCopyNode.children
                .map((childId) => nodeMap.get(childId))
                .filter((node): node is GraphNode => Boolean(node))
                .map((child) => <path key={`copy-mobile-${child.id}`} d={getCopyChildPath(child, 'mobile')} />)
            : null}
          {terminalCopyNode ? (
            <>
              <path className="terminal-copy-path" d={getTerminalCopyPath(terminalCopyNode, 'mobile')} />
              <path className="terminal-copy-arrow" d="M 49.68 87.35 L 50 87.85 L 50.32 87.35" />
            </>
          ) : null}
          {leafCopyNode ? <path className="leaf-graph-path" d={getLeafGraphPath(leafCopyNode, 'mobile')} /> : null}
          {visibleNodes
            .filter((node) => node.children.some((childId) => visibleNodes.some((item) => item.id === childId)))
            .map((node) => (
              <circle key={`${node.id}-mobile-junction`} cx={node.mobile.x} cy={node.mobile.y + 4.4} r="0.45" />
            ))}
        </svg>
        {sortedMobileNodes.map((node) => (
          <button
            className="mobile-node"
            data-actionable={selectedNode !== node.id}
            data-active={selectedNode === node.id}
            data-root={node.id === 'seed'}
            data-terminal={node.children.length === 0 && !node.copy}
            key={node.id}
            onClick={() => onSelectNode(node.id)}
            style={{
              left: `${node.mobile.x}%`,
              top: `${node.mobile.y}%`,
            }}
            type="button"
          >
            <span>{node.notation}</span>
            {node.label}
          </button>
        ))}
        {branchCopyNode && mobileBranchCopyLayout ? (
          <article
            className="mobile-copy"
            data-copy-kind={mobileBranchCopyLayout.kind}
            aria-live="polite"
            style={{
              left: `${mobileBranchCopyLayout.x}%`,
              top: `${mobileBranchCopyLayout.y}%`,
            }}
          >
            {branchCopyNode.copy?.split('\n').map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        ) : null}

        {terminalCopyNode && mobileTerminalCopyLayout ? (
          <article
            className="mobile-copy"
            data-copy-kind={mobileTerminalCopyLayout.kind}
            aria-live="polite"
            style={{
              left: `${mobileTerminalCopyLayout.x}%`,
              top: `${mobileTerminalCopyLayout.y}%`,
            }}
          >
            {terminalCopyNode.copy?.split('\n').map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        ) : null}

      </div>

      {leafCopyNode ? (
        <div className="leaf-copy-extension" data-source={leafCopyNode.id} aria-live="polite">
          <svg className="leaf-copy-connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="leaf-copy-path" d="M 50 -10 V 88" />
            <path className="leaf-copy-arrow" d="M 49.45 89 L 50 95 L 50.55 89" />
          </svg>
          <article className="leaf-copy">
            {leafCopyNode.copy?.split('\n').map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        </div>
      ) : null}

      <div className="fallback-directory" aria-label="Text directory">
        <ul>
          {nodes.map((node) => (
            <li key={node.id}>
              <button
                aria-current={selectedNode === node.id ? 'page' : undefined}
                onClick={() => onSelectNode(node.id)}
                type="button"
              >
                {node.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

