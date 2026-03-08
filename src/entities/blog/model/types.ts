export interface Article {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  createdAt: string;
  author?: string;
  authorPhoto?: string;
  tag?: string;
  content?: string;
  translations?: any;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  tag?: string;
  translations?: any;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
  tag?: string;
  translations?: any;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  imageUrl: string;
  time: string;
  tag?: string;
  translations?: any;
}
