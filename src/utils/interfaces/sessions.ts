export interface ISession {
    sessionId?: string;
    showtimeId?: string;
    seatIds?: string[];
    seatName?: string;
    userId?: string | null;
    ipAddress?: string;
    userAgent?: string;
    selectedAt?: Date;
    expiresAt?: Date;
    status?: "selecting" | "expired" | "cancelled";
}