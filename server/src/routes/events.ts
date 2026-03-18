import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Mock event data - TODO: Replace with actual Event model
const mockEvents = [
  {
    _id: '1',
    title: 'Global Hackathon 2024',
    description: 'Join developers from around the world for 48 hours of innovation and creativity',
    startDate: new Date('2024-03-15T09:00:00Z'),
    endDate: new Date('2024-03-17T18:00:00Z'),
    location: 'Virtual',
    maxParticipants: 500,
    currentParticipants: 342,
    status: 'upcoming',
    prizes: [
      { position: 1, amount: '$10,000', description: 'First Prize' },
      { position: 2, amount: '$5,000', description: 'Second Prize' },
      { position: 3, amount: '$2,000', description: 'Third Prize' }
    ],
    sponsors: ['TechCorp', 'InnovateLab', 'CloudSystems'],
    tags: ['hackathon', 'innovation', 'global', '48hours'],
    imageUrl: 'https://example.com/hackathon2024.jpg',
    organizer: 'TechEvents Inc',
    website: 'https://globalhackathon2024.com',
    registrationDeadline: new Date('2024-03-10T23:59:59Z'),
    requirements: ['Experience with web development', 'Team of 2-4 members', 'English proficiency'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    title: 'AI & Machine Learning Summit',
    description: 'A week-long event focused on artificial intelligence and machine learning projects',
    startDate: new Date('2024-04-01T10:00:00Z'),
    endDate: new Date('2024-04-07T18:00:00Z'),
    location: 'San Francisco, CA',
    maxParticipants: 200,
    currentParticipants: 156,
    status: 'registration-open',
    prizes: [
      { position: 1, amount: '$15,000', description: 'Grand Prize' },
      { position: 2, amount: '$7,500', description: 'Runner-up' }
    ],
    sponsors: ['AI Corp', 'DataTech', 'NeuralNet'],
    tags: ['AI', 'Machine Learning', 'Summit', 'San Francisco'],
    imageUrl: 'https://example.com/ai-summit.jpg',
    organizer: 'AI Institute',
    website: 'https://aimlsummit2024.com',
    registrationDeadline: new Date('2024-03-25T23:59:59Z'),
    requirements: ['Background in AI/ML', 'Portfolio of ML projects', 'Research experience'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20')
  }
];

// Get all events
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, location, tags, search } = req.query;
  
  let filteredEvents = [...mockEvents];

  // Apply filters
  if (status && typeof status === 'string') {
    filteredEvents = filteredEvents.filter(e => e.status === status);
  }

  if (location && typeof location === 'string') {
    const searchTerm = location.toLowerCase();
    filteredEvents = filteredEvents.filter(e => 
      e.location.toLowerCase().includes(searchTerm)
    );
  }

  if (tags && typeof tags === 'string') {
    const tagArray = tags.split(',');
    filteredEvents = filteredEvents.filter(e => 
      e.tags.some(tag => tagArray.includes(tag))
    );
  }

  if (search && typeof search === 'string') {
    const searchTerm = search.toLowerCase();
    filteredEvents = filteredEvents.filter(e => 
      e.title.toLowerCase().includes(searchTerm) ||
      e.description.toLowerCase().includes(searchTerm) ||
      e.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Sort by start date (upcoming events first)
  filteredEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      events: paginatedEvents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredEvents.length,
        pages: Math.ceil(filteredEvents.length / limitNum),
        hasMore: endIndex < filteredEvents.length
      }
    }
  });
}));

// Get event by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const event = mockEvents.find(e => e._id === id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  res.json({
    success: true,
    data: { event }
  });
}));

// Register for event
router.post('/:id/register', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { teamMembers, projectIdea } = req.body;
  
  const event = mockEvents.find(e => e._id === id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if registration is still open
  if (new Date() > new Date(event.registrationDeadline)) {
    return res.status(400).json({
      success: false,
      message: 'Registration deadline has passed'
    });
  }

  // Check if event is full
  if (event.currentParticipants >= event.maxParticipants) {
    return res.status(400).json({
      success: false,
      message: 'Event is fully booked'
    });
  }

  // TODO: Check if user is already registered
  // TODO: Save registration to database when Registration model is created
  // TODO: Send confirmation email

  event.currentParticipants += 1;

  res.json({
    success: true,
    message: 'Successfully registered for event',
    data: {
      eventId: id,
      userId: req.user?._id,
      registrationDate: new Date(),
      teamMembers,
      projectIdea
    }
  });
}));

// Cancel event registration
router.delete('/:id/register', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const event = mockEvents.find(e => e._id === id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // TODO: Check if registration deadline has passed
  // TODO: Remove registration from database when Registration model is created
  // TODO: Send cancellation email

  event.currentParticipants = Math.max(0, event.currentParticipants - 1);

  res.json({
    success: true,
    message: 'Registration cancelled successfully'
  });
}));

// Get event participants
router.get('/:id/participants', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const event = mockEvents.find(e => e._id === id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // TODO: Get actual participants from database when Registration model is created
  // For now, return mock data
  const mockParticipants = [
    {
      userId: 'user1',
      fullName: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/john.jpg',
      teamMembers: ['Jane Smith', 'Bob Johnson'],
      projectIdea: 'AI-powered task manager',
      registrationDate: new Date('2024-01-10')
    },
    {
      userId: 'user2',
      fullName: 'Alice Wilson',
      email: 'alice@example.com',
      avatar: 'https://example.com/alice.jpg',
      teamMembers: ['Charlie Brown'],
      projectIdea: 'Blockchain voting system',
      registrationDate: new Date('2024-01-12')
    }
  ];

  res.json({
    success: true,
    data: {
      participants: mockParticipants,
      total: event.currentParticipants
    }
  });
}));

// Create new event (admin only)
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Check if user has admin permissions
  const eventData = req.body;
  
  // TODO: Validate event data
  // TODO: Save to database when Event model is created
  
  const newEvent = {
    _id: Date.now().toString(),
    ...eventData,
    currentParticipants: 0,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: { event: newEvent }
  });
}));

// Update event (admin only)
router.patch('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const eventIndex = mockEvents.findIndex(e => e._id === id);
  
  if (eventIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // TODO: Check if user has admin permissions
  // TODO: Update in database when Event model is created
  
  const updatedEvent = {
    ...mockEvents[eventIndex],
    ...updates,
    updatedAt: new Date()
  };

  mockEvents[eventIndex] = updatedEvent;

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: { event: updatedEvent }
  });
}));

// Delete event (admin only)
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const eventIndex = mockEvents.findIndex(e => e._id === id);
  
  if (eventIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // TODO: Check if user has admin permissions
  // TODO: Delete from database when Event model is created
  
  mockEvents.splice(eventIndex, 1);

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
}));

export { router as eventRoutes };
