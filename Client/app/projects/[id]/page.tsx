'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Star, Github, ExternalLink, Award, Users, Code, Heart } from 'lucide-react'
import { useState } from 'react'

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(245)

  // Mock project data - in Phase 2 this will come from API
  const project = {
    id: params.id,
    title: 'EcoTrack - Carbon Footprint Monitor',
    description: 'Real-time carbon footprint tracking for individuals and companies with AI-powered insights.',
    longDescription: `EcoTrack is a revolutionary platform designed to help individuals and organizations track, understand, and reduce their carbon footprint. Using advanced machine learning algorithms and real-time data integration, EcoTrack provides comprehensive insights into your environmental impact.

Key Features:
- Real-time carbon footprint calculation
- AI-powered recommendations for emissions reduction
- Industry benchmarking and comparative analysis
- Customizable reports and dashboards
- Integration with popular apps and services
- Gamification features to encourage sustainable behavior

Our mission is to make environmental sustainability accessible and actionable for everyone. By combining cutting-edge technology with environmental science, we're helping create a more sustainable future.`,
    team: {
      name: 'CodeCrusaders',
      members: 3,
      avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop',
    },
    category: 'Sustainability',
    image: 'https://images.unsplash.com/photo-1559618666-4b6d7f2b6f4f?w=1200&h=400&fit=crop',
    stars: 245,
    tags: ['React', 'Node.js', 'AI', 'MongoDB', 'TensorFlow', 'Docker'],
    featured: true,
    awards: [
      { name: 'Best Innovation', icon: Award },
      { name: 'Audience Choice', icon: Heart },
    ],
    hackathon: 'OpenSource Global Hackathon 2024',
    date: 'March 20-22, 2024',
    links: {
      github: 'https://github.com/codecrusaders/ecotrack',
      demo: 'https://ecotrack-demo.vercel.app',
      website: 'https://ecotrack.dev',
    },
    screenshots: [
      'https://images.unsplash.com/photo-1559618666-4b6d7f2b6f4f?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    ],
    stats: {
      downloads: '12.5K',
      contributors: 8,
      forks: 234,
      issues: 15,
    },
    techDetails: {
      frontend: 'React 18 + TypeScript',
      backend: 'Node.js + Express',
      database: 'MongoDB + PostgreSQL',
      ml: 'TensorFlow.js + Python',
      deployment: 'Docker + Kubernetes on AWS',
    },
    comments: [
      {
        author: 'John Developer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
        comment: 'Amazing project! The UI is beautiful and the AI insights are incredibly useful.',
        likes: 24,
      },
      {
        author: 'Sarah Designer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
        comment: 'Great user experience. Would love to see mobile app support!',
        likes: 18,
      },
    ],
  }

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setIsLiked(!isLiked)
  }

  return (
    <main>
      <Navbar />

      {/* Hero Image */}
      <section className="h-96 overflow-hidden relative">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="inline-block mb-4">
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                      {project.category}
                    </span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                    {project.title}
                  </h1>
                </div>
                {project.featured && (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-accent/10 text-accent whitespace-nowrap">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                {project.description}
              </p>

              {/* Team Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
                <img
                  src={project.team.avatar}
                  alt={project.team.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Created by</p>
                  <p className="font-bold text-foreground">{project.team.name}</p>
                </div>
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3">
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground font-semibold hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
              >
                <Github className="w-5 h-5" />
                GitHub Repository
              </a>
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200"
              >
                <ExternalLink className="w-5 h-5" />
                Live Demo
              </a>
              <a
                href={project.links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground font-semibold hover:border-primary/50 transition-all duration-200"
              >
                <ExternalLink className="w-5 h-5" />
                Website
              </a>
            </div>

            {/* Awards */}
            {project.awards.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-bold text-foreground mb-4">Awards & Recognition</h3>
                <div className="space-y-3">
                  {project.awards.map((award) => {
                    const Icon = award.icon
                    return (
                      <div key={award.name} className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                        <Icon className="w-5 h-5 text-accent" />
                        <span className="font-semibold text-foreground">{award.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">About This Project</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.longDescription}
              </p>
            </div>

            {/* Screenshots */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.screenshots.map((screenshot, idx) => (
                  <img
                    key={idx}
                    src={screenshot}
                    alt={`Screenshot ${idx + 1}`}
                    className="rounded-lg border border-border object-cover hover:scale-105 transition-transform duration-300 cursor-pointer h-64"
                  />
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Technologies Used</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(project.techDetails).map(([key, value]) => (
                  <div key={key} className="p-4 rounded-lg border border-border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </p>
                    <p className="font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Tags</h2>
              <div className="flex flex-wrap gap-3">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Community Feedback</h2>
              <div className="space-y-4">
                {project.comments.map((comment, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex gap-3 mb-3">
                      <img
                        src={comment.avatar}
                        alt={comment.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{comment.author}</p>
                        <p className="text-xs text-muted-foreground">Community Member</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{comment.comment}</p>
                    <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      👍 {comment.likes} likes
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Interaction Card */}
            <div className="rounded-xl border border-border bg-card p-6 sticky top-20">
              <button
                onClick={handleLike}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 mb-3 ${
                  isLiked
                    ? 'bg-accent/20 text-accent'
                    : 'bg-accent/10 text-accent hover:bg-accent/20'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount} Likes
              </button>

              {/* Stats */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Stars</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    <span className="text-2xl font-bold text-foreground">{project.stars}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Downloads</p>
                  <p className="text-2xl font-bold text-foreground">{project.stats.downloads}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">GitHub Stats</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Forks</span>
                      <span className="font-semibold text-foreground">{project.stats.forks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Contributors</span>
                      <span className="font-semibold text-foreground">{project.stats.contributors}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Issues</span>
                      <span className="font-semibold text-foreground">{project.stats.issues}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Info Card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-bold text-foreground mb-4">Project Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Hackathon</p>
                  <p className="font-semibold text-foreground">{project.hackathon}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Date</p>
                  <p className="font-semibold text-foreground">{project.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Team Size</p>
                  <p className="font-semibold text-foreground">{project.team.members} members</p>
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
