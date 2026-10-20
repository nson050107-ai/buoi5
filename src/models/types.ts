export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  instructor: string;
  price: number;
  duration: number;
  thumbnail: string;
  trailerUrl: string;
  createdAt?: string;
}