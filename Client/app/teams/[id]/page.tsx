'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Users, Code, Calendar, Trophy, Github, Mail } from 'lucide-react'

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  // Mock team data - in Phase 2 this will come from API
  const team = {
    id: params.id,
    name: 'CodeCrusaders',
    description: 'Experienced team of full-stack developers passionate about web technologies.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
    foundedDate: 'January 2024',
    members: [
      {
        id: '1',
        name: 'Alice Johnson',
        role: 'Team Lead / Full-Stack Dev',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        bio: '5 years experience in React and Node.js',
        skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        social: { github: 'alice-dev', linkedin: 'alice-johnson' },
      },
      {
        id: '2',
        name: 'Bob Chen',
        role: 'Frontend Developer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        bio: 'UI/UX enthusiast with modern React skills',
        skills: ['React', 'TypeScript', 'Tailwind', 'Vue.js'],
        social: { github: 'bob-chen', linkedin: 'bob-chen' },
      },
      {
        id: '3',
        name: 'Carol Davis',
        role: 'Backend Developer',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        bio: 'Expert in microservices and cloud architecture',
        skills: ['Node.js', 'Python', 'Docker', 'Kubernetes'],
        social: { github: 'carol-dev', linkedin: 'carol-davis' },
      },
    ],
    memberCount: 3,
    maxMembers: 4,
    lookingFor: ['Backend Engineer', 'Designer'],
    techStack: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
    registeredEvents: [
      { name: 'OpenSource Global Hackathon 2024', status: 'Registered' },
      { name: 'AI Innovation Challenge', status: 'Applied' },
    ],
    pastProjects: [
      {
        name: 'E-Commerce Platform',
        description: 'Full-featured online store with payment integration',
        technologies: ['React', 'Node.js', 'Stripe'],
      },
      {
        name: 'Real-time Chat App',
        description: 'WebSocket-based messaging platform with user authentication',
        technologies: ['React', 'Socket.io', 'MongoDB'],
      },
    ],
    about: `We're a passionate team of full-stack developers with over 15 years of combined experience in web development. We specialize in building scalable, modern applications using cutting-edge technologies.

Our team has participated in 5+ hackathons and has won 3 times. We're always looking for new challenges and opportunities to learn and grow together.`,
    rules: [
      'All members commit to the full duration of the hackathon',
      'Collaborative decision-making on project selection',
      'Regular check-ins every 8 hours during the event',
      'Respectful and inclusive environment for all members',
    ],
  }

  return (
    <main>
      <Navbar />

      {/* Hero Image */}
      <section className="h-80 overflow-hidden relative">
        <img
          src={team.image}
          alt={team.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Team Info */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {team.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {team.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{team.memberCount} / {team.maxMembers} members</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Founded {team.foundedDate}</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">About Us</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {team.about}
              </p>
            </div>

            {/* Members */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Team Members</h2>
              <div className="space-y-4">
                {team.members.map((member) => (
                  <div key={member.id} className="rounded-lg border border-border bg-card p-6">
                    <div className="flex gap-4">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground">{member.name}</h3>
                        <p className="text-sm text-primary font-semibold mb-2">{member.role}</p>
                        <p className="text-sm text-muted-foreground mb-3">{member.bio}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {member.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <a href="#" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Github className="w-4 h-4" />
                            GitHub
                          </a>
                          <a href="#" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Mail className="w-4 h-4" />
                            Contact
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-3">
                {team.techStack.map((tech) => (
                  <div
                    key={tech}
                    className="px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary font-semibold"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            {/* Team Rules */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Team Rules & Culture</h2>
              <ul className="space-y-3">
                {team.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <span className="text-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Registered Events */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Registered Events</h2>
              <div className="space-y-3">
                {team.registeredEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                    <span className="font-semibold text-foreground">{event.name}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Join Card */}
            <div className="rounded-xl border border-border bg-card p-6 sticky top-20">
              <h3 className="text-lg font-bold text-foreground mb-4">Interested?</h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                This team has {team.maxMembers - team.memberCount} available {team.maxMembers - team.memberCount === 1 ? 'spot' : 'spots'}.
              </p>

              <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 mb-3">
                Request to Join
              </button>
              <button className="w-full py-2 rounded-lg border-2 border-primary text-primary font-semibold transition-all duration-200 hover:bg-primary/10">
                Send Message
              </button>

              {/* Looking For */}
              {team.lookingFor.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Currently Looking For</p>
                  <div className="space-y-2">
                    {team.lookingFor.map((role) => (
                      <div key={role} className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                        {role}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Team Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Members</p>
                  <p className="text-3xl font-bold text-foreground">{team.memberCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Events</p>
                  <p className="text-3xl font-bold text-foreground">{team.registeredEvents.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Skills</p>
                  <p className="text-3xl font-bold text-foreground">{team.techStack.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
