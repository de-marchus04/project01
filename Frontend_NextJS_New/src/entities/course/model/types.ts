export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  author?: string;
  authorPhoto?: string;
  fullDescription?: string;
  features?: string;
  translations?: any;
}