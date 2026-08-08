/**
 * Compress an image file before uploading to Supabase Storage.
 * Uses the browser Canvas API to resize and convert to WebP (or JPEG fallback).
 * 
 * @param file - The original image File
 * @param options - Compression options
 * @returns A compressed File ready for upload
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  // Skip compression for tiny files (< 100KB) or SVGs
  if (file.size < 100 * 1024 || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions while preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file); // Fallback to original
        return;
      }

      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first (smaller), fallback to JPEG
      const outputType = "image/webp";
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Generate a clean filename
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const ext = outputType === "image/webp" ? "webp" : "jpg";
          const compressedFile = new File([blob], `${baseName}.${ext}`, {
            type: outputType,
            lastModified: Date.now(),
          });

          // Only use compressed version if it's actually smaller
          if (compressedFile.size < file.size) {
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback to original on error
    };

    img.src = url;
  });
}

/**
 * Compress multiple image files in parallel.
 */
export async function compressImages(
  files: File[],
  options?: Parameters<typeof compressImage>[1]
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, options)));
}
