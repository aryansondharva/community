'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { EventCard } from '@/components/event-card'
import { Calendar, Bell, Settings, LogOut, TrendingUp, Zap, Award, Users } from 'lucide-react'

export default function DashboardPage() {
  // Mock user data - in Phase 2 this will come from auth context/API
  const user = {
    name: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    points: 2850,
    level: 'Advanced',
  }

  const registeredEvents = [
    {
      id: '1',
      title: 'OpenSource Global Hackathon 2024',
      description: 'A worldwide hackathon celebrating open source innovation.',
      startDate: 'Mar 20',
      endDate: 'Mar 22',
      prizePool: '$50,000',
      participants: 45,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
      status: 'upcoming' as const,
    },
    {
      id: '2',
      title: 'AI Innovation Challenge',
      description: 'Build cutting-edge AI applications and compete for prizes.',
      startDate: 'Apr 15',
      endDate: 'Apr 17',
      prizePool: '$100,000',
      participants: 38,
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop',
      status: 'upcoming' as const,
    },
  ]

  const teamInvites = [
    {
      teamName: 'AI Innovators',
      role: 'Backend Engineer',
      message: 'We need a skilled backend developer for our AI project',
      avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop',
    },
    {
      teamName: 'Web3Pioneers',
      role: 'Full-Stack Developer',
      message: 'Join us for an exciting blockchain hackathon',
      avatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop',
    },
  ]

  const upcomingMilestones = [
    {
      title: 'OpenSource Global Hackathon 2024',
      date: 'March 20, 2024',
      daysUntil: 2,
      status: 'registered',
    },
    {
      title: 'AI Innovation Challenge',
      date: 'April 15, 2024',
      daysUntil: 29,
      status: 'interested',
    },
  ]

  const activityFeed = [
    {
      type: 'project_submission',
      title: 'Submitted project "EcoTrack"',
      time: '2 hours ago',
      icon: Award,
    },
    {
      type: 'team_join',
      title: 'Joined team "CodeCrusaders"',
      time: '1 day ago',
      icon: Users,
    },
    {
      type: 'achievement',
      title: 'Earned "Code Master" badge',
      time: '3 days ago',
      icon: Zap,
    },
    {
      type: 'event_registration',
      title: 'Registered for OpenSource Global Hackathon',
      time: '5 days ago',
      icon: Calendar,
    },
  ]

  return (
    <main>
      <Navbar />

      {/* Top Navigation Bar */}
      <section className="bg-card border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell className="w-6 h-6 text-foreground" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Settings className="w-6 h-6 text-foreground" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Points</p>
                <p className="text-3xl font-bold text-foreground">{user.points}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Level</p>
                <p className="text-2xl font-bold text-foreground">{user.level}</p>
              </div>
              <Award className="w-8 h-8 text-secondary" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Events</p>
                <p className="text-3xl font-bold text-foreground">8</p>
              </div>
              <Calendar className="w-8 h-8 text-accent" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Projects</p>
                <p className="text-3xl font-bold text-foreground">5</p>
              </div>
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Registered Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registeredEvents.map((event) => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            </section>

            {/* Activity Feed */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">Recent Activity</h2>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="space-y-0">
                  {activityFeed.map((activity, idx) => {
                    const Icon = activity.icon
                    return (
                      <div
                        key={idx}
                        className={`p-6 flex items-start gap-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors`}
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Team Invitations */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Team Invitations</h3>
              {teamInvites.length > 0 ? (
                <div className="space-y-4">
                  {teamInvites.map((invite, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border bg-muted/30">
                      <div className="flex gap-3 mb-3">
                        <img
                          src={invite.avatar}
                          alt={invite.teamName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-sm">{invite.teamName}</p>
                          <p className="text-xs text-primary font-semibold">{invite.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{invite.message}</p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold transition-all duration-200 hover:shadow-lg">
                          Accept
                        </button>
                        <button className="flex-1 py-2 rounded-lg border border-primary text-primary text-xs font-semibold transition-all duration-200 hover:bg-primary/10">
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No pending invitations</p>
              )}
            </section>

            {/* Upcoming Milestones */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Upcoming Dates</h3>
              <div className="space-y-3">
                {upcomingMilestones.map((milestone, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-muted/30">
                    <p className="font-semibold text-foreground text-sm">{milestone.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">{milestone.date}</p>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
                        {milestone.daysUntil === 0 ? 'Today' : `${milestone.daysUntil}d`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Links */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="/events" className="block py-2 px-4 rounded-lg text-primary font-semibold hover:bg-primary/10 transition-colors">
                  Browse Events
                </a>
                <a href="/teams" className="block py-2 px-4 rounded-lg text-primary font-semibold hover:bg-primary/10 transition-colors">
                  Find Teams
                </a>
                <a href="/projects" className="block py-2 px-4 rounded-lg text-primary font-semibold hover:bg-primary/10 transition-colors">
                  View Projects
                </a>
                <a href="/leaderboard" className="block py-2 px-4 rounded-lg text-primary font-semibold hover:bg-primary/10 transition-colors">
                  Check Leaderboard
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
