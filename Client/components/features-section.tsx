import { Zap, Users, Trophy, Target, Zap as Rocket, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Find Events',
    description: 'Discover hackathons from around the world. Filter by tech stack, dates, prize pool, and difficulty level.',
  },
  {
    icon: Users,
    title: 'Build Teams',
    description: 'Connect with talented developers. Find teammates with complementary skills and shared interests.',
  },
  {
    icon: Rocket,
    title: 'Showcase Projects',
    description: 'Share your creations with the community. Get feedback, earn votes, and gain recognition.',
  },
  {
    icon: Trophy,
    title: 'Compete & Win',
    description: 'Participate in exciting competitions. Win prizes, badges, and climb the global leaderboard.',
  },
  {
    icon: Target,
    title: 'Earn Badges',
    description: 'Unlock achievements through participation. Showcase your accomplishments and expertise.',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    description: 'Monitor your journey. View statistics, achievements, and growth in one beautiful dashboard.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
          Everything You Need to Succeed
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          A comprehensive platform designed for open source developers to collaborate, compete, and grow together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:from-indigo-600/30 group-hover:to-purple-600/30 transition-all">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
