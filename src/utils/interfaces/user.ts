export interface IUser {
    firstName: string;
    lastName: string;
    age?: number | null;
    gender?: string;
    email: string;
    phone?: string;
    username: string;
    birthDate?: string | null;
    image?: string;
    emailVerifiedAt?: string | null;
    createdAt?: Date | null;
}