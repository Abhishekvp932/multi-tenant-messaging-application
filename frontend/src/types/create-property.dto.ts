export interface CreatePropertyDTO {
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];   // Cloudinary URLs
  owner?: string;     // optional if you attach from auth middleware
}