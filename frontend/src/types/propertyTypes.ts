export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl: string[];
  createdAt: string;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  price: number;
  location: string;
  owner: string;
  imageFiles: File[];   // for upload mode
  imageUrl: string[];   // for URL mode
}