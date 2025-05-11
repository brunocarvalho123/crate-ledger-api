// src/utils/errors/serviceErrors.ts
export class UnexpectedApiData extends Error {
  constructor(message: string, public results: any) {
    super(message);
    this.name = 'UnexpectedApiData';
  }
}
