export class RepositoryError extends Error {
  constructor(public message: string, public code: string, public originalError?: unknown) {
    super(message);
    this.name = 'RepositoryError';
  }
}