import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticate, AuthRequest, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendEmail } from '../utils/emailService';

const router = Router();

// Get user profile
router.get('/profile', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id)
    .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// Update user profile
router.patch('/profile', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const allowedUpdates = ['fullName', 'bio', 'skills', 'githubUsername', 'linkedinUrl', 'portfolioUrl'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({
      success: false,
      message: 'Invalid updates',
      allowedFields: allowedUpdates
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
}));

// Get user by ID (public profile)
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('fullName avatar bio skills role githubUsername linkedinUrl portfolioUrl createdAt');

  if (!user || !user.isActive) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// Update avatar
router.patch('/avatar', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { avatar } = req.body;

  if (!avatar) {
    return res.status(400).json({
      success: false,
      message: 'Avatar URL is required'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { avatar },
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

  res.json({
    success: true,
    message: 'Avatar updated successfully',
    data: { user }
  });
}));

// Change password
router.patch('/change-password', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters long'
    });
  }

  // Get user with password
  const user = await User.findById(req.user?._id).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Send password change notification email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Changed - HackHub',
      template: 'password-change-confirmation',
      data: {
        fullName: user.fullName,
        changeDate: new Date().toLocaleDateString()
      }
    });
  } catch (emailError) {
    console.error('Failed to send password change email:', emailError);
  }

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// Delete account
router.delete('/account', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { password, confirmation } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required to delete account'
    });
  }

  if (confirmation !== 'DELETE') {
    return res.status(400).json({
      success: false,
      message: 'Please type "DELETE" to confirm account deletion'
    });
  }

  // Get user with password
  const user = await User.findById(req.user?._id).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid password'
    });
  }

  // Soft delete (deactivate) account
  await User.findByIdAndUpdate(req.user?._id, { isActive: false });

  // Send account deletion confirmation email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Account Deleted - HackHub',
      template: 'account-deletion-confirmation',
      data: {
        fullName: user.fullName,
        deletionDate: new Date().toLocaleDateString()
      }
    });
  } catch (emailError) {
    console.error('Failed to send account deletion email:', emailError);
  }

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, role, search, isActive } = req.query;

  const query: any = {};

  if (role && typeof role === 'string') {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search && typeof search === 'string') {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find(query)
    .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')
    .limit(limitNum)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

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
      }
    }
  });
}));

// Update user status (admin only)
router.patch('/:id/status', authenticate, authorize('admin'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive must be a boolean value'
    });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
}));

export { router as userRoutes };
