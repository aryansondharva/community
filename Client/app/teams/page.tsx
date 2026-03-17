'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { TeamCard } from '@/components/team-card'
import { Search, Filter } from 'lucide-react'

const mockTeams = [
  {
    id: '1',
    name: 'CodeCrusaders',
    description: 'Experienced team of full-stack developers passionate about web technologies.',
    memberCount: 3,
    maxMembers: 4,
    lookingFor: ['Backend Engineer', 'Designer'],
    techStack: ['React', 'Node.js', 'MongoDB'],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=200&fit=crop',
  },
  {
    id: '2',
    name: 'AI Innovators',
    description: 'Machine learning focused team building cutting-edge AI solutions.',
    memberCount: 2,
    maxMembers: 4,
    lookingFor: ['ML Engineer', 'Full-stack Dev', 'DevOps'],
    techStack: ['Python', 'TensorFlow', 'FastAPI'],
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=200&fit=crop',
  },
  {
    id: '3',
    name: 'CloudWalkers',
    description: 'Infrastructure and DevOps specialists exploring cloud technologies.',
    memberCount: 2,
    maxMembers: 3,
    lookingFor: ['Cloud Architect', 'Backend Dev'],
    techStack: ['AWS', 'Kubernetes', 'Terraform'],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=200&fit=crop',
  },
  {
    id: '4',
    name: 'MobileFirst',
    description: 'Mobile app developers creating amazing experiences on all platforms.',
    memberCount: 4,
    maxMembers: 4,
    lookingFor: [],
    techStack: ['React Native', 'Flutter', 'Swift'],
    image: 'https://images.unsplash.com/photo-1516534775068-bb6badf81890?w=500&h=200&fit=crop',
  },
  {
    id: '5',
    name: 'DesignDynamos',
    description: 'Creative team focused on beautiful UI/UX and design systems.',
    memberCount: 1,
    maxMembers: 4,
    lookingFor: ['Frontend Dev', 'Full-stack Dev', 'Animator'],
    techStack: ['Figma', 'React', 'Tailwind'],
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=200&fit=crop',
  },
  {
    id: '6',
    name: 'Web3Pioneers',
    description: 'Blockchain developers building the decentralized future.',
    memberCount: 3,
    maxMembers: 4,
    lookingFor: ['Solidity Dev'],
    techStack: ['Solidity', 'Web3.js', 'Hardhat'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=200&fit=crop',
  },
]

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredTeams = mockTeams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (filter === 'all') return matchesSearch
    if (filter === 'recruiting') return matchesSearch && team.lookingFor.length > 0
    if (filter === 'full') return matchesSearch && team.memberCount === team.maxMembers
    
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
              Find Your Team
            </h1>
            <p className="text-lg text-muted-foreground">
              Connect with talented developers and form amazing teams for hackathons.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="space-y-4 sm:space-y-0 sm:flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search teams or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              {[
                { value: 'all', label: 'All Teams' },
                { value: 'recruiting', label: 'Recruiting' },
                { value: 'full', label: 'Full Teams' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                    filter === opt.value
                      ? 'bg-secondary text-secondary-foreground'
                      : 'border border-border bg-card text-foreground hover:border-secondary/50'
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

      {/* Teams Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredTeams.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredTeams.length} of {mockTeams.length} teams
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                  <TeamCard key={team.id} {...team} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-foreground mb-2">No teams found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600/10 to-indigo-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Can't find a team? Create one!
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start your own team and invite other developers to join you on your hackathon journey.
          </p>
          <button className="btn-secondary inline-block">
            Create New Team
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}
