import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'products' },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          if (!result)
            return reject(new Error('No se obtuvo resultado de Cloudinary'));
          resolve(result.secure_url);
        },
      );
      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }

  async deleteImage(url: string): Promise<void> {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const publicId = url
      .split('/')
      .slice(-2)
      .join('/')
      .replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  }
}
