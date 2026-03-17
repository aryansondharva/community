'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Trophy, Zap, Award, TrendingUp } from 'lucide-react'

const mockLeaderboard = [
  {
    rank: 1,
    name: 'Alice Johnson',
    team: 'CodeCrusaders',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    points: 2850,
    eventsParticipated: 8,
    projectsSubmitted: 5,
    badges: 12,
    trend: 'up',
  },
  {
    rank: 2,
    name: 'David Lee',
    team: 'AI Innovators',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    points: 2720,
    eventsParticipated: 7,
    projectsSubmitted: 6,
    badges: 11,
    trend: 'up',
  },
  {
    rank: 3,
    name: 'Emma Wilson',
    team: 'Web3Pioneers',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    points: 2590,
    eventsParticipated: 9,
    projectsSubmitted: 4,
    badges: 10,
    trend: 'stable',
  },
  {
    rank: 4,
    name: 'Michael Brown',
    team: 'CloudWalkers',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    points: 2450,
    eventsParticipated: 6,
    projectsSubmitted: 7,
    badges: 9,
    trend: 'up',
  },
  {
    rank: 5,
    name: 'Sarah Anderson',
    team: 'DesignDynamos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    points: 2380,
    eventsParticipated: 7,
    projectsSubmitted: 5,
    badges: 10,
    trend: 'down',
  },
  {
    rank: 6,
    name: 'James Martinez',
    team: 'MobileFirst',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    points: 2240,
    eventsParticipated: 8,
    projectsSubmitted: 3,
    badges: 8,
    trend: 'up',
  },
  {
    rank: 7,
    name: 'Lisa Garcia',
    team: 'CodeCrusaders',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    points: 2150,
    eventsParticipated: 6,
    projectsSubmitted: 4,
    badges: 7,
    trend: 'stable',
  },
  {
    rank: 8,
    name: 'Robert Taylor',
    team: 'AI Innovators',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    points: 2080,
    eventsParticipated: 5,
    projectsSubmitted: 6,
    badges: 8,
    trend: 'down',
  },
  {
    rank: 9,
    name: 'Jennifer White',
    team: 'Web3Pioneers',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    points: 1950,
    eventsParticipated: 5,
    projectsSubmitted: 5,
    badges: 7,
    trend: 'up',
  },
  {
    rank: 10,
    name: 'Christopher Jones',
    team: 'CloudWalkers',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    points: 1890,
    eventsParticipated: 4,
    projectsSubmitted: 4,
    badges: 6,
    trend: 'stable',
  },
]

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<'points' | 'events' | 'projects' | 'badges'>('points')
  const [filterTeam, setFilterTeam] = useState('All Teams')

  const teams = ['All Teams', 'CodeCrusaders', 'AI Innovators', 'Web3Pioneers', 'CloudWalkers', 'DesignDynamos', 'MobileFirst']

  const sortedLeaderboard = [...mockLeaderboard].sort((a, b) => {
    if (filterTeam !== 'All Teams') {
      return (a.team === filterTeam ? -1 : 1) - (b.team === filterTeam ? -1 : 1)
    }

    switch (sortBy) {
      case 'points':
        return b.points - a.points
      case 'events':
        return b.eventsParticipated - a.eventsParticipated
      case 'projects':
        return b.projectsSubmitted - a.projectsSubmitted
      case 'badges':
        return b.badges - a.badges
      default:
        return 0
    }
  })

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '📈'
    if (trend === 'down') return '📉'
    return '➡️'
  }

  return (
    <main>
      <Navbar />

      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-primary" />
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                Global Leaderboard
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Compete, achieve, and climb the ranks. See where you stand in the community.
            </p>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              {teams.map((team) => (
                <button
                  key={team}
                  onClick={() => setFilterTeam(team)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    filterTeam === team
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'points' as const, label: 'Points', icon: Zap },
                { value: 'events' as const, label: 'Events', icon: Trophy },
                { value: 'projects' as const, label: 'Projects', icon: Award },
                { value: 'badges' as const, label: 'Badges', icon: TrendingUp },
              ].map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                      sortBy === option.value
                        ? 'bg-secondary text-secondary-foreground'
                        : 'border border-border bg-card text-foreground hover:border-secondary/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Desktop View */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Developer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Team</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-foreground">Points</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-foreground">Events</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-foreground">Projects</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-foreground">Badges</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedLeaderboard.slice(0, 20).map((entry, idx) => (
                    <tr key={entry.rank} className="hover:bg-muted/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <span className="text-2xl font-bold text-foreground">
                          {getRankMedal(entry.rank)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.avatar}
                            alt={entry.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span className="font-semibold text-foreground">{entry.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{entry.team}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary">
                          {entry.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-foreground font-semibold">
                        {entry.eventsParticipated}
                      </td>
                      <td className="px-6 py-4 text-center text-foreground font-semibold">
                        {entry.projectsSubmitted}
                      </td>
                      <td className="px-6 py-4 text-center text-foreground font-semibold">
                        {entry.badges}
                      </td>
                      <td className="px-6 py-4 text-center text-2xl">
                        {getTrendIcon(entry.trend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {sortedLeaderboard.slice(0, 20).map((entry) => (
              <div key={entry.rank} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start gap-4 mb-3">
                  <div className="text-2xl font-bold text-foreground">
                    {getRankMedal(entry.rank)}
                  </div>
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{entry.name}</h3>
                    <p className="text-sm text-muted-foreground">{entry.team}</p>
                  </div>
                  <span className="text-2xl">{getTrendIcon(entry.trend)}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Points</p>
                    <p className="font-bold text-primary text-sm">{entry.points}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Events</p>
                    <p className="font-bold text-foreground text-sm">{entry.eventsParticipated}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Projects</p>
                    <p className="font-bold text-foreground text-sm">{entry.projectsSubmitted}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Badges</p>
                    <p className="font-bold text-foreground text-sm">{entry.badges}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
