'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Camera, Edit2, Github, Linkedin, Twitter, Award, Trophy, Code, Users } from 'lucide-react'

export default function ProfilePage() {
  // Mock user data - in Phase 2 this will come from auth context/API
  const user = {
    id: '1',
    name: 'Alice Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Full-stack developer passionate about building amazing products and contributing to open source.',
    title: 'Senior Developer',
    location: 'San Francisco, CA',
    email: 'alice@example.com',
    joinDate: 'January 2024',
    team: 'CodeCrusaders',
    socials: {
      github: 'alice-dev',
      linkedin: 'alice-johnson',
      twitter: 'alice_dev',
    },
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'GraphQL', 'Python'],
    stats: {
      eventsParticipated: 8,
      projectsSubmitted: 5,
      badges: 12,
      points: 2850,
      teamSize: 3,
    },
    achievements: [
      { name: 'Hackathon Veteran', earned: true },
      { name: 'Code Master', earned: true },
      { name: 'Speed Runner', earned: true },
      { name: 'Tech Stack Master', earned: true },
      { name: 'Rising Star', earned: false },
      { name: 'Community Builder', earned: false },
    ],
    recentProjects: [
      {
        title: 'EcoTrack - Carbon Footprint Monitor',
        role: 'Team Lead',
        status: 'Completed',
      },
      {
        title: 'DevConnect - Developer Networking',
        role: 'Full-Stack Developer',
        status: 'In Progress',
      },
    ],
  }

  return (
    <main>
      <Navbar />

      {/* Header Background */}
      <section className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
              {/* Avatar */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover border-4 border-primary"
                />
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                <p className="text-sm text-primary font-semibold">{user.title}</p>
                <p className="text-xs text-muted-foreground">{user.location}</p>
              </div>

              {/* Edit Profile Button */}
              <button className="w-full py-2 rounded-lg border-2 border-primary text-primary font-semibold transition-all duration-200 hover:bg-primary/10 flex items-center justify-center gap-2 mb-4">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>

              {/* Social Links */}
              <div className="space-y-3 pt-6 border-t border-border">
                <a href="#" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <Github className="w-5 h-5" />
                  <span className="text-sm">@{user.socials.github}</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <Linkedin className="w-5 h-5" />
                  <span className="text-sm">{user.socials.linkedin}</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                  <span className="text-sm">@{user.socials.twitter}</span>
                </a>
              </div>

              {/* Join Date */}
              <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
                <p>Joined {user.joinDate}</p>
                <p>Team: <span className="text-foreground font-semibold">{user.team}</span></p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-bold text-foreground mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Points</span>
                  </div>
                  <span className="font-bold text-lg text-foreground">{user.stats.points}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-secondary" />
                    <span className="text-sm text-muted-foreground">Events</span>
                  </div>
                  <span className="font-bold text-lg text-foreground">{user.stats.eventsParticipated}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted-foreground">Badges</span>
                  </div>
                  <span className="font-bold text-lg text-foreground">{user.stats.badges}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Projects</span>
                  </div>
                  <span className="font-bold text-lg text-foreground">{user.stats.projectsSubmitted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                {user.bio}
              </p>
            </div>

            {/* Skills Section */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Skills</h2>
              <div className="flex flex-wrap gap-3">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Achievements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {user.achievements.map((achievement) => (
                  <div
                    key={achievement.name}
                    className={`rounded-lg p-4 text-center transition-all duration-300 ${
                      achievement.earned
                        ? 'border border-primary/50 bg-primary/10'
                        : 'border border-border bg-muted/50 opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">
                      {achievement.earned ? '✓' : '?'}
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-2">
                      {achievement.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Projects */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Recent Projects</h2>
              <div className="space-y-4">
                {user.recentProjects.map((project, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-foreground">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'Completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16" />
      <Footer />
    </main>
  )
}
