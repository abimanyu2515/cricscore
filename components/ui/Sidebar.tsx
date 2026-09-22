'use client'

import { usePathname } from 'next/navigation'
import StaggeredMenu from './StaggeredMenu'

const Sidebar = () => {
  const pathname = usePathname()

  // Only show on homepage (preserve original invariant)
  if (pathname !== '/') {
    return null
  }

  const menuItems = [
    { label: 'Matches', ariaLabel: 'Matches Played', link: '/matches' },
    {
      label: 'Overall Stats',
      ariaLabel: 'Go to overall stats',
      link: '/leaderboard',
    },
    {
      label: 'Manage Players',
      ariaLabel: 'Manage or create new players',
      link: '/admin',
    },
  ]

  return (
    <StaggeredMenu
      position="right"
      items={menuItems}
      displayItemNumbering={true}
      colors={['#1a3040', '#0d1420']}
      accentColor="#b9e03c"
      menuButtonColor="#22d3ee"
      openMenuButtonColor="#ffffff"
      changeMenuColorOnOpen={true}
      closeOnClickAway={true}
      isFixed={false}
      logoUrl={false}
      className="xl:hidden"
    />
  )
}

export default Sidebar
