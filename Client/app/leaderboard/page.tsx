'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Trophy, Zap, Award, Crown, Medal, Star, Sparkles } from 'lucide-react'

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
    return `#${rank}`
  }

  return (
    <main>
      <Navbar />

      {/* Header Section with Gradient Background */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b-2 border-gray-200">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-white" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8">
                
            <div className="flex items-center justify-center gap-3 mb-6">
              
              
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Leaderboard
              </h1>
             
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Compete, achieve, and climb the ranks. See where you stand in the community.
            </p>
          </div>

          {/* Enhanced Filter and Sort Controls */}
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-center">
            {/* Team Filter */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-white/80">Filter by Team</label>
              <div className="flex flex-wrap gap-2">
                {teams.map((team) => (
                  <button
                    key={team}
                    onClick={() => setFilterTeam(team)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                      filterTeam === team
                        ? 'bg-white text-gray-800 shadow-lg'
                        : 'bg-gray-700/50 text-white/80 hover:bg-gray-600/50 border border-gray-600/30'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-white/80">Sort by</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'points' as const, label: 'Points', icon: Zap },
                  { value: 'events' as const, label: 'Events', icon: Trophy },
                  { value: 'projects' as const, label: 'Projects', icon: Award },
                  { value: 'badges' as const, label: 'Badges', icon: Award },
                ].map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                        sortBy === option.value
                          ? 'bg-white text-gray-800 shadow-lg'
                          : 'bg-gray-700/50 text-white/80 hover:bg-gray-600/50 border border-gray-600/30'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Desktop View */}
          <div className="hidden md:block rounded-2xl border-2 border-gray-300 bg-white shadow-xl overflow-hidden">
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
                className={`rounded-xl border-2 border-gray-300 bg-white shadow-lg p-4 transition-all duration-300 hover:shadow-xl ${
                  entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : ''
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
