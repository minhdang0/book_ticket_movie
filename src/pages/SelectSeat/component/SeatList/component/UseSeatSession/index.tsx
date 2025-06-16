import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import seatSessionService from '../../../../../../services/sessionService';
import socketService from '../../../../../../services/socketService';
import { clearLocalSessions } from '../../../../../../features/showtime/showtimeSlice';
import { ISeat } from '../../../../../../utils/interfaces/seat';

export const UseSeatSession = (showtimeId: string, seats: ISeat[]) => {
    const [countdown, setCountdown] = useState<number>(600);
    const [occupiedSeats, setOccupiedSeats] = useState(new Set<string>());
    const [sessionId] = useState<string>(() => `session_${Date.now()}_${Math.random()}`);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const markTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const prevShowtimeIdRef = useRef<string>(showtimeId);

    const dispatch = useDispatch<AppDispatch>();

    const getStorageKey = (key: string) => `${key}_${showtimeId}`;

    const pollOccupiedSeats = async () => {
        try {
            const response = await seatSessionService.getActiveSeatsForShowtime(showtimeId, sessionId);

            if (response?.success && response.data) {
                const occupiedSeatsData = Array.isArray(response.data.occupiedSeats)
                    ? response.data.occupiedSeats
                    : [];

                const occupiedSeatIds = new Set<string>(
                    occupiedSeatsData
                        .map((seat: any) => seat.seatId || seat._id || seat.id)
                        .filter((id: any) => id)
                );

                setOccupiedSeats(occupiedSeatIds);
            }
        } catch (error: any) {
            console.error('Error polling occupied seats:', error);
            if (error instanceof TypeError || error?.message?.includes('network')) {
                setOccupiedSeats(new Set());
            }
        }
    };

    const updateSeatsOnServer = async (selectedSeatIds: string[], action: 'select' | 'unselect') => {
        if (!selectedSeatIds?.length) return;

        const validSeatIds = selectedSeatIds.filter(id => id && typeof id === 'string');
        if (!validSeatIds.length) {
            throw new Error('Không có ghế hợp lệ để xử lý');
        }

        try {
            setIsLoading(true);

            if (action === 'select') {
                const response = await seatSessionService.selectSeats({
                    showtimeId,
                    seatIds: validSeatIds,
                    sessionId
                });
                socketService.emit('seat:selected', {
                    seatIds: validSeatIds,
                    showtimeId,
                    sessionId
                });

                if (!response?.success) {
                    throw new Error(response?.message || 'Không thể chọn ghế');
                }
            } else {
                await seatSessionService.unselectSeats({
                    showtimeId,
                    seatIds: validSeatIds,
                    sessionId
                });
                socketService.emit('seat:unselected', {
                    seatIds: validSeatIds,
                    showtimeId,
                    sessionId
                });
            }

            setTimeout(pollOccupiedSeats, 500);
        } catch (error) {
            console.error(`Error ${action}ing seats:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const getSeatIds = (seatNames: string[]): string[] => {
        return seatNames
            .map(seatName => {
                const seat = seats.find(s => s.name === seatName);
                return seat?._id || null;
            })
            .filter((id): id is string => Boolean(id));
    };

    const clearSession = async () => {
        try {
            await seatSessionService.clearSession(sessionId, showtimeId);
            dispatch(clearLocalSessions({ showtimeId, sessionId }));
            localStorage.removeItem(getStorageKey('bookingData'));
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    };

    const extendSession = async () => {
        try {
            const response = await seatSessionService.extendSession(sessionId, showtimeId, 10);
            if (response?.success) {
                setCountdown(600);
            }
        } catch (error) {
            console.error('Error extending session:', error);
        }
    };

    return {
        countdown,
        setCountdown,
        occupiedSeats,
        sessionId,
        isLoading,
        markTimeoutRef,
        pollIntervalRef,
        prevShowtimeIdRef,
        dispatch,
        getStorageKey,
        pollOccupiedSeats,
        updateSeatsOnServer,
        getSeatIds,
        clearSession,
        extendSession
    };
};
