export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  date?: string;
  location?: string;
  author?: string;
  authorPhoto?: string;
  fullDescription?: string;
  features?: string[];
  isActive?: boolean;
  translations?: any;
}
