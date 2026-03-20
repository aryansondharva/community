'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Users, Code, Trophy, Zap, LogIn } from 'lucide-react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/events', label: 'Events', icon: Zap },
    { href: '/teams', label: 'Teams', icon: Users },
    { href: '/projects', label: 'Projects', icon: Code },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline text-foreground">Tech Assassin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-white/10 dark:hover:bg-white/5"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Auth Links & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-white/20 dark:border-white/10">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-white/10 dark:hover:bg-white/5"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium text-foreground hover:bg-white/10 dark:hover:bg-white/5"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
