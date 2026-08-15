export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"] as const;
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png"] as const;
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file extension, MIME type, and file size (max 10MB) for scan image uploads.
 * Accepts only JPG, JPEG, and PNG.
 */
export function validateScanImage(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: "Please select an image file." };
  }

  // 1. File size validation (max 10 MB)
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMb} MB) exceeds the maximum allowed limit of ${MAX_IMAGE_SIZE_MB} MB.`,
    };
  }

  // 2. MIME type validation (image/jpeg, image/png)
  const mimeType = file.type.toLowerCase();
  const isMimeValid = ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as typeof ALLOWED_IMAGE_MIME_TYPES[number]);
  if (!isMimeValid) {
    return {
      valid: false,
      error: `Invalid file type (${file.type || "unknown"}). Only JPG, JPEG, and PNG images are allowed.`,
    };
  }

  // 3. File extension validation (.jpg, .jpeg, .png)
  const fileName = file.name.toLowerCase();
  const extMatch = fileName.match(/\.([a-z0-9]+)$/i);
  const ext = extMatch ? extMatch[1] : "";
  const isExtValid = ALLOWED_IMAGE_EXTENSIONS.includes(ext as typeof ALLOWED_IMAGE_EXTENSIONS[number]);
  if (!isExtValid) {
    return {
      valid: false,
      error: `Invalid file extension (.${ext || "none"}). Only .jpg, .jpeg, and .png files are accepted.`,
    };
  }

  return { valid: true };
}
