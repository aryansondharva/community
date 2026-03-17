'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProjectCard } from '@/components/project-card'
import { Search, Filter, Grid3x3, List } from 'lucide-react'

const mockProjects = [
  {
    id: '1',
    title: 'EcoTrack - Carbon Footprint Monitor',
    description: 'Real-time carbon footprint tracking for individuals and companies with AI-powered insights.',
    team: 'CodeCrusaders',
    category: 'Sustainability',
    image: 'https://images.unsplash.com/photo-1559618666-4b6d7f2b6f4f?w=500&h=300&fit=crop',
    stars: 245,
    tags: ['React', 'Node.js', 'AI', 'MongoDB'],
    featured: true,
    awards: ['Best Innovation'],
  },
  {
    id: '2',
    title: 'DevConnect - Developer Networking',
    description: 'Platform connecting developers globally for collaboration and knowledge sharing.',
    team: 'Web3Pioneers',
    category: 'Community',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
    stars: 189,
    tags: ['Next.js', 'Web3', 'PostgreSQL'],
    featured: false,
  },
  {
    id: '3',
    title: 'HealthSync - Telemedicine Platform',
    description: 'Secure video consultation platform connecting patients with healthcare professionals.',
    team: 'DesignDynamos',
    category: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1576091160550-112173f7f664?w=500&h=300&fit=crop',
    stars: 312,
    tags: ['Vue.js', 'WebRTC', 'Flask'],
    featured: true,
    awards: ['Best UX Design'],
  },
  {
    id: '4',
    title: 'LearnAI - Adaptive Learning System',
    description: 'Machine learning powered personalized education platform with real-time analytics.',
    team: 'AI Innovators',
    category: 'EdTech',
    image: 'https://images.unsplash.com/photo-1516573398502-47cf35f337a9?w=500&h=300&fit=crop',
    stars: 278,
    tags: ['Python', 'TensorFlow', 'React'],
    featured: false,
  },
  {
    id: '5',
    title: 'CloudVault - Secure File Storage',
    description: 'End-to-end encrypted cloud storage with zero-knowledge architecture.',
    team: 'CloudWalkers',
    category: 'Security',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop',
    stars: 401,
    tags: ['AWS', 'Go', 'Kubernetes'],
    featured: true,
    awards: ['Best Security'],
  },
  {
    id: '6',
    title: 'MobileShop - E-commerce App',
    description: 'Full-featured mobile shopping experience with AR product preview.',
    team: 'MobileFirst',
    category: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
    stars: 156,
    tags: ['React Native', 'Firebase', 'Stripe'],
    featured: false,
  },
]

const categories = ['All', 'Sustainability', 'Community', 'Healthcare', 'EdTech', 'Security', 'E-commerce']

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <main>
      <Navbar />

      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
              Project Showcase
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover amazing projects created by our community. Vote for your favorites!
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects by title, team, or technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Category Filter and View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-card text-foreground hover:border-primary/50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Display */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredProjects.length} of {mockProjects.length} projects
              </p>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} {...project} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProjects.map((project) => (
                    <a key={project.id} href={`/projects/${project.id}`}>
                      <div className="group rounded-xl border border-border hover:border-primary/50 bg-card hover:shadow-lg transition-all duration-300 p-6 cursor-pointer">
                        <div className="flex gap-6">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-32 h-32 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                                {project.title}
                              </h3>
                              {project.featured && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-foreground">Team: {project.team}</span>
                              <span className="text-sm font-semibold text-accent">⭐ {project.stars}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-foreground mb-2">No projects found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
