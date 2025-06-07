import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { cleanExpiredSessions } from '../../features/showtime/showtimeSlice'
import { LocalSeatSession } from '../../utils/interfaces/sessionLocal';
import { AppDispatch, RootState } from '../../store';

interface BeforeUnloadHandleProps {
    onCleanup?: () => void;
}

const BeforeUnloadHandle: React.FC<BeforeUnloadHandleProps> = ({
    onCleanup
}) => {
    const isCleaningUp = useRef(false);
    const dispatch = useDispatch<AppDispatch>();
    const { localSeatSessions } = useSelector((state: RootState) => state.showtime);

    // Tạo storage key unique cho showtime (giống SeatList)
    const getStorageKey = (key: string, showtimeId?: string) =>
        showtimeId ? `${key}_${showtimeId}` : key;

    const performCleanup = async () => {
        if (isCleaningUp.current) return;
        isCleaningUp.current = true;

        try {
            console.log('🧹 BeforeUnload cleanup started');

            // Call cleanup callback if provided
            if (onCleanup) {
                onCleanup();
            }

            // Group sessions by showtime and sessionId
            const sessionGroups: Record<string, {
                showtimeId: string;
                sessionId: string;
                seatIds: string[];
            }> = {};

            localSeatSessions.forEach((session: LocalSeatSession) => {
                const key = `${session.showtimeId}_${session.sessionId}`;
                if (!sessionGroups[key]) {
                    sessionGroups[key] = {
                        showtimeId: session.showtimeId,
                        sessionId: session.sessionId,
                        seatIds: []
                    };
                }
                sessionGroups[key].seatIds.push(session.seatId);
            });

            // Clear localStorage for each showtime
            Object.values(sessionGroups).forEach(group => {
                const storageKey = getStorageKey('bookingData', group.showtimeId);
                localStorage.removeItem(storageKey);
            });

            // Clear old format localStorage
            localStorage.removeItem('selectedSeatIds');
            localStorage.removeItem('selectedSeats');
            localStorage.removeItem('bookingSessionId');

            console.log('✅ BeforeUnload cleanup completed for sessions:', Object.keys(sessionGroups));
        } catch (error) {
            console.error('❌ BeforeUnload cleanup error:', error);
        }
    };

    const sendCleanupRequest = () => {
        if (localSeatSessions.length === 0) {
            console.log('ℹ️ No sessions to cleanup');
            return;
        }

        // Group sessions và lấy tất cả seatIds
        const allSeatIds = [...new Set(localSeatSessions.map((s: LocalSeatSession) => s.seatId))];

        if (allSeatIds.length === 0) return;

        const data = JSON.stringify({ seatIds: allSeatIds });
        const url = 'http://localhost:4000/api/v1/seats/cleanup';

        console.log('📡 Sending cleanup request for seats:', allSeatIds);

        // Try sendBeacon first (most reliable for page unload)
        if (navigator.sendBeacon) {
            const blob = new Blob([data], { type: 'application/json' });
            const success = navigator.sendBeacon(url, blob);
            console.log('📡 Cleanup request sent via sendBeacon:', success);
        } else {
            // Fallback: sync XMLHttpRequest (not recommended but necessary for old browsers)
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url, false); // false = synchronous
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(data);
                console.log('📡 Cleanup request sent via XMLHttpRequest');
            } catch (error) {
                console.error('❌ Failed to send cleanup request:', error);
            }
        }
    };

    // Fallback cleanup từ localStorage (nếu Redux store trống)
    const sendCleanupFromStorage = () => {
        const allSeatIds: string[] = [];

        // Check new format
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('bookingData_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    if (data.selectedSeatIds && Array.isArray(data.selectedSeatIds)) {
                        allSeatIds.push(...data.selectedSeatIds);
                    }
                } catch (error) {
                    console.error('Error parsing storage data:', error);
                }
            }
        }

        // Check old format
        const oldSeatIds = localStorage.getItem('selectedSeatIds');
        if (oldSeatIds) {
            try {
                const seatIds = JSON.parse(oldSeatIds);
                if (Array.isArray(seatIds)) {
                    allSeatIds.push(...seatIds);
                }
            } catch (error) {
                console.error('Error parsing old seat IDs:', error);
            }
        }

        // Remove duplicates
        const uniqueSeatIds = [...new Set(allSeatIds)];

        if (uniqueSeatIds.length > 0) {
            const data = JSON.stringify({ seatIds: uniqueSeatIds });
            const url = 'http://localhost:4000/api/v1/seats/cleanup';

            console.log('📦 Fallback cleanup for seats:', uniqueSeatIds);

            if (navigator.sendBeacon) {
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
                console.log('📦 Fallback cleanup sent via sendBeacon');
            } else {
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', url, false);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.send(data);
                    console.log('📦 Fallback cleanup sent via XMLHttpRequest');
                } catch (error) {
                    console.error('❌ Failed to send fallback cleanup:', error);
                }
            }
        }
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('🚨 Page unloading - beforeunload event');
            console.log('Current sessions:', localSeatSessions.length);

            if (localSeatSessions.length > 0) {
                sendCleanupRequest();
            } else {
                // Fallback to localStorage
                sendCleanupFromStorage();
            }

            performCleanup();
        };

        const handleUnload = () => {
            console.log('🚨 Page unloading - unload event');

            if (localSeatSessions.length > 0) {
                sendCleanupRequest();
            } else {
                sendCleanupFromStorage();
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                console.log('🚨 Page hidden - visibility change');

                if (localSeatSessions.length > 0) {
                    sendCleanupRequest();
                    performCleanup();
                } else {
                    sendCleanupFromStorage();
                    performCleanup();
                }
            }
        };

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            console.log('🧹 Component unmounting cleanup');

            if (localSeatSessions.length > 0) {
                sendCleanupRequest();
                performCleanup();
            } else {
                sendCleanupFromStorage();
                performCleanup();
            }
        };
    }, [localSeatSessions, onCleanup]);

    // Periodic cleanup for expired selections
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                dispatch(cleanExpiredSessions());

                const response = await fetch('http://localhost:4000/api/v1/seats/cleanup-expired', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ timeoutMinutes: 10 }),
                });

                if (response.ok) {
                    console.log('✅ Periodic cleanup completed');
                }
            } catch (error) {
                console.error('❌ Periodic cleanup failed:', error);
            }
        }, 5 * 60 * 1000); // 5 phút

        return () => clearInterval(interval);
    }, [dispatch]);

    return null;
};

export default BeforeUnloadHandle;