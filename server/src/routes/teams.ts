import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Mock team data - TODO: Replace with actual Team model
const mockTeams = [
  {
    _id: '1',
    name: 'Code Warriors',
    description: 'A team of passionate developers focused on building innovative solutions',
    avatar: 'https://example.com/codewarriors.jpg',
    members: [
      { userId: 'user1', fullName: 'John Doe', role: 'leader', avatar: 'https://example.com/john.jpg' },
      { userId: 'user2', fullName: 'Jane Smith', role: 'developer', avatar: 'https://example.com/jane.jpg' },
      { userId: 'user3', fullName: 'Bob Johnson', role: 'designer', avatar: 'https://example.com/bob.jpg' }
    ],
    leader: 'user1',
    maxMembers: 5,
    currentMembers: 3,
    skills: ['React', 'Node.js', 'UI/UX Design', 'MongoDB'],
    lookingFor: ['Backend Developer', 'DevOps Engineer'],
    status: 'active',
    projects: ['proj1', 'proj2'],
    events: ['event1'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    name: 'AI Innovators',
    description: 'Specializing in artificial intelligence and machine learning projects',
    avatar: 'https://example.com/aiinnovators.jpg',
    members: [
      { userId: 'user4', fullName: 'Alice Wilson', role: 'leader', avatar: 'https://example.com/alice.jpg' },
      { userId: 'user5', fullName: 'Charlie Brown', role: 'ml-engineer', avatar: 'https://example.com/charlie.jpg' }
    ],
    leader: 'user4',
    maxMembers: 4,
    currentMembers: 2,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
    lookingFor: ['Data Scientist', 'Frontend Developer'],
    status: 'recruiting',
    projects: ['proj3'],
    events: ['event2'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20')
  }
];

// Get all teams
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, skills, lookingFor, search } = req.query;
  
  let filteredTeams = [...mockTeams];

  // Apply filters
  if (status && typeof status === 'string') {
    filteredTeams = filteredTeams.filter(t => t.status === status);
  }

  if (skills && typeof skills === 'string') {
    const skillArray = skills.split(',');
    filteredTeams = filteredTeams.filter(t => 
      t.skills.some(skill => skillArray.includes(skill))
    );
  }

  if (lookingFor && typeof lookingFor === 'string') {
    const roleArray = lookingFor.split(',');
    filteredTeams = filteredTeams.filter(t => 
      t.lookingFor.some(role => roleArray.includes(role))
    );
  }

  if (search && typeof search === 'string') {
    const searchTerm = search.toLowerCase();
    filteredTeams = filteredTeams.filter(t => 
      t.name.toLowerCase().includes(searchTerm) ||
      t.description.toLowerCase().includes(searchTerm) ||
      t.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
  }

  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedTeams = filteredTeams.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      teams: paginatedTeams,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredTeams.length,
        pages: Math.ceil(filteredTeams.length / limitNum),
        hasMore: endIndex < filteredTeams.length
      }
    }
  });
}));

// Get team by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const team = mockTeams.find(t => t._id === id);
  
  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  res.json({
    success: true,
    data: { team }
  });
}));

// Create new team
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const teamData = req.body;
  
  // TODO: Validate team data
  // TODO: Save to database when Team model is created
  
  const newTeam = {
    _id: Date.now().toString(),
    ...teamData,
    leader: req.user?._id,
    members: [
      {
        userId: req.user?._id,
        fullName: req.user?.fullName,
        role: 'leader',
        avatar: req.user?.avatar
      }
    ],
    currentMembers: 1,
    status: 'active',
    projects: [],
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  res.status(201).json({
    success: true,
    message: 'Team created successfully',
    data: { team: newTeam }
  });
}));

// Update team
router.patch('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const teamIndex = mockTeams.findIndex(t => t._id === id);
  
  if (teamIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // TODO: Check if user is leader or has permission
  // TODO: Update in database when Team model is created
  
  const updatedTeam = {
    ...mockTeams[teamIndex],
    ...updates,
    updatedAt: new Date()
  };

  mockTeams[teamIndex] = updatedTeam;

  res.json({
    success: true,
    message: 'Team updated successfully',
    data: { team: updatedTeam }
  });
}));

// Delete team
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const teamIndex = mockTeams.findIndex(t => t._id === id);
  
  if (teamIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // TODO: Check if user is leader
  // TODO: Delete from database when Team model is created
  
  mockTeams.splice(teamIndex, 1);

  res.json({
    success: true,
    message: 'Team deleted successfully'
  });
}));

// Join team
router.post('/:id/join', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role, message } = req.body;
  
  const team = mockTeams.find(t => t._id === id);
  
  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if team is full
  if (team.currentMembers >= team.maxMembers) {
    return res.status(400).json({
      success: false,
      message: 'Team is full'
    });
  }

  // Check if user is already a member
  if (team.members.some(member => member.userId === req.user?._id)) {
    return res.status(400).json({
      success: false,
      message: 'You are already a member of this team'
    });
  }

  // TODO: Add join request to database when Team model is created
  // TODO: Send notification to team leader
  
  res.json({
    success: true,
    message: 'Join request sent successfully',
    data: {
      teamId: id,
      userId: req.user?._id,
      role: role || 'member',
      message,
      requestDate: new Date()
    }
  });
}));

// Leave team
router.post('/:id/leave', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const team = mockTeams.find(t => t._id === id);
  
  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is a member
  const memberIndex = team.members.findIndex(member => member.userId === req.user?._id);
  
  if (memberIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'You are not a member of this team'
    });
  }

  // TODO: Check if user is leader and assign new leader
  // TODO: Remove from team in database when Team model is created
  
  team.members.splice(memberIndex, 1);
  team.currentMembers -= 1;

  res.json({
    success: true,
    message: 'Left team successfully',
    data: { team }
  });
}));

// Remove member from team (leader only)
router.delete('/:id/members/:userId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, userId } = req.params;
  
  const team = mockTeams.find(t => t._id === id);
  
  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // TODO: Check if user is team leader
  // TODO: Remove member from team in database when Team model is created
  
  const memberIndex = team.members.findIndex(member => member.userId === userId);
  
  if (memberIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Member not found'
    });
  }

  team.members.splice(memberIndex, 1);
  team.currentMembers -= 1;

  res.json({
    success: true,
    message: 'Member removed successfully',
    data: { team }
  });
}));

// Get team join requests
router.get('/:id/requests', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const team = mockTeams.find(t => t._id === id);
  
  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // TODO: Check if user is team leader
  // TODO: Get actual requests from database when Team model is created
  
  const mockRequests = [
    {
      id: 'req1',
      userId: 'user6',
      fullName: 'David Lee',
      avatar: 'https://example.com/david.jpg',
      role: 'developer',
      message: 'I would love to join your team! I have experience with React and Node.js.',
      requestDate: new Date('2024-01-18'),
      status: 'pending'
    }
  ];

  res.json({
    success: true,
    data: { requests: mockRequests }
  });
}));

// Accept/decline join request
router.patch('/:id/requests/:requestId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id, requestId } = req.params;
  const { action } = req.body; // 'accept' or 'decline'
  
  const team = mockTeams.find(t => t._id === id);
  
  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // TODO: Check if user is team leader
  // TODO: Update request status in database when Team model is created
  // TODO: Add member to team if accepted
  
  if (action === 'accept') {
    // Mock adding member
    const newMember = {
      userId: 'user6',
      fullName: 'David Lee',
      role: 'developer',
      avatar: 'https://example.com/david.jpg'
    };
    team.members.push(newMember);
    team.currentMembers += 1;
  }

  res.json({
    success: true,
    message: `Join request ${action}ed successfully`,
    data: { team }
  });
}));

export { router as teamRoutes };
