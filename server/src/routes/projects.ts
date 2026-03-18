import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Mock project data - TODO: Replace with actual Project model
const mockProjects = [
  {
    _id: '1',
    title: 'AI Chatbot',
    description: 'An intelligent chatbot powered by machine learning',
    techStack: ['React', 'Node.js', 'Python', 'TensorFlow'],
    team: ['user1', 'user2', 'user3'],
    owner: 'user1',
    status: 'in-progress',
    githubUrl: 'https://github.com/example/ai-chatbot',
    demoUrl: 'https://ai-chatbot-demo.com',
    images: ['https://example.com/chatbot1.png', 'https://example.com/chatbot2.png'],
    tags: ['AI', 'Machine Learning', 'Chatbot', 'React'],
    likes: 42,
    views: 256,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    _id: '2',
    title: 'E-commerce Platform',
    description: 'A full-stack e-commerce solution with payment integration',
    techStack: ['Vue.js', 'Express', 'MongoDB', 'Stripe'],
    team: ['user2', 'user4'],
    owner: 'user2',
    status: 'completed',
    githubUrl: 'https://github.com/example/ecommerce',
    demoUrl: 'https://ecommerce-demo.com',
    images: ['https://example.com/ecommerce1.png'],
    tags: ['E-commerce', 'Vue.js', 'MongoDB', 'Stripe'],
    likes: 38,
    views: 189,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  }
];

// Get all projects
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, techStack, tags, search } = req.query;
  
  let filteredProjects = [...mockProjects];

  // Apply filters
  if (status && typeof status === 'string') {
    filteredProjects = filteredProjects.filter(p => p.status === status);
  }

  if (techStack && typeof techStack === 'string') {
    const techArray = techStack.split(',');
    filteredProjects = filteredProjects.filter(p => 
      p.techStack.some(tech => techArray.includes(tech))
    );
  }

  if (tags && typeof tags === 'string') {
    const tagArray = tags.split(',');
    filteredProjects = filteredProjects.filter(p => 
      p.tags.some(tag => tagArray.includes(tag))
    );
  }

  if (search && typeof search === 'string') {
    const searchTerm = search.toLowerCase();
    filteredProjects = filteredProjects.filter(p => 
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      projects: paginatedProjects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredProjects.length,
        pages: Math.ceil(filteredProjects.length / limitNum),
        hasMore: endIndex < filteredProjects.length
      }
    }
  });
}));

// Get project by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const project = mockProjects.find(p => p._id === id);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Increment views
  project.views += 1;

  res.json({
    success: true,
    data: { project }
  });
}));

// Create new project
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const projectData = req.body;
  
  // TODO: Validate project data
  // TODO: Save to database when Project model is created
  
  const newProject = {
    _id: Date.now().toString(),
    ...projectData,
    owner: req.user?._id,
    team: [req.user?._id],
    status: 'planning',
    likes: 0,
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: { project: newProject }
  });
}));

// Update project
router.patch('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const projectIndex = mockProjects.findIndex(p => p._id === id);
  
  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // TODO: Check if user is owner or team member
  // TODO: Update in database when Project model is created
  
  const updatedProject = {
    ...mockProjects[projectIndex],
    ...updates,
    updatedAt: new Date()
  };

  mockProjects[projectIndex] = updatedProject;

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: { project: updatedProject }
  });
}));

// Delete project
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const projectIndex = mockProjects.findIndex(p => p._id === id);
  
  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // TODO: Check if user is owner
  // TODO: Delete from database when Project model is created
  
  mockProjects.splice(projectIndex, 1);

  res.json({
    success: true,
    message: 'Project deleted successfully'
  });
}));

// Like/unlike project
router.post('/:id/like', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const project = mockProjects.find(p => p._id === id);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // TODO: Check if user already liked and toggle
  // TODO: Save to database when Project model is created
  
  project.likes += 1;

  res.json({
    success: true,
    message: 'Project liked successfully',
    data: { likes: project.likes }
  });
}));

// Join project team
router.post('/:id/join', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const project = mockProjects.find(p => p._id === id);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // TODO: Check if user is already in team
  // TODO: Add to team in database when Project model is created
  
  if (!project.team.includes(req.user?._id)) {
    project.team.push(req.user?._id);
  }

  res.json({
    success: true,
    message: 'Joined project team successfully',
    data: { team: project.team }
  });
}));

// Leave project team
router.post('/:id/leave', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  const project = mockProjects.find(p => p._id === id);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // TODO: Remove from team in database when Project model is created
  
  project.team = project.team.filter(userId => userId !== req.user?._id);

  res.json({
    success: true,
    message: 'Left project team successfully',
    data: { team: project.team }
  });
}));

export { router as projectRoutes };
