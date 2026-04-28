export type NodeId =
  | 'seed'
  | 'about'
  | 'team'
  | 'history'
  | 'more-info'
  | 'research'
  | 'blogs'
  | 'contact'

export type GraphNode = {
  id: NodeId
  label: string
  notation: string
  copy?: string
  parent?: NodeId
  children: NodeId[]
  desktop: {
    x: number
    y: number
  }
  mobile: {
    x: number
    y: number
  }
  mobileOrder: number
}

export const siteMeta = {
  name: 'Simulative Immersion, Inc.',
}

export const graphNodes: GraphNode[] = [
  {
    id: 'seed',
    label: 'cd company',
    notation: 'root',
    children: ['about', 'more-info'],
    desktop: { x: 50, y: 8 },
    mobile: { x: 50, y: 10 },
    mobileOrder: 0,
  },
  {
    id: 'about',
    label: 'About',
    notation: '/about',
    copy:
      'Simulative Immersion, Inc. is an early-stage software studio based in San Francisco.\nWe build and train models of niche topics we find interesting, and we also make games.\nIf this resonates with you, please say hi at hello [at] simmer [dot] com.',
    parent: 'seed',
    children: ['team', 'history'],
    desktop: { x: 35, y: 34 },
    mobile: { x: 30, y: 34 },
    mobileOrder: 1,
  },
  {
    id: 'team',
    label: 'Team',
    notation: '/team',
    copy: 'People (chronological)\nSungjoo Yoon\nKevin Foyet',
    parent: 'about',
    children: [],
    desktop: { x: 35, y: 89 },
    mobile: { x: 30, y: 86 },
    mobileOrder: 2,
  },
  {
    id: 'history',
    label: 'History',
    notation: '/history',
    copy:
      'Our company was dreamed up in a small dorm room, Straus D-11.\nOne year later, we incorporated in Eliot I-53.\nAfter much rough and tumble, we started building Simmer.com.\nWe hope this brings users as much joy as it is to build.',
    parent: 'about',
    children: [],
    desktop: { x: 65, y: 89 },
    mobile: { x: 70, y: 86 },
    mobileOrder: 3,
  },
  {
    id: 'more-info',
    label: 'More info',
    notation: '/more',
    parent: 'seed',
    children: ['research', 'blogs', 'contact'],
    desktop: { x: 65, y: 34 },
    mobile: { x: 70, y: 34 },
    mobileOrder: 4,
  },
  {
    id: 'research',
    label: 'Research',
    notation: '/research',
    parent: 'more-info',
    children: [],
    desktop: { x: 35, y: 60 },
    mobile: { x: 30, y: 62 },
    mobileOrder: 5,
  },
  {
    id: 'blogs',
    label: 'Blogs',
    notation: '/blogs',
    parent: 'more-info',
    children: [],
    desktop: { x: 65, y: 60 },
    mobile: { x: 70, y: 62 },
    mobileOrder: 6,
  },
  {
    id: 'contact',
    label: 'Contact',
    notation: '/contact',
    copy: 'General inquiries: hi [at] simmer [dot] com\nInvestors: founders [at] simmer [dot] com',
    parent: 'more-info',
    children: [],
    desktop: { x: 50, y: 76 },
    mobile: { x: 50, y: 78 },
    mobileOrder: 7,
  },
]

