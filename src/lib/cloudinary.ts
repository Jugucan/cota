/**
 * Configuració de Cloudinary
 */
const CLOUDINARY_CLOUD_NAME = 'drzqm3yfo';
const CLOUDINARY_UPLOAD_PRESET = 'cubbuc_upload';

/**
 * Puja una imatge a Cloudinary
 * @param file - El fitxer d'imatge a pujar
 * @returns Promise amb la URL de la imatge pujada
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'cota');
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error('Error pujant la imatge a Cloudinary');
    }
    
    const data = await response.json();
    
    // Retornar la URL optimitzada
    // Cloudinary la comprimeix i optimitza automàticament
    return data.secure_url;
  } catch (error) {
    console.error('Error pujant a Cloudinary:', error);
    throw error;
  }
}

/**
 * Obté una URL optimitzada de Cloudinary
 * @param publicId - L'ID públic de la imatge a Cloudinary
 * @param options - Opcions de transformació
 * @returns URL optimitzada
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {}
): string {
  // Si la URL no és de Cloudinary, retornar-la tal qual
  if (!url.includes('cloudinary.com')) {
    return url;
  }
  
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
  } = options;
  
  // Construir les transformacions
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  
  // Afegir les transformacions a la URL
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
  }
  
  return url;
}
