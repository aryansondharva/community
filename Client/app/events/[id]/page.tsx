'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Calendar, Users, Trophy, MapPin, Clock, Award } from 'lucide-react'

export default function EventDetailPage({ params }: { params: { id: string } }) {
  // Mock event data - in Phase 2 this will come from API
  const event = {
    id: params.id,
    title: 'OpenSource Global Hackathon 2024',
    description: 'A worldwide hackathon celebrating open source innovation and collaboration.',
    fullDescription: `Join us for the most exciting open source hackathon of the year! This 48-hour event brings together developers, designers, and open source enthusiasts from around the globe to create amazing projects, collaborate, and compete for incredible prizes.

    Whether you're a seasoned hackathon veteran or participating for the first time, this is the perfect opportunity to showcase your skills, learn from other talented developers, and make a real impact in the open source community.`,
    startDate: 'March 20, 2024',
    endDate: 'March 22, 2024',
    location: 'Virtual Event',
    prizePool: '$50,000',
    participants: 45,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop',
    status: 'upcoming' as const,
    rules: [
      'Teams can have 1-4 members',
      'All code must be created during the event',
      'Projects must be open source',
      'Judging based on innovation, completion, and presentation',
      'Previous winners are ineligible',
    ],
    prizes: [
      { placement: '1st Place', amount: '$20,000' },
      { placement: '2nd Place', amount: '$15,000' },
      { placement: '3rd Place', amount: '$10,000' },
      { placement: 'Best Design', amount: '$5,000' },
    ],
    timeline: [
      { time: 'March 20 - 10:00 AM', event: 'Opening Ceremony & Team Formation' },
      { time: 'March 20 - 12:00 PM', event: 'Coding Begins' },
      { time: 'March 21 - 3:00 PM', event: 'Midpoint Check-in' },
      { time: 'March 22 - 10:00 AM', event: 'Submission Deadline' },
      { time: 'March 22 - 2:00 PM', event: 'Judging & Presentations' },
      { time: 'March 22 - 5:00 PM', event: 'Awards & Closing Ceremony' },
    ],
    registeredTeams: 45,
    maxTeams: 100,
  }

  const registrationPercentage = (event.registeredTeams / event.maxTeams) * 100

  return (
    <main>
      <Navbar />

      {/* Hero Image */}
      <section className="h-96 overflow-hidden relative">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Status */}
            <div>
              <div className="inline-block mb-4">
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {event.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {event.description}
              </p>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <Calendar className="w-5 h-5 text-primary mb-2" />
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Dates</div>
                <div className="text-sm font-semibold text-foreground">{event.startDate.split(' ').slice(1).join(' ')}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <Clock className="w-5 h-5 text-primary mb-2" />
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Duration</div>
                <div className="text-sm font-semibold text-foreground">48 Hours</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <MapPin className="w-5 h-5 text-primary mb-2" />
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Location</div>
                <div className="text-sm font-semibold text-foreground">{event.location}</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <Trophy className="w-5 h-5 text-primary mb-2" />
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Prize Pool</div>
                <div className="text-sm font-semibold text-foreground">{event.prizePool}</div>
              </div>
            </div>

            {/* Full Description */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {event.fullDescription}
              </p>
            </div>

            {/* Rules */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Rules & Guidelines</h2>
              <ul className="space-y-3">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prizes */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Prize Breakdown</h2>
              <div className="space-y-3">
                {event.prizes.map((prize, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-accent" />
                      <span className="font-semibold text-foreground">{prize.placement}</span>
                    </div>
                    <span className="font-bold text-lg text-primary">{prize.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Event Timeline</h2>
              <div className="space-y-4">
                {event.timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-24 flex-shrink-0">
                      <p className="text-sm font-semibold text-primary">{item.time}</p>
                    </div>
                    <div className="pb-4 border-l-2 border-border pl-4 relative">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-2 top-1.5" />
                      <p className="text-foreground">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Registration Card */}
            <div className="rounded-xl border border-border bg-card p-6 sticky top-20">
              <h3 className="text-lg font-bold text-foreground mb-4">Register Now</h3>
              
              {/* Capacity */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Spots Available</span>
                  <span className="text-sm font-semibold text-foreground">
                    {event.registeredTeams}/{event.maxTeams}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${registrationPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {event.maxTeams - event.registeredTeams} teams can still register
                </p>
              </div>

              <button className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 mb-3">
                Register Team
              </button>
              <button className="w-full py-2 rounded-lg border-2 border-primary text-primary font-semibold transition-all duration-200 hover:bg-primary/10">
                Save for Later
              </button>

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Participants</p>
                  <p className="text-2xl font-bold text-foreground">{event.participants}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Prize Pool</p>
                  <p className="text-2xl font-bold text-primary">{event.prizePool}</p>
                </div>
              </div>
            </div>

            {/* Share Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Share Event</h3>
              <div className="space-y-2">
                {['Twitter', 'LinkedIn', 'Facebook', 'Copy Link'].map((platform) => (
                  <button
                    key={platform}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground font-semibold hover:border-primary/50 hover:bg-card transition-all duration-200"
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
