import ImageResizer from 'react-native-image-resizer';
import { Platform } from 'react-native';

export class ImageCompressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageCompressionError';
  }
}

/**
 * Compress image files to reduce payload size
 * For photos: 75% quality, max 1200px
 * For documents: 60% quality, converted to JPEG (if image-based)
 */
export const compressImage = async (
  imageUri: string,
  fileName: string,
  imageType: 'photo' | 'document' = 'photo'
): Promise<{ uri: string; size: number }> => {
  try {
    // For PDFs, we can't really compress without external libraries
    // So we'll just return the original
    if (fileName.toLowerCase().endsWith('.pdf') && imageType === 'document') {
      console.log(`[ImageCompression] Cannot compress PDF: ${fileName}, returning original`);
      return { uri: imageUri, size: 0 };
    }

    console.log(`[ImageCompression] Compressing ${fileName} (type: ${imageType})`);

    // Be more aggressive with document compression
    const quality = imageType === 'photo' ? 75 : 50;
    const maxWidth = imageType === 'photo' ? 1200 : 800;
    const maxHeight = imageType === 'photo' ? 1200 : 800;

    try {
      // Resize the image
      const result = await ImageResizer.createResizedImage(
        imageUri,
        maxWidth,
        maxHeight,
        'JPEG',
        quality,
        0,
        undefined,
        true, // keepMeta
        { mode: 'cover' }
      );

      // The result should have a path property
      const compressedPath = (result as any).path || (result as unknown as string);
      const finalUri = typeof compressedPath === 'string' && Platform.OS === 'android' && !compressedPath.startsWith('file://')
        ? `file://${compressedPath}`
        : (compressedPath as string);

      console.log(`[ImageCompression] Compressed ${fileName} successfully`);

      return {
        uri: finalUri,
        size: 0,
      };
    } catch (resizeError) {
      console.warn(`[ImageCompression] Resize failed, trying with lower quality:`, resizeError);

      try {
        // Try again with even lower quality
        const result = await ImageResizer.createResizedImage(
          imageUri,
          600, // Further reduce dimensions
          600,
          'JPEG',
          40, // Very low quality
          0,
          undefined,
          false
        );

        const compressedPath = (result as any).path || (result as unknown as string);
        const finalUri = typeof compressedPath === 'string' && Platform.OS === 'android' && !compressedPath.startsWith('file://')
          ? `file://${compressedPath}`
          : (compressedPath as string);

        console.log(`[ImageCompression] Compressed ${fileName} with fallback settings`);
        return {
          uri: finalUri,
          size: 0,
        };
      } catch (fallbackError) {
        console.warn(`[ImageCompression] Fallback compression also failed:`, fallbackError);
        return { uri: imageUri, size: 0 };
      }
    }
  } catch (error) {
    console.error(`[ImageCompression] Failed to compress image:`, error);
    return { uri: imageUri, size: 0 };
  }
};

/**
 * Check if file is too large for upload
 * Max file size: 5MB per file
 */
export const checkFileSizeLimit = (sizeInBytes?: number | null): boolean => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  return !sizeInBytes || sizeInBytes <= MAX_FILE_SIZE;
};
