declare namespace Express {
  export interface Request {
    user: {
      email: string;
      id: number;
    };
  }
}
