'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Paperclip, X, File, Image, Video, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner'; // or your toast library

interface Props {
  engagementId: string;
  onUploadComplete: (urls: string[]) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const DEFAULT_CONFIG = {
  maxFiles: 5,
  maxSizeMB: 25,
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4'
  ]
};

export function FileAttachmentUploader({
  engagementId,
  onUploadComplete,
  onUploadError,
  disabled = false,
  maxFiles = DEFAULT_CONFIG.maxFiles,
  maxSizeMB = DEFAULT_CONFIG.maxSizeMB,
  allowedTypes = DEFAULT_CONFIG.allowedTypes
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Unsupported file type: ${file.name}`);
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max ${maxSizeMB}MB)`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length + previewFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    setPreviewFiles(prev => [...prev, ...validFiles]);
    e.target.value = ''; // Reset input
  };

  const removeFile = (index: number) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'sndbx_engagements');
    formData.append('folder', `engagements/${engagementId}`);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return data.secure_url;
  };

  const handleUpload = async () => {
    if (previewFiles.length === 0 || disabled || uploading) return;
    
    setUploading(true);
    setProgress(0);
    
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < previewFiles.length; i++) {
        const file = previewFiles[i];
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
        
        // Update progress
        setProgress(Math.round(((i + 1) / previewFiles.length) * 100));
      }
      
      onUploadComplete(uploadedUrls);
      setPreviewFiles([]);
      toast.success('Files uploaded successfully');
      
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3">
      {/* File Input */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="gap-2"
        >
          <Paperclip className="h-4 w-4" />
          Attach Files
        </Button>
        <span className="text-xs text-muted-foreground">
          Max {maxFiles} files, {maxSizeMB}MB each
        </span>
      </div>

      {/* Preview List */}
      {previewFiles.length > 0 && (
        <div className="space-y-2">
          {previewFiles.map((file, index) => (
            <div 
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(file.type)}
                <span className="truncate">{file.name}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeFile(index)}
                disabled={uploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-1">
              <Progress value={progress} className="h-1" />
              <p className="text-xs text-muted-foreground text-center">
                Uploading... {progress}%
              </p>
            </div>
          )}
          
          {/* Upload Button */}
          {!uploading && previewFiles.length > 0 && (
            <Button 
              size="sm" 
              onClick={handleUpload}
              disabled={disabled}
              className="w-full"
            >
              Upload {previewFiles.length} file{previewFiles.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}

      {/* Admin Notice for Supervised Engagements */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground p-2 bg-amber-50 dark:bg-amber-950/20 rounded">
        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0 text-amber-600" />
        <p>Files are reviewed by admin before delivery to ensure security and compliance.</p>
      </div>
    </div>
  );
}
