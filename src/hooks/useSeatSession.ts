import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { useSelector } from "react-redux";
import { useCallback, useState, useRef, useEffect } from "react";
import { LocalSeatSession } from "../utils/interfaces/sessionLocal";
import { addLocalSeatSession, removeLocalSeatSession } from "../features/showtime/showtimeSlice";
import seatSessionService from "../services/sessionService";
import { ISeat } from "../utils/interfaces/seat";

const useSeatSession = (showtimeId: string) => {
    const dispatch = useDispatch<AppDispatch>();
    const { localSeatSessions } = useSelector((state: RootState) => state.showtime);

    // State management
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
    const [countdown, setCountdown] = useState(600); // 10 minutes
    const [isLoading, setIsLoading] = useState(false);
    const [occupiedSeats, setOccupiedSeats] = useState(new Set<string>());

    // Refs for cleanup
    const markTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const prevShowtimeIdRef = useRef<string>(showtimeId);

    // Helper functions
    const getStorageKey = useCallback((key: string) => {
        return `${key}_${showtimeId}`;
    }, [showtimeId]);

    const getSeatIds = useCallback((seatNames: string[], seats?: ISeat[]) => {
        if (!seats) return [];
        return seatNames
            .map(name => seats.find(seat => seat.name === name)?._id)
            .filter(Boolean) as string[];
    }, []);

    const getOccupiedSeats = useCallback((): Set<string> => {
        const now = Date.now();
        const occupied: string[] = localSeatSessions
            .filter((s: LocalSeatSession) =>
                s.showtimeId === showtimeId &&
                s.sessionId !== sessionId &&
                s.expiresAt > now
            )
            .map((s: LocalSeatSession) => s.seatId);

        return new Set<string>(occupied);
    }, [localSeatSessions, showtimeId, sessionId]);

    // Update occupied seats when local sessions change
    useEffect(() => {
        setOccupiedSeats(getOccupiedSeats());
    }, [getOccupiedSeats]);

    const addSeatSession = useCallback((seatId: string, seatName: string) => {
        dispatch(addLocalSeatSession({
            seatId,
            seatName,
            showtimeId,
            sessionId,
            selectedAt: Date.now(),
            expiresAt: Date.now() + 600000 // 10 minutes
        }));
    }, [dispatch, showtimeId, sessionId]);

    const removeSeatSession = useCallback((seatId: string) => {
        dispatch(removeLocalSeatSession({ seatId, showtimeId }));
    }, [dispatch, showtimeId]);

    const pollOccupiedSeats = useCallback(async () => {
        try {
            setIsLoading(true);
            // Simulate API call - replace with actual service call
            // const occupiedFromServer = await seatSessionService.getOccupiedSeats(showtimeId);
            // setOccupiedSeats(new Set<string>(occupiedFromServer));

            // For now, just update from local state
            setOccupiedSeats(getOccupiedSeats());
        } catch (error) {
            console.error('Failed to poll occupied seats:', error);
        } finally {
            setIsLoading(false);
        }
    }, [showtimeId, getOccupiedSeats]);

    const updateSeatsOnServer = useCallback(async (seatIds: string[], action: 'select' | 'unselect') => {
        try {
            setIsLoading(true);
            if (action === 'select') {
                // Add seats to local session
                seatIds.forEach(seatId => {
                    const seatName = `seat_${seatId}`; // You might need to get actual seat name
                    addSeatSession(seatId, seatName);
                });
                // await seatSessionService.selectSeats(sessionId, showtimeId, seatIds);
            } else {
                // Remove seats from local session
                seatIds.forEach(seatId => {
                    removeSeatSession(seatId);
                });
                // await seatSessionService.unselectSeats(sessionId, showtimeId, seatIds);
            }
        } catch (error) {
            console.error(`Failed to ${action} seats:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, showtimeId, addSeatSession, removeSeatSession]);

    const clearSession = useCallback(async () => {
        try {
            // Clear local sessions for this showtime and session
            localSeatSessions
                .filter((s: LocalSeatSession) => s.showtimeId === showtimeId && s.sessionId === sessionId)
                .forEach((s: LocalSeatSession) => removeSeatSession(s.seatId));

            // Clear server session
            await seatSessionService.clearSession(sessionId, showtimeId);

            // Clear localStorage
            localStorage.removeItem(getStorageKey('bookingData'));
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }, [showtimeId, sessionId, localSeatSessions, removeSeatSession, getStorageKey]);

    const extendSession = useCallback(async () => {
        try {
            setCountdown(600); // Reset to 10 minutes

            // Extend expiration time for local sessions
            localSeatSessions
                .filter((s: LocalSeatSession) => s.showtimeId === showtimeId && s.sessionId === sessionId)
                .forEach((s: LocalSeatSession) => {
                    dispatch(addLocalSeatSession({
                        ...s,
                        expiresAt: Date.now() + 600000 // Extend by 10 minutes
                    }));
                });

            // Extend session on server
            // await seatSessionService.extendSession(sessionId, showtimeId);
        } catch (error) {
            console.error('Failed to extend session:', error);
        }
    }, [showtimeId, sessionId, localSeatSessions, dispatch]);

    return {
        // State
        countdown,
        setCountdown,
        occupiedSeats,
        sessionId,
        isLoading,

        // Refs
        markTimeoutRef,
        pollIntervalRef,
        prevShowtimeIdRef,

        // Redux
        dispatch,

        // Helper functions
        getStorageKey,
        getSeatIds,

        // API functions
        pollOccupiedSeats,
        updateSeatsOnServer,
        clearSession,
        extendSession,

        // Local session functions
        addSeatSession,
        removeSeatSession
    };
};

export default useSeatSession;