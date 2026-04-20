import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

// Configure Cloudinary (ensure env vars are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadFile(
  file: Buffer | string, 
  options: {
    folder: string;
    resourceType: 'image' | 'video' | 'raw' | 'auto';
    allowedFormats?: string[];
    maxFileSize?: number; // in bytes
  }
): Promise<UploadApiResponse> {
  const { folder, resourceType, allowedFormats, maxFileSize } = options;
  
  // Validate file size if buffer
  if (Buffer.isBuffer(file) && maxFileSize && file.length > maxFileSize) {
    throw new Error(`File exceeds maximum size of ${maxFileSize / 1024 / 1024}MB`);
  }
  
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: `sndbx/${folder}`,
      resource_type: resourceType,
      access_mode: 'private', // Require signed URLs for access
    };
    
    if (allowedFormats) {
      uploadOptions.allowed_formats = allowedFormats;
    }
    
    const uploadHandler = (error: any, result: any) => {
      if (error) reject(error);
      else resolve(result);
    };
    
    if (Buffer.isBuffer(file)) {
      // Upload from buffer
      cloudinary.uploader.upload_stream(uploadOptions, uploadHandler)
        .end(file);
    } else {
      // Upload from URL
      cloudinary.uploader.upload(file, uploadOptions, uploadHandler);
    }
  });
}

export function getSecureUrl(publicId: string, options?: { expires?: number }): string {
  return cloudinary.url(publicId, {
    secure: true,
    type: 'authenticated',
    sign_url: true,
    ...options
  });
}

export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
