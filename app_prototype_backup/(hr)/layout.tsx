'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  MessageSquare,
  Users,
  CalendarDays,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'
import { PipelineContextPanel } from '@/components/pipeline/pipeline-context-panel'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/lib/hooks/useAuth'

const NAV_ITEMS = [
  { icon: MessageSquare, label: 'Chat', href: '/chat' },
  { icon: Users, label: 'Candidates', href: '/candidates/1' },
  { icon: CalendarDays, label: 'Interviews', href: '/interviews/1' },
  { icon: FileText, label: 'Offers', href: '/offers/1' },
  { icon: Settings, label: 'Templates', href: '/templates' },
]

function SidebarNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <nav className="flex flex-col items-center w-14 shrink-0 border-r border-border bg-white py-3 gap-1">
      {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
        const isActive = pathname === href || pathname.startsWith(href.replace('/1', ''))
        return (
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <Link
                href={href}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-700 bg-indigo-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
                style={isActive ? { color: '#4338ca' } : undefined}
              >
                <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="sr-only">{label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        )
      })}

      {/* Spacer pushes logout to bottom */}
      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.75} />
            <span className="sr-only">Sign out</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Sign out</TooltipContent>
      </Tooltip>
    </nav>
  )
}

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  // Derive initials and display name from real user (or fall back to placeholder)
  const displayName = user?.name ?? 'HR'
  const roleLabel = user?.role ? user.role.toUpperCase() : 'HR'
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'HR'

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Topbar — full width */}
        <header className="h-12 border-b border-border bg-white flex items-center justify-between px-4 shrink-0 z-10">
          <span className="font-bold text-base" style={{ color: '#4338ca' }}>
            TalentOS
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{roleLabel}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-7 w-7 cursor-default">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">{displayName}</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Body — sidebar + main + pipeline */}
        <div className="flex flex-1 overflow-hidden">
          <SidebarNav />
          <main className="flex-1 overflow-hidden">{children}</main>
          <aside className="w-72 shrink-0 overflow-hidden">
            <PipelineContextPanel />
          </aside>
        </div>
      </div>
    </TooltipProvider>
  )
}
