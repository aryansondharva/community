import Link from 'next/link'
import { Calendar, Users, Trophy } from 'lucide-react'

export interface EventCardProps {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  prizePool: string
  participants: number
  image: string
  status: 'upcoming' | 'ongoing' | 'closed'
}

export function EventCard({
  id,
  title,
  description,
  startDate,
  endDate,
  prizePool,
  participants,
  image,
  status,
}: EventCardProps) {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    ongoing: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  }

  return (
    <Link href={`/events/${id}`}>
      <div className="group h-full rounded-xl overflow-hidden border border-border hover:border-primary/50 bg-card hover:shadow-lg transition-all duration-300 cursor-pointer">
        {/* Image */}
        <div className="relative h-40 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[status]}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-lg text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{startDate} - {endDate}</span>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{prizePool}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{participants} teams</span>
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 mt-4">
            View Event
          </button>
        </div>
      </div>
    </Link>
  )
}
