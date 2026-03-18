import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Global search across users, projects, events, and teams
router.get('/', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q, type, page = 1, limit = 10 } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const searchQuery = q.trim();
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  let results: any = {
    users: [],
    projects: [],
    events: [],
    teams: [],
    total: 0
  };

  // Search users
  if (!type || type === 'users') {
    const userQuery = {
      $and: [
        { isActive: true },
        {
          $or: [
            { fullName: { $regex: searchQuery, $options: 'i' } },
            { bio: { $regex: searchQuery, $options: 'i' } },
            { skills: { $in: [new RegExp(searchQuery, 'i')] } },
            { email: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      ]
    };

    const users = await User.find(userQuery)
      .select('fullName email avatar bio skills role githubUsername')
      .limit(limitNum)
      .skip(skip)
      .sort({ fullName: 1 });

    results.users = users;
    results.total += await User.countDocuments(userQuery);
  }

  // TODO: Add search for projects, events, and teams when those models are created
  // For now, we'll return empty arrays for those

  res.json({
    success: true,
    data: {
      query: searchQuery,
      type: type || 'all',
      page: pageNum,
      limit: limitNum,
      results,
      hasMore: results.total > pageNum * limitNum
    }
  });
}));

// Search users specifically
router.get('/users', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { q, role, skills, page = 1, limit = 10 } = req.query;
  
  const searchQuery: any = { isActive: true };

  // Text search
  if (q && typeof q === 'string') {
    const searchTerm = q.trim();
    searchQuery.$or = [
      { fullName: { $regex: searchTerm, $options: 'i' } },
      { bio: { $regex: searchTerm, $options: 'i' } },
      { skills: { $in: [new RegExp(searchTerm, 'i')] } }
    ];
  }

  // Filter by role
  if (role && typeof role === 'string') {
    searchQuery.role = role;
  }

  // Filter by skills
  if (skills && typeof skills === 'string') {
    const skillsArray = skills.split(',').map(skill => skill.trim());
    searchQuery.skills = { $in: skillsArray };
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(searchQuery)
    .select('fullName email avatar bio skills role githubUsername linkedinUrl portfolioUrl createdAt')
    .limit(limitNum)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(searchQuery);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasMore: total > pageNum * limitNum
      },
      filters: {
        query: q,
        role,
        skills
      }
    }
  });
}));

// Get search suggestions/autocomplete
router.get('/suggestions', asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string' || q.length < 2) {
    return res.json({
      success: true,
      data: { suggestions: [] }
    });
  }

  const searchTerm = q.trim();
  const limit = 5;

  // Get user name suggestions
  const users = await User.find({
    isActive: true,
    fullName: { $regex: `^${searchTerm}`, $options: 'i' }
  })
  .select('fullName avatar role')
  .limit(limit);

  // Get skill suggestions
  const skillPipeline = [
    { $match: { isActive: true } },
    { $unwind: '$skills' },
    { $match: { skills: { $regex: searchTerm, $options: 'i' } } },
    { $group: { _id: '$skills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit }
  ];

  const skills = await User.aggregate(skillPipeline);

  const suggestions = [
    ...users.map(user => ({
      type: 'user',
      text: user.fullName,
      subtitle: user.role,
      avatar: user.avatar,
      id: user._id
    })),
    ...skills.map(skill => ({
      type: 'skill',
      text: skill._id,
      subtitle: `${skill.count} user${skill.count > 1 ? 's' : ''}`,
      count: skill.count
    }))
  ];

  res.json({
    success: true,
    data: { suggestions }
  });
}));

// Advanced search with filters
router.post('/advanced', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    query,
    filters = {},
    page = 1,
    limit = 10,
    sort = { field: 'createdAt', order: 'desc' }
  } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const searchQuery: any = { isActive: true };

  // Text search
  searchQuery.$or = [
    { fullName: { $regex: query, $options: 'i' } },
    { bio: { $regex: query, $options: 'i' } },
    { skills: { $in: [new RegExp(query, 'i')] } }
  ];

  // Apply filters
  if (filters.role) {
    searchQuery.role = filters.role;
  }

  if (filters.skills && Array.isArray(filters.skills)) {
    searchQuery.skills = { $in: filters.skills };
  }

  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    searchQuery.createdAt = {};
    if (start) searchQuery.createdAt.$gte = new Date(start);
    if (end) searchQuery.createdAt.$lte = new Date(end);
  }

  // Sorting
  const sortOptions: any = {};
  sortOptions[sort.field] = sort.order === 'asc' ? 1 : -1;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(searchQuery)
    .select('fullName email avatar bio skills role githubUsername linkedinUrl portfolioUrl createdAt')
    .limit(limitNum)
    .skip(skip)
    .sort(sortOptions);

  const total = await User.countDocuments(searchQuery);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasMore: total > pageNum * limitNum
      },
      filters: {
        query,
        ...filters
      },
      sort
    }
  });
}));

// Get popular search terms/keywords
router.get('/trending', asyncHandler(async (req: Request, res: Response) => {
  // This would typically be implemented with a search analytics system
  // For now, we'll return some mock trending skills
  const trendingSkills = [
    { skill: 'React', count: 156 },
    { skill: 'Node.js', count: 142 },
    { skill: 'TypeScript', count: 128 },
    { skill: 'Python', count: 115 },
    { skill: 'Machine Learning', count: 98 }
  ];

  res.json({
    success: true,
    data: { trending: trendingSkills }
  });
}));

export { router as searchRoutes };
