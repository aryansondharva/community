import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="mb-8 inline-block">
          <div className="px-4 py-2 rounded-full glass border border-white/30 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Welcome to Tech Assassin Community</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance">
          <span className="gradient-text">Collaborate, Create,</span>
          <br />
          <span className="text-foreground">Compete & Grow Together</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          Join thousands of open source developers in epic hackathons. Find teammates, build amazing projects, and climb the leaderboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/events" className="btn-primary inline-flex items-center gap-2 justify-center">
            Explore Events
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/auth/register" className="btn-outline inline-flex items-center gap-2 justify-center">
            Join Community
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mb-12">
          <div className="glass rounded-xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-primary">10+</div>
            <div className="text-sm text-muted-foreground mt-2">Events</div>
          </div>
          <div className="glass rounded-xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-secondary">40+</div>
            <div className="text-sm text-muted-foreground mt-2">Developers</div>
          </div>
          <div className="glass rounded-xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-accent">7000 IN+</div>
            <div className="text-sm text-muted-foreground mt-2">Prize Pool</div>
          </div>
        </div>

        {/* Featured Hackathons Preview */}
        <div className="glass rounded-2xl p-8 border border-white/20 inline-block max-w-2xl">
          <p className="text-sm font-semibold text-muted-foreground uppercase mb-4">Featured Hackathons</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'OpenSource 2026', date: 'TBA' },
              { name: 'DevFest Global', date: 'TBA' },
              { name: 'Innovation Week', date: 'TBA' },
            ].map((hackathon) => (
              <div key={hackathon.name} className="text-left">
                <div className="font-semibold text-foreground text-sm">{hackathon.name}</div>
                <div className="text-xs text-muted-foreground">{hackathon.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
