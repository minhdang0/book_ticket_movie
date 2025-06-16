import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    addLocalSeatSession,
    cleanExpiredSessions,
    clearLocalSessions
} from '../features/showtime/showtimeSlice';
import seatSessionService from '../services/sessionService';
import socketService from '../services/socketService';
import { AppDispatch } from '../store';
import { ISeat } from '../utils/interfaces/seat';

// Hook for managing seat selection state
export const useSeatSelection = (showtimeId: string) => {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [sessionId] = useState<string>(() => `session_${Date.now()}_${Math.random()}`);

    const dispatch = useDispatch<AppDispatch>();

    // Clear selection when showtime changes
    useEffect(() => {
        setSelectedSeats([]);
        setOccupiedSeats(new Set());
        setIsLoading(false);
    }, [showtimeId]);

    return {
        selectedSeats,
        setSelectedSeats,
        occupiedSeats,
        setOccupiedSeats,
        isLoading,
        setIsLoading,
        sessionId,
        dispatch
    };
};

// Hook for managing socket connection and events
export const useSocketConnection = (
    showtimeId: string,
    sessionId: string,
    setOccupiedSeats: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
    const isConnected = useRef(false);

    const handleSeatSelected = useCallback((data: {
        seatId: string;
        showtimeId: string;
        sessionId: string;
    }) => {
        if (data.showtimeId === showtimeId && data.sessionId !== sessionId) {
            console.log('Someone else selected seat:', data.seatId);
            setOccupiedSeats(prev => new Set([...prev, data.seatId]));
        }
    }, [showtimeId, sessionId, setOccupiedSeats]);

    const handleSeatUnselected = useCallback((data: {
        seatId: string;
        showtimeId: string;
    }) => {
        if (data.showtimeId === showtimeId) {
            console.log('Someone else unselected seat:', data.seatId);
            setOccupiedSeats(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.seatId);
                return newSet;
            });
        }
    }, [showtimeId, setOccupiedSeats]);

    const handleSessionCleared = useCallback((data: {
        seatIds: string[];
        showtimeId: string;
    }) => {
        if (data.showtimeId === showtimeId) {
            console.log('Someone\'s session was cleared:', data.seatIds);
            setOccupiedSeats(prev => {
                const newSet = new Set(prev);
                data.seatIds.forEach(seatId => newSet.delete(seatId));
                return newSet;
            });
        }
    }, [showtimeId, setOccupiedSeats]);

    useEffect(() => {
        const connectAndJoin = async () => {
            try {
                if (!socketService.connected) {
                    await socketService.connect();
                }

                await socketService.joinShowtime(showtimeId, sessionId);
                isConnected.current = true;

                // Register event listeners
                socketService.on('seat:selected', handleSeatSelected);
                socketService.on('seat:unselected', handleSeatUnselected);
                socketService.on('seat:cleared', handleSessionCleared);

            } catch (error) {
                console.error('Failed to connect socket:', error);
            }
        };

        connectAndJoin();

        return () => {
            // Cleanup event listeners
            socketService.off('seat:selected', handleSeatSelected);
            socketService.off('seat:unselected', handleSeatUnselected);
            socketService.off('seat:cleared', handleSessionCleared);

            if (isConnected.current) {
                socketService.leaveShowtime();
                isConnected.current = false;
            }
        };
    }, [showtimeId, sessionId, handleSeatSelected, handleSeatUnselected, handleSessionCleared]);

    return { isConnected: isConnected.current };
};

// Hook for polling occupied seats
export const useSeatPolling = (
    showtimeId: string,
    sessionId: string,
    setOccupiedSeats: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const pollOccupiedSeats = useCallback(async () => {
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
        } catch (error) {
            console.error('Error polling occupied seats:', error);
        }
    }, [showtimeId, sessionId, setOccupiedSeats]);

    useEffect(() => {
        // Initial poll
        const setupTimeout = setTimeout(() => {
            pollOccupiedSeats();

            // Setup interval polling
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
            pollIntervalRef.current = setInterval(pollOccupiedSeats, 5000);
        }, 100);

        return () => {
            clearTimeout(setupTimeout);
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [pollOccupiedSeats]);

    return { pollOccupiedSeats };
};

// Hook for session management
export const useSessionManagement = (
    showtimeId: string,
    sessionId: string,
    selectedSeats: string[],
    setSelectedSeats: React.Dispatch<React.SetStateAction<string[]>>,
    seats: ISeat[],
    dispatch: AppDispatch
) => {
    const [countdown, setCountdown] = useState<number>(600);

    // Restore session from server
    console.log(selectedSeats)
    const restoreSessionFromServer = useCallback(async () => {
        try {
            const response = await seatSessionService.validateSession(sessionId, showtimeId);
            if (response?.success && response.data?.isValid) {
                const selectedSeatsData = Array.isArray(response.data.selectedSeats)
                    ? response.data.selectedSeats
                    : [];

                const seatNames = selectedSeatsData
                    .map((seat: any) => {
                        const seatObj = seats.find(s => s._id === (seat.seatId || seat._id || seat.id));
                        return seatObj?.name;
                    })
                    .filter(Boolean);

                if (seatNames.length > 0) {
                    setSelectedSeats(seatNames);

                    seatNames.forEach((seatName: string) => {
                        const seat = seats.find(s => s.name === seatName);
                        if (seat) {
                            dispatch(addLocalSeatSession({
                                seatId: seat._id,
                                seatName: seat.name,
                                showtimeId,
                                sessionId,
                                selectedAt: Date.now(),
                                expiresAt: new Date(response.data.expiresAt).getTime()
                            }));
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error restoring session:', error);
        }
    }, [sessionId, showtimeId, seats, setSelectedSeats, dispatch]);

    // Clear session
    const clearSession = useCallback(async () => {
        try {
            await seatSessionService.clearSession(sessionId, showtimeId);
            dispatch(clearLocalSessions({ showtimeId, sessionId }));
            setSelectedSeats([]);
            localStorage.removeItem(`bookingData_${showtimeId}`);
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    }, [sessionId, showtimeId, dispatch, setSelectedSeats]);

    // Extend session
    const extendSession = useCallback(async () => {
        try {
            // Use socket service if connected, otherwise use API
            if (socketService.connected) {
                socketService.extendSession(10);
            } else {
                const response = await seatSessionService.extendSession(sessionId, showtimeId, 10);
                if (response?.success) {
                    setCountdown(600);
                }
            }
        } catch (error) {
            console.error('Error extending session:', error);
        }
    }, [sessionId, showtimeId]);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto clear when countdown reaches 0
    useEffect(() => {
        if (countdown === 0) {
            clearSession();
        }
    }, [countdown, clearSession]);

    // Cleanup expired sessions periodically
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            dispatch(cleanExpiredSessions());
        }, 30000);

        return () => clearInterval(cleanupInterval);
    }, [dispatch]);

    return {
        countdown,
        setCountdown,
        restoreSessionFromServer,
        clearSession,
        extendSession
    };
};

// Hook for local storage management
export const useLocalStorage = (
    showtimeId: string,
    sessionId: string,
    selectedSeats: string[],
    seats: ISeat[]
) => {
    const getStorageKey = useCallback((key: string) => `${key}_${showtimeId}`, [showtimeId]);

    const getSeatIds = useCallback((seatNames: string[]): string[] => {
        return seatNames
            .map(seatName => {
                const seat = seats.find(s => s.name === seatName);
                return seat?._id;
            })
            .filter((id): id is string => Boolean(id));
    }, [seats]);

    // Save to localStorage
    useEffect(() => {
        const selectedSeatIds = getSeatIds(selectedSeats);

        if (selectedSeatIds.length > 0) {
            const storageData = {
                selectedSeats,
                selectedSeatIds,
                sessionId,
                showtimeId,
                timestamp: Date.now()
            };
            localStorage.setItem(getStorageKey('bookingData'), JSON.stringify(storageData));
        } else {
            localStorage.removeItem(getStorageKey('bookingData'));
        }
    }, [selectedSeats, getSeatIds, sessionId, showtimeId, getStorageKey]);

    const restoreFromLocalStorage = useCallback(() => {
        const storedData = localStorage.getItem(getStorageKey('bookingData'));
        if (!storedData) return null;

        try {
            const data = JSON.parse(storedData);
            const timeDiff = Date.now() - data.timestamp;

            // Check if data is still valid (10 minutes)
            if (timeDiff < 600000 &&
                data.sessionId === sessionId &&
                data.showtimeId === showtimeId) {
                return data;
            } else {
                localStorage.removeItem(getStorageKey('bookingData'));
                return null;
            }
        } catch (error) {
            console.error('Error parsing stored booking data:', error);
            localStorage.removeItem(getStorageKey('bookingData'));
            return null;
        }
    }, [getStorageKey, sessionId, showtimeId]);

    return {
        getSeatIds,
        restoreFromLocalStorage
    };
};