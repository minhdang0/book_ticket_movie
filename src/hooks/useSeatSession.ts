import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { useSelector } from "react-redux";
import { useCallback, useState } from "react";
import { LocalSeatSession } from "../utils/interfaces/sessionLocal";
import { addLocalSeatSession, removeLocalSeatSession } from "../features/showtime/showtimeSlice";

const useSeatSession = (showtimeId: string) => {
    const dispatch = useDispatch<AppDispatch>();
    const { localSeatSessions } = useSelector((state: RootState) => state.showtime);
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);

    const getOccupiedSeats = useCallback(() => {
        const now = Date.now();
        return localSeatSessions
            .filter((s: LocalSeatSession) =>
                s.showtimeId === showtimeId &&
                s.sessionId !== sessionId &&
                s.expiresAt > now
            )
            .map((s: LocalSeatSession) => s.seatId);
    }, [localSeatSessions, showtimeId, sessionId]);

    const addSeatSession = useCallback((seatId: string, seatName: string) => {
        dispatch(addLocalSeatSession({
            seatId,
            seatName,
            showtimeId,
            sessionId,
            selectedAt: Date.now(),
            expiresAt: Date.now() + 600000 // 10 phút
        }));
    }, [dispatch, showtimeId, sessionId]);

    const removeSeatSession = useCallback((seatId: string) => {
        dispatch(removeLocalSeatSession({ seatId, showtimeId }));
    }, [dispatch, showtimeId]);

    return {
        sessionId,
        occupiedSeats: getOccupiedSeats(),
        addSeatSession,
        removeSeatSession
    };
};

export default useSeatSession;