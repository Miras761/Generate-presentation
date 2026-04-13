export interface Slide {
  title: string;
  content: string;
  image_prompt_english: string;
  imageUrl?: string;
}

export interface PresentationData {
  id?: string;
  userId?: string;
  title: string;
  topic: string;
  language: string;
  theme: string;
  slides: Slide[];
  createdAt?: number;
}
