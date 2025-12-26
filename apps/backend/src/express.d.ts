import { User } from './entities/user.entity';

// Extend express request type to include user
// So that request.user is typed as User | null
declare module 'express' {
  interface Request {
    user: User | null;
  }
}

// Extend Express namespace to include Multer types
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }
}

export {};
