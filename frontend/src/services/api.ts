import axios from 'axios';
import { Movie, Person, MovieWithActors } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getAllMovies = (): Promise<Movie[]> =>
  api.get<Movie[]>('/movies/movies').then(r => r.data);

export const getMovieWithActors = (title: string): Promise<MovieWithActors> =>
  api.get<MovieWithActors>(`/movies/movie-with-actors/${encodeURIComponent(title)}`).then(r => r.data);

export const getMovieActors = (movieTitle: string): Promise<Person[]> =>
  api.get<Person[]>(`/movies/movie-actors/${encodeURIComponent(movieTitle)}`).then(r => r.data);

export const getCoActors = (actorName: string): Promise<string[]> =>
  api.get<string[]>(`/movies/co-actors/${encodeURIComponent(actorName)}`).then(r => r.data);

export const createMovie = (movie: Movie): Promise<string> =>
  api.post<string>('/movies/create-movie', movie).then(r => r.data);

export const mergeMovie = (movie: Movie): Promise<string> =>
  api.post<string>('/movies/merge-movie', movie).then(r => r.data);

export const createActor = (person: Person): Promise<string> =>
  api.post<string>('/movies/create-actor', person).then(r => r.data);

export const createRelationship = (actorName: string, movieTitle: string): Promise<string> =>
  api.post<string>('/movies/create-relationship', { actorName, movieTitle }).then(r => r.data);

export const updateMovieTagline = (movieTitle: string, newTagLine: string): Promise<string> =>
  api.put<string>('/movies/update-movie-tagline', { movieTitle, newTagLine }).then(r => r.data);

export const updatePersonBorn = (personName: string, newBornYear: number): Promise<string> =>
  api.put<string>('/movies/update-person-born', { personName, newBornYear }).then(r => r.data);

export const deleteMovie = (title: string): Promise<string> =>
  api.delete<string>(`/movies/delete-movie/${encodeURIComponent(title)}`).then(r => r.data);

export const deletePerson = (name: string): Promise<string> =>
  api.delete<string>(`/movies/delete-person/${encodeURIComponent(name)}`).then(r => r.data);

export const removeActorFromMovie = (personName: string, movieTitle: string): Promise<string> =>
  api.delete<string>('/movies/remove-actor-from-movie', {
    data: { personName, movieTitle },
  }).then(r => r.data);
