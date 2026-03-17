import Link from 'next/link'
import { Users, Code } from 'lucide-react'

export interface TeamCardProps {
  id: string
  name: string
  description: string
  memberCount: number
  maxMembers: number
  lookingFor: string[]
  techStack: string[]
  image: string
}

export function TeamCard({
  id,
  name,
  description,
  memberCount,
  maxMembers,
  lookingFor,
  techStack,
  image,
}: TeamCardProps) {
  return (
    <Link href={`/teams/${id}`}>
      <div className="group h-full rounded-xl overflow-hidden border border-border hover:border-primary/50 bg-card hover:shadow-lg transition-all duration-300 cursor-pointer">
        {/* Header with Avatar */}
        <div className="relative h-24 bg-gradient-to-br from-purple-600/30 to-indigo-600/30">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-lg text-card-foreground mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">
              {memberCount} / {maxMembers} members
            </span>
          </div>

          {/* Looking For */}
          {lookingFor.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Looking for</p>
              <div className="flex flex-wrap gap-2">
                {lookingFor.slice(0, 2).map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20"
                  >
                    {role}
                  </span>
                ))}
                {lookingFor.length > 2 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    +{lookingFor.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          {techStack.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <Code className="w-3 h-3" />
                Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 rounded text-xs font-medium bg-secondary/10 text-secondary dark:bg-secondary/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 mt-4">
            View Team
          </button>
        </div>
      </div>
    </Link>
  )
}
