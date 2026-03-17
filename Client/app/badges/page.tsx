'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Award, Zap, Star, Trophy, Code, Users } from 'lucide-react'

const badges = [
  {
    id: '1',
    name: 'Hackathon Veteran',
    description: 'Participated in 10+ hackathons',
    icon: Trophy,
    color: 'from-amber-500 to-orange-500',
    earned: true,
    progress: 100,
    rarity: 'Common',
  },
  {
    id: '2',
    name: 'Code Master',
    description: 'Submitted 5+ winning projects',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    earned: true,
    progress: 100,
    rarity: 'Rare',
  },
  {
    id: '3',
    name: 'Team Player',
    description: 'Collaborated in 5+ team hackathons',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    earned: false,
    progress: 60,
    rarity: 'Common',
  },
  {
    id: '4',
    name: 'Rising Star',
    description: 'Win 3 consecutive hackathons',
    icon: Star,
    color: 'from-yellow-500 to-red-500',
    earned: false,
    progress: 33,
    rarity: 'Epic',
  },
  {
    id: '5',
    name: 'Innovation Pioneer',
    description: 'Create 10 unique project ideas',
    icon: Zap,
    color: 'from-green-500 to-emerald-500',
    earned: false,
    progress: 70,
    rarity: 'Legendary',
  },
  {
    id: '6',
    name: 'Speed Runner',
    description: 'Complete a project in under 6 hours',
    icon: Award,
    color: 'from-red-500 to-pink-500',
    earned: true,
    progress: 100,
    rarity: 'Rare',
  },
  {
    id: '7',
    name: 'Community Builder',
    description: 'Mentor 5 newer developers',
    icon: Users,
    color: 'from-cyan-500 to-blue-500',
    earned: false,
    progress: 40,
    rarity: 'Epic',
  },
  {
    id: '8',
    name: 'Tech Stack Master',
    description: 'Use 10 different technologies',
    icon: Code,
    color: 'from-indigo-500 to-purple-500',
    earned: true,
    progress: 100,
    rarity: 'Rare',
  },
  {
    id: '9',
    name: 'Perfectionist',
    description: 'Achieve perfect code quality score',
    icon: Star,
    color: 'from-violet-500 to-purple-500',
    earned: false,
    progress: 85,
    rarity: 'Legendary',
  },
  {
    id: '10',
    name: 'Global Champion',
    description: 'Win an international hackathon',
    icon: Trophy,
    color: 'from-gold-500 to-yellow-500',
    earned: false,
    progress: 0,
    rarity: 'Legendary',
  },
  {
    id: '11',
    name: 'Deadline Crusher',
    description: 'Submit project in final 30 minutes',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    earned: true,
    progress: 100,
    rarity: 'Common',
  },
  {
    id: '12',
    name: 'Sustainability Champion',
    description: 'Win 3+ sustainability-focused events',
    icon: Award,
    color: 'from-green-500 to-teal-500',
    earned: false,
    progress: 33,
    rarity: 'Epic',
  },
]

export default function BadgesPage() {
  const earnedBadges = badges.filter((b) => b.earned)
  const inProgressBadges = badges.filter((b) => !b.earned)

  const rarityColors = {
    Common: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
    Rare: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    Epic: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
    Legendary: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  }

  return (
    <main>
      <Navbar />

      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              Badges & Achievements
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Unlock achievements through participation and excellence. Each badge represents a milestone in your hackathon journey.
          </p>
        </div>
      </section>

      {/* Progress Summary */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground uppercase font-semibold mb-2">Total Badges Earned</p>
              <div className="text-4xl font-bold text-primary mb-2">{earnedBadges.length}</div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round((earnedBadges.length / badges.length) * 100)}% collection complete
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground uppercase font-semibold mb-2">In Progress</p>
              <div className="text-4xl font-bold text-secondary mb-2">{inProgressBadges.length}</div>
              <p className="text-sm text-muted-foreground">
                Keep participating to unlock more achievements
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground uppercase font-semibold mb-2">Current Streak</p>
              <div className="text-4xl font-bold text-accent mb-2">8</div>
              <p className="text-sm text-muted-foreground">
                Consecutive events with achievements
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Earned Badges */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Your Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {earnedBadges.map((badge) => {
              const Icon = badge.icon
              return (
                <div key={badge.id} className="rounded-xl border border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${rarityColors[badge.rarity as keyof typeof rarityColors]}`}>
                    {badge.rarity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* In Progress Badges */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgressBadges.map((badge) => {
              const Icon = badge.icon
              return (
                <div key={badge.id} className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex gap-4">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center flex-shrink-0 shadow-lg opacity-60`}>
                      <Icon className="w-10 h-10 text-white/60" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-semibold text-foreground">{badge.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                            style={{ width: `${badge.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${rarityColors[badge.rarity as keyof typeof rarityColors]}`}>
                        {badge.rarity}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Badge Guide */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">How to Earn Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Participation Badges
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Register for hackathons</li>
                <li>✓ Form and join teams</li>
                <li>✓ Submit projects</li>
                <li>✓ Vote on other projects</li>
                <li>✓ Help other community members</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                Achievement Badges
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Win competitions</li>
                <li>✓ Reach leaderboard milestones</li>
                <li>✓ Create high-quality projects</li>
                <li>✓ Mentor other developers</li>
                <li>✓ Set new records</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
