import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/hero-section'
import { FeaturesSection } from '@/components/features-section'

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <FeaturesSection />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600/10 to-purple-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
            Ready to Join the Community?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your hackathon journey today. Register, find teammates, and compete in amazing events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/register" className="btn-primary inline-block text-center">
              Get Started Now
            </a>
            <a href="/events" className="btn-outline inline-block text-center">
              Browse Events
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
