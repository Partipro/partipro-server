declare namespace Express {
  export interface Request {
    user: {
      email: string;
      id: string;
      contract: string;
    };
    populate: any;
    filters: any;
    pagination: { page: number; pageSize?: number };
  }
}
