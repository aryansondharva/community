'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { EventCard } from '@/components/event-card'
import { Search, Filter } from 'lucide-react'

const mockEvents = [
  {
    id: '1',
    title: 'OpenSource Global Hackathon 2024',
    description: 'A worldwide hackathon celebrating open source innovation and collaboration.',
    startDate: 'Mar 20',
    endDate: 'Mar 22',
    prizePool: '$50,000',
    participants: 45,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    status: 'upcoming' as const,
  },
  {
    id: '2',
    title: 'DevFest Global 2024',
    description: 'Join developers from around the world in this exciting 48-hour hackathon.',
    startDate: 'Apr 10',
    endDate: 'Apr 12',
    prizePool: '$75,000',
    participants: 62,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    status: 'upcoming' as const,
  },
  {
    id: '3',
    title: 'AI Innovation Challenge',
    description: 'Build cutting-edge AI applications and compete for amazing prizes.',
    startDate: 'Apr 15',
    endDate: 'Apr 17',
    prizePool: '$100,000',
    participants: 38,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop',
    status: 'upcoming' as const,
  },
  {
    id: '4',
    title: 'Web3 Summit Hackathon',
    description: 'Explore the future of web development with blockchain and decentralization.',
    startDate: 'May 5',
    endDate: 'May 7',
    prizePool: '$85,000',
    participants: 41,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
    status: 'upcoming' as const,
  },
  {
    id: '5',
    title: 'React Native Mobile Dev Hack',
    description: 'Build amazing mobile applications using React Native.',
    startDate: 'May 20',
    endDate: 'May 22',
    prizePool: '$60,000',
    participants: 33,
    image: 'https://images.unsplash.com/photo-1516534775068-bb6badf81890?w=500&h=300&fit=crop',
    status: 'upcoming' as const,
  },
  {
    id: '6',
    title: 'Cloud Computing Challenge',
    description: 'Showcase your cloud infrastructure and DevOps skills.',
    startDate: 'Jun 1',
    endDate: 'Jun 3',
    prizePool: '$70,000',
    participants: 27,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop',
    status: 'upcoming' as const,
  },
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    if (filter === 'upcoming') return matchesSearch && event.status === 'upcoming'
    if (filter === 'high-prize') return matchesSearch && parseInt(event.prizePool) >= 75000
    
    return matchesSearch
  })

  return (
    <main>
      <Navbar />
      
      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
              Hackathon Events
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover and register for amazing hackathons around the world.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="space-y-4 sm:space-y-0 sm:flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              {[
                { value: 'all', label: 'All Events' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'high-prize', label: 'High Prize' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                    filter === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">{opt.label}</span>
                  <span className="sm:hidden">{opt.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredEvents.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredEvents.length} of {mockEvents.length} events
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} {...event} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-foreground mb-2">No events found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
