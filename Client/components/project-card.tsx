import Link from 'next/link'
import { Star, Code, Award } from 'lucide-react'

export interface ProjectCardProps {
  id: string
  title: string
  description: string
  team: string
  category: string
  image: string
  stars: number
  tags: string[]
  featured?: boolean
  awards?: string[]
}

export function ProjectCard({
  id,
  title,
  description,
  team,
  category,
  image,
  stars,
  tags,
  featured = false,
  awards,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <div className={`group h-full rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer ${
        featured
          ? 'border-primary/50 bg-card hover:shadow-xl hover:border-primary'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-lg'
      }`}>
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-green-600/20 to-emerald-600/20 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {featured && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Category Badge */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-accent/10 text-accent dark:bg-accent/20">
              {category}
            </span>
            {awards && awards.length > 0 && (
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-accent">{awards[0]}</span>
              </div>
            )}
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-bold text-lg text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>

          {/* Team and Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">{team}</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="font-semibold text-foreground">{stars}</span>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 rounded text-xs font-medium text-muted-foreground">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* CTA Button */}
          <button className="w-full py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 mt-4">
            View Project
          </button>
        </div>
      </div>
    </Link>
  )
}
