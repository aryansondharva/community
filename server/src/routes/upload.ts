import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(uploadDir, req.user?.id || 'anonymous');
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|mp4|avi|mov|wmv|flv|webm|mp3|wav|ogg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, videos, and audio files are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter
});

// Upload single file
router.post('/single', authenticate, upload.single('file'), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const fileUrl = `/uploads/${req.user?.id}/${req.file.filename}`;
  
  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl,
      uploadDate: new Date()
    }
  });
}));

// Upload multiple files
router.post('/multiple', authenticate, upload.array('files', 5), asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const uploadedFiles = files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    url: `/uploads/${req.user?.id}/${file.filename}`,
    uploadDate: new Date()
  }));

  res.json({
    success: true,
    message: `${files.length} files uploaded successfully`,
    data: uploadedFiles
  });
}));

// Upload avatar specifically
router.post('/avatar', authenticate, upload.single('avatar'), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No avatar uploaded'
    });
  }

  // Validate it's an image
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(req.file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(req.file.mimetype);

  if (!mimetype || !extname) {
    // Delete the uploaded file if it's not an image
    fs.unlinkSync(req.file.path);
    return res.status(400).json({
      success: false,
      message: 'Avatar must be an image file (JPEG, PNG, or GIF)'
    });
  }

  const avatarUrl = `/uploads/${req.user?.id}/${req.file.filename}`;
  
  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: avatarUrl,
      uploadDate: new Date()
    }
  });
}));

// Delete file
router.delete('/:filename', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(uploadDir, req.user?.id || '', filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
}));

// Get user's uploaded files
router.get('/my-files', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userDir = path.join(uploadDir, req.user?.id || '');
  
  if (!fs.existsSync(userDir)) {
    return res.json({
      success: true,
      data: []
    });
  }

  const files = fs.readdirSync(userDir).map(filename => {
    const filePath = path.join(userDir, filename);
    const stats = fs.statSync(filePath);
    
    return {
      filename,
      size: stats.size,
      uploadDate: stats.birthtime,
      url: `/uploads/${req.user?.id}/${filename}`,
      isDirectory: stats.isDirectory()
    };
  });

  res.json({
    success: true,
    data: files
  });
}));

export { router as uploadRoutes };
