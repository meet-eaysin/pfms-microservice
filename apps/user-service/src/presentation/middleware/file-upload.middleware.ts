import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadSingle = upload.single('avatar');

export function handleMulterError(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        statusCode: 400,
        message: 'File too large. Maximum size is 5MB',
      });
      return;
    }
    res.status(400).json({
      statusCode: 400,
      message: `Upload error: ${err.message}`,
    });
    return;
  }

  if (err.message === 'Only image files are allowed') {
    res.status(400).json({
      statusCode: 400,
      message: err.message,
    });
    return;
  }

  next(err);
}
