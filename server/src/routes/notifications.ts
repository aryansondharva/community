import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendEmail } from '../utils/emailService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Get user notifications
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, type, read } = req.query;
  
  // TODO: Implement Notification model when created
  // For now, return mock data
  const notifications = [
    {
      id: '1',
      type: 'project_invite',
      title: 'Project Invitation',
      message: 'John Doe invited you to join "AI Chatbot" project',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      data: {
        projectId: 'proj123',
        inviterName: 'John Doe',
        projectName: 'AI Chatbot'
      }
    },
    {
      id: '2',
      type: 'team_request',
      title: 'Team Join Request',
      message: 'Jane Smith wants to join your team "Code Warriors"',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      data: {
        teamId: 'team456',
        requesterName: 'Jane Smith',
        teamName: 'Code Warriors'
      }
    },
    {
      id: '3',
      type: 'event_reminder',
      title: 'Event Reminder',
      message: 'Hackathon 2024 starts in 2 days!',
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      data: {
        eventId: 'event789',
        eventName: 'Hackathon 2024',
        eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      }
    }
  ];

  // Apply filters
  let filteredNotifications = notifications;
  
  if (type && typeof type === 'string') {
    filteredNotifications = filteredNotifications.filter(n => n.type === type);
  }
  
  if (read !== undefined) {
    const isRead = read === 'true';
    filteredNotifications = filteredNotifications.filter(n => n.read === isRead);
  }

  // Pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      notifications: paginatedNotifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredNotifications.length,
        pages: Math.ceil(filteredNotifications.length / limitNum),
        hasMore: endIndex < filteredNotifications.length
      },
      unreadCount: notifications.filter(n => !n.read).length
    }
  });
}));

// Mark notification as read
router.patch('/:id/read', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  // TODO: Update notification in database when model is created
  // For now, just return success
  
  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { id }
  });
}));

// Mark all notifications as read
router.patch('/read-all', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Update all notifications in database when model is created
  // For now, just return success
  
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

// Delete notification
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  // TODO: Delete notification from database when model is created
  // For now, just return success
  
  res.json({
    success: true,
    message: 'Notification deleted successfully',
    data: { id }
  });
}));

// Send notification to user (admin/protected route)
router.post('/send', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId, type, title, message, data, sendEmail: sendEmailFlag } = req.body;
  
  // TODO: Check if user has admin permissions
  // TODO: Create notification in database when model is created
  
  // Send email notification if requested
  if (sendEmailFlag) {
    try {
      // TODO: Get user email from database
      const userEmail = 'user@example.com'; // Mock
      
      await sendEmail({
        to: userEmail,
        subject: title,
        template: 'notification',
        data: {
          fullName: 'User Name', // Get from user data
          title,
          message,
          data
        }
      });
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
    }
  }
  
  res.json({
    success: true,
    message: 'Notification sent successfully',
    data: {
      id: Date.now().toString(),
      userId,
      type,
      title,
      message,
      data,
      createdAt: new Date()
    }
  });
}));

// Get notification preferences
router.get('/preferences', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  // TODO: Get user preferences from database when model is created
  // For now, return default preferences
  
  const preferences = {
    email: {
      project_invites: true,
      team_requests: true,
      event_reminders: true,
      announcements: false,
      weekly_digest: true
    },
    push: {
      project_invites: true,
      team_requests: true,
      event_reminders: true,
      announcements: true,
      messages: true
    },
    in_app: {
      project_invites: true,
      team_requests: true,
      event_reminders: true,
      announcements: true,
      messages: true,
      system_updates: true
    }
  };
  
  res.json({
    success: true,
    data: { preferences }
  });
}));

// Update notification preferences
router.patch('/preferences', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { preferences } = req.body;
  
  // TODO: Update user preferences in database when model is created
  
  res.json({
    success: true,
    message: 'Notification preferences updated successfully',
    data: { preferences }
  });
}));

// Subscribe to newsletter
router.post('/subscribe-newsletter', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  
  // TODO: Add email to newsletter list
  // TODO: Send confirmation email
  
  res.json({
    success: true,
    message: 'Successfully subscribed to newsletter'
  });
}));

// Unsubscribe from newsletter
router.post('/unsubscribe-newsletter', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  // TODO: Remove email from newsletter list
  
  res.json({
    success: true,
    message: 'Successfully unsubscribed from newsletter'
  });
}));

export { router as notificationRoutes };
