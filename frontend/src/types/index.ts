export interface Movie {
  title: string;
  released: number;
  tagLine: string;
}

export interface Person {
  name: string;
  born: number;
}

export interface MovieWithActors {
  movie: Movie;
  actors: Person[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type AddToast = (type: ToastMessage['type'], message: string) => void;
