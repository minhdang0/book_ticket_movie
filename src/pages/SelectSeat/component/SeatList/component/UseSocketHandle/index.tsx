import { useEffect } from 'react';
import socketService from '../../../../../../services/socketService';

export const useSocketHandlers = (
    showtimeId: string,
    sessionId: string,
    setOccupiedSeats: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
    useEffect(() => {
        const handleSeatSelected = (data: { seatId: string; showtimeId: string; sessionId: string }) => {
            if (data.showtimeId === showtimeId && data.sessionId !== sessionId) {
                setOccupiedSeats(prev => new Set([...prev, data.seatId]));
            }
        };

        const handleSeatUnselected = (data: { seatId: string; showtimeId: string }) => {
            if (data.showtimeId === showtimeId) {
                setOccupiedSeats(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.seatId);
                    return newSet;
                });
            }
        };

        const handleSessionCleared = (data: { seatIds: string[]; showtimeId: string }) => {
            if (data.showtimeId === showtimeId) {
                setOccupiedSeats(prev => {
                    const newSet = new Set(prev);
                    data.seatIds.forEach(seatId => newSet.delete(seatId));
                    return newSet;
                });
            }
        };

        socketService.on('seat:selected', handleSeatSelected);
        socketService.on('seat:unselected', handleSeatUnselected);
        socketService.on('seat:cleared', handleSessionCleared);

        return () => {
            socketService.off('seat:selected', handleSeatSelected);
            socketService.off('seat:unselected', handleSeatUnselected);
            socketService.off('seat:cleared', handleSessionCleared);
        };
    }, [showtimeId, sessionId, setOccupiedSeats]);
};