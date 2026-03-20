'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Trophy, Zap, Award, TrendingUp, Crown, Medal, Star, Sparkles } from 'lucide-react'

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

      {/* Header Section with Gradient Background */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-10 left-1/4 w-36 h-36 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-500" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Trophy className="w-10 h-10 text-yellow-300" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-white">
                Global Leaderboard
              </h1>
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Crown className="w-10 h-10 text-yellow-300" />
              </div>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Compete, achieve, and climb the ranks. See where you stand in the community.
            </p>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
            <div className="flex flex-wrap gap-2 justify-center">
              {teams.map((team) => (
                <button
                  key={team}
                  onClick={() => setFilterTeam(team)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    filterTeam === team
                      ? 'bg-white text-indigo-600 shadow-lg shadow-white/30'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  {team}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex flex-wrap gap-2 justify-center">
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
                    className={`px-3 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                      sortBy === option.value
                        ? 'bg-white text-indigo-600 shadow-lg shadow-white/30'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm'
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
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          {/* Desktop View */}
          <div className="hidden md:block rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50 bg-gradient-to-r from-muted/50 to-muted/30">
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
                <tbody className="divide-y divide-border/30">
                  {sortedLeaderboard.slice(0, 20).map((entry, idx) => (
                    <tr 
                      key={entry.rank} 
                      className={`hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 transition-all duration-300 ${
                        entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {entry.rank <= 3 && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' :
                              entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-700' :
                              'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100'
                            }`}>
                              {entry.rank}
                            </div>
                          )}
                          <span className={`text-2xl font-bold ${
                            entry.rank === 1 ? 'text-yellow-600' :
                            entry.rank === 2 ? 'text-gray-500' :
                            entry.rank === 3 ? 'text-amber-600' :
                            'text-foreground'
                          }`}>
                            {getRankMedal(entry.rank)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={entry.avatar}
                              alt={entry.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-border/50"
                            />
                            {entry.rank <= 3 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Star className="w-2 h-2 text-yellow-900" />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-foreground">{entry.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{entry.team}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          entry.rank <= 3 
                            ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-600 border border-yellow-400/30' 
                            : 'bg-primary/10 text-primary'
                        }`}>
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
                        <div className="flex items-center justify-center gap-1">
                          {entry.badges}
                          {entry.badges >= 10 && <Sparkles className="w-3 h-3 text-yellow-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-2xl">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          entry.trend === 'up' ? 'bg-green-100 text-green-600' :
                          entry.trend === 'down' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getTrendIcon(entry.trend)}
                        </div>
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
              <div 
                key={entry.rank} 
                className={`rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg ${
                  entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-400/30' : ''
                }`}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {entry.rank <= 3 && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' :
                        entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-700' :
                        'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100'
                      }`}>
                        {entry.rank}
                      </div>
                    )}
                    <div className={`text-2xl font-bold ${
                      entry.rank === 1 ? 'text-yellow-600' :
                      entry.rank === 2 ? 'text-gray-500' :
                      entry.rank === 3 ? 'text-amber-600' :
                      'text-foreground'
                    }`}>
                      {getRankMedal(entry.rank)}
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-border/50"
                    />
                    {entry.rank <= 3 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Star className="w-2 h-2 text-yellow-900" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{entry.name}</h3>
                    <p className="text-sm text-muted-foreground">{entry.team}</p>
                  </div>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                    entry.trend === 'up' ? 'bg-green-100 text-green-600' :
                    entry.trend === 'down' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getTrendIcon(entry.trend)}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border/30">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Points</p>
                    <p className={`font-bold text-sm ${
                      entry.rank <= 3 ? 'text-yellow-600' : 'text-primary'
                    }`}>{entry.points}</p>
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
                    <div className="flex items-center justify-center gap-1">
                      <p className="font-bold text-foreground text-sm">{entry.badges}</p>
                      {entry.badges >= 10 && <Sparkles className="w-3 h-3 text-yellow-500" />}
                    </div>
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
