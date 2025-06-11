import React, { memo, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from './SeatList.module.scss';
import { ISeat } from '../../../../utils/interfaces/seat';
import {
    addLocalSeatSession,
    removeLocalSeatSession,
    cleanExpiredSessions,
    clearLocalSessions
} from '../../../../features/showtime/showtimeSlice';
import { AppDispatch } from '../../../../store';
import seatSessionService from '../../../../services/sessionService';
import SocketService from '../../../../services/socketService';

type Props = {
    selectedSeats: string[];
    setSelectedSeats: React.Dispatch<React.SetStateAction<string[]>>;
    seats: ISeat[];
    showtimeId: string;
};

const SeatList: React.FC<Props> = memo(({
    selectedSeats,
    setSelectedSeats,
    seats,
    showtimeId
}) => {
    const [countdown, setCountdown] = useState<number>(600);
    const [occupiedSeats, setOccupiedSeats] = useState(new Set<string>());
    const [sessionId] = useState<string>(() => `session_${Date.now()}_${Math.random()}`);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const markTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const prevShowtimeIdRef = useRef<string>(showtimeId);

    const dispatch = useDispatch<AppDispatch>();
    console.log(seats)
    // Tạo storage key unique cho showtime
    const getStorageKey = (key: string) => `${key}_${showtimeId}`;

    useEffect(() => {
        return () => {
            const allowedPaths = ['/payment', '/select-seat'];
            const currentPath = location.pathname || window.location.pathname;

            // Nếu KHÔNG ở trong trang được phép giữ ghế thì mới clear
            const shouldClear = !allowedPaths.some(path => currentPath.startsWith(path));

            if (shouldClear) {
                seatSessionService.clearSession(sessionId, showtimeId).catch(console.error);
                localStorage.removeItem(getStorageKey('bookingData'));
                setSelectedSeats([]);
            }
        };
    }, [showtimeId, sessionId]);
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

        SocketService.on('seat:selected', handleSeatSelected);
        SocketService.on('seat:unselected', handleSeatUnselected);
        SocketService.on('seat:cleared', handleSessionCleared);

        return () => {
            SocketService.off('seat:selected', handleSeatSelected);
            SocketService.off('seat:unselected', handleSeatUnselected);
            SocketService.off('seat:cleared', handleSessionCleared);
        };
    }, [showtimeId, sessionId]);
    // FIX 1: Cải thiện hàm pollOccupiedSeats với error handling tốt hơn
    const pollOccupiedSeats = async () => {
        try {
            console.log('Polling occupied seats for showtime:', showtimeId, 'with sessionId:', sessionId);

            const response = await seatSessionService.getActiveSeatsForShowtime(showtimeId, sessionId);

            if (response && response.success && response.data) {
                // Đảm bảo occupiedSeats là array trước khi map
                const occupiedSeatsData = Array.isArray(response.data.occupiedSeats)
                    ? response.data.occupiedSeats
                    : [];

                const occupiedSeatIds = new Set<string>(
                    occupiedSeatsData
                        .map((seat: any) => seat.seatId || seat._id || seat.id)
                        .filter((id: any) => id) // Loại bỏ undefined/null
                );

                console.log('Occupied seat IDs:', Array.from(occupiedSeatIds));
                setOccupiedSeats(occupiedSeatIds);
            } else {
                console.warn('Invalid response from getActiveSeatsForShowtime:', response);
                // Không reset occupied seats khi response không hợp lệ để tránh flickering
            }
        } catch (error: any) {
            console.error('Error polling occupied seats:', error);
            // Chỉ reset khi có lỗi nghiêm trọng
            if (error instanceof TypeError || error?.message?.includes('network')) {
                setOccupiedSeats(new Set());
            }
        }
    };

    // FIX 2: Cải thiện hàm updateSeatsOnServer
    const updateSeatsOnServer = async (selectedSeatIds: string[], action: 'select' | 'unselect') => {
        if (!selectedSeatIds || selectedSeatIds.length === 0) {
            console.warn('No seat IDs provided for', action);
            return;
        }

        // Validate seat IDs trước khi gửi
        const validSeatIds = selectedSeatIds.filter(id => id && typeof id === 'string');
        if (validSeatIds.length === 0) {
            console.error('No valid seat IDs found:', selectedSeatIds);
            throw new Error('Không có ghế hợp lệ để xử lý');
        }

        try {
            setIsLoading(true);
            console.log(`${action}ing seats:`, validSeatIds, 'for sessionId:', sessionId);

            if (action === 'select') {
                const response = await seatSessionService.selectSeats({
                    showtimeId,
                    seatIds: validSeatIds,
                    sessionId
                });
                SocketService.emit('seat:selected', {
                    seatIds: validSeatIds,
                    showtimeId,
                    sessionId
                });

                if (!response || !response.success) {
                    throw new Error(response?.message || 'Không thể chọn ghế');
                }

                console.log('Select seats response:', response);
            } else {
                const response = await seatSessionService.unselectSeats({
                    showtimeId,
                    seatIds: validSeatIds,
                    sessionId
                });
                SocketService.emit('seat:unselected', {
                    seatIds: validSeatIds,
                    showtimeId,
                    sessionId
                });
                console.log('Unselect seats response:', response);
            }

            // Refresh occupied seats sau khi update
            setTimeout(() => {
                pollOccupiedSeats();
            }, 500); // Delay nhỏ để server update

        } catch (error) {
            console.error(`Error ${action}ing seats:`, error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // FIX 3: Cải thiện hàm getSeatIds
    const getSeatIds = (seatNames: string[]): string[] => {
        const seatIds = seatNames
            .map(seatName => {
                const seat = seats.find(s => s.name === seatName);
                if (!seat || !seat._id) {
                    console.warn('Seat not found or missing ID for:', seatName);
                    return null;
                }
                return seat._id;
            })
            .filter((id): id is string => Boolean(id));

        console.log('Converting seat names to IDs:', seatNames, '->', seatIds);
        return seatIds;
    };

    useEffect(() => {
        sessionStorage.setItem('currentShowtimeId', showtimeId);
    }, [showtimeId]);

    useEffect(() => {
        return () => {
            seatSessionService.clearSession(sessionId, showtimeId).catch(console.error);
        };
    }, [showtimeId, sessionId]);

    // Reset state khi đổi showtime
    useEffect(() => {
        if (prevShowtimeIdRef.current !== showtimeId) {
            console.log('Showtime changed, resetting states...');

            setSelectedSeats([]);
            setOccupiedSeats(new Set());
            setIsLoading(false);
            setCountdown(600);

            if (markTimeoutRef.current) {
                clearTimeout(markTimeoutRef.current);
                markTimeoutRef.current = null;
            }
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }

            const oldStorageKey = `bookingData_${prevShowtimeIdRef.current}`;
            localStorage.removeItem(oldStorageKey);

            prevShowtimeIdRef.current = showtimeId;
        }
    }, [showtimeId, setSelectedSeats]);

    // Khôi phục session từ server
    const restoreSessionFromServer = async () => {
        try {
            const response = await seatSessionService.validateSession(sessionId, showtimeId);
            if (response && response.success && response.data && response.data.isValid) {
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
    };

    // Khôi phục từ localStorage
    const restoreFromLocalStorage = () => {
        const storedData = localStorage.getItem(getStorageKey('bookingData'));
        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                const timeDiff = Date.now() - data.timestamp;

                if (timeDiff < 600000 &&
                    data.sessionId === sessionId &&
                    data.showtimeId === showtimeId) {

                    const availableSeats = data.selectedSeats.filter((seatName: string) => {
                        const seat = seats.find(s => s.name === seatName);
                        return seat && !seat.isBooked && !occupiedSeats.has(seat._id);
                    });

                    if (availableSeats.length > 0) {
                        setSelectedSeats(availableSeats);
                    }
                } else {
                    localStorage.removeItem(getStorageKey('bookingData'));
                }
            } catch (error) {
                console.error('Error parsing stored booking data:', error);
                localStorage.removeItem(getStorageKey('bookingData'));
            }
        }
    };

    // Setup polling và restore session
    useEffect(() => {
        const setupTimeout = setTimeout(() => {
            setOccupiedSeats(new Set());

            pollOccupiedSeats();

            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
            pollIntervalRef.current = setInterval(pollOccupiedSeats, 5000);

            restoreSessionFromServer().then(() => {
                if (selectedSeats.length === 0) {
                    restoreFromLocalStorage();
                }
            });
        }, 100);

        return () => {
            clearTimeout(setupTimeout);
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [showtimeId]);

    // Cleanup expired sessions
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            dispatch(cleanExpiredSessions());
        }, 30000);

        return () => clearInterval(cleanupInterval);
    }, [dispatch]);

    // LocalStorage management
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
    }, [selectedSeats, seats, showtimeId, sessionId]);

    // FIX 4: Cải thiện debounced seat selection
    useEffect(() => {
        if (markTimeoutRef.current) {
            clearTimeout(markTimeoutRef.current);
        }

        if (selectedSeats.length === 0) return;

        markTimeoutRef.current = setTimeout(async () => {
            const selectedSeatIds = getSeatIds(selectedSeats);

            if (selectedSeatIds.length === 0) {
                console.error('No valid seat IDs found for selected seats:', selectedSeats);
                return;
            }

            try {
                await updateSeatsOnServer(selectedSeatIds, 'select');

                selectedSeats.forEach(seatName => {
                    const seat = seats.find(s => s.name === seatName);
                    if (seat) {
                        dispatch(addLocalSeatSession({
                            seatId: seat._id,
                            seatName: seat.name,
                            showtimeId,
                            sessionId,
                            selectedAt: Date.now(),
                            expiresAt: Date.now() + 600000
                        }));
                    }
                });
            } catch (error) {
                console.error('Failed to select seats:', error);
                // Có thể thêm toast notification ở đây
            }
        }, 1000);

        return () => {
            if (markTimeoutRef.current) {
                clearTimeout(markTimeoutRef.current);
            }
        };
    }, [selectedSeats, seats, showtimeId, sessionId, dispatch]);

    const toggleSeat = async (seatName: string) => {
        if (isLoading) return;

        const selectedSeat = seats.find(seat => seat.name === seatName);
        if (!selectedSeat || selectedSeat.isBooked) return;

        if (occupiedSeats.has(selectedSeat._id)) {
            return;
        }

        if (selectedSeat.isSelecting && !selectedSeats.includes(seatName)) {
            return;
        }

        const isCurrentlySelected = selectedSeats.includes(seatName);
        let updatedSelectedSeats = [...selectedSeats];

        if (isCurrentlySelected) {
            updatedSelectedSeats = updatedSelectedSeats.filter(name => name !== seatName);
            setSelectedSeats(updatedSelectedSeats);

            try {
                await updateSeatsOnServer([selectedSeat._id], 'unselect');
                dispatch(removeLocalSeatSession({ seatId: selectedSeat._id, showtimeId }));
            } catch (error) {
                setSelectedSeats(selectedSeats);
                console.error('Failed to unselect seat:', error);
            }
        } else {
            updatedSelectedSeats.push(seatName);
            setSelectedSeats(updatedSelectedSeats);
        }
    };

    useEffect(() => {
        if (countdown === 0) {
            handleClearSession();
        }
    }, [countdown]);

    const handleClearSession = async () => {
        try {
            await seatSessionService.clearSession(sessionId, showtimeId);
            dispatch(clearLocalSessions({ showtimeId, sessionId }));
            setSelectedSeats([]);
            localStorage.removeItem(getStorageKey('bookingData'));
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    };

    const handleExtendSession = async () => {
        try {
            const response = await seatSessionService.extendSession(sessionId, showtimeId, 10);
            if (response && response.success) {
                setCountdown(600);
                console.log('Session extended successfully');
            }
        } catch (error) {
            console.error('Error extending session:', error);
        }
    };

    const totalPrice = selectedSeats.reduce((sum, name) => {
        const seat = seats.find(s => s.name === name);
        return seat ? sum + seat.seatTypePrice : sum;
    }, 0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const getRowsFromSeats = () => {
        const rows = [...new Set(seats.map(seat => seat.name.charAt(0)))].sort();
        return rows.map(row => ({
            row,
            seats: seats.filter(seat => seat.name.startsWith(row)).sort((a, b) => {
                const numA = parseInt(a.name.slice(1));
                const numB = parseInt(b.name.slice(1));
                return numA - numB;
            })
        }));
    };

    const groupedSeats = getRowsFromSeats();
    const lastRow = groupedSeats[groupedSeats.length - 1]?.row;

    const getSeatStatus = (seat: ISeat) => {
        const isSelected = selectedSeats.includes(seat.name);
        const isOccupiedByOther = occupiedSeats.has(seat._id);

        if (seat.isBooked) {
            return { className: styles.sold, disabled: true, tooltip: 'Ghế đã bán' };
        }

        if (isSelected) {
            return { className: styles.selected, disabled: false, tooltip: 'Ghế bạn đang chọn' };
        }

        if (seat.isSelecting || isOccupiedByOther) {
            return {
                className: styles.selecting,
                disabled: true,
                tooltip: 'Đang được chọn bởi người khác'
            };
        }

        return { className: styles.available, disabled: false, tooltip: 'Ghế trống' };
    };

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            if (selectedSeats.length > 0) {
                seatSessionService.clearSession(sessionId, showtimeId).catch(console.error);
            }
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
            if (markTimeoutRef.current) {
                clearTimeout(markTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className={styles.cinema}>
            <div className={styles.legend}>
                <span className={`${styles.seat} ${styles.available}`} /> Ghế trống
                <span className={`${styles.seat} ${styles.couple}`} /> Ghế đôi
                <span className={`${styles.seat} ${styles.selected}`} /> Ghế đang chọn
                <span className={`${styles.seat} ${styles.selecting}`} /> Đang được chọn
                <span className={`${styles.seat} ${styles.sold}`} /> Ghế đã bán
            </div>

            <div className={styles.screen}>MÀN HÌNH CHIẾU</div>

            {groupedSeats.map(group => {
                const isLastRow = group.row === lastRow;
                return (
                    <div
                        key={group.row}
                        className={`${styles.seats} ${isLastRow ? styles.coupleRow : ''}`}
                    >
                        {group.seats.map(seat => {
                            const isCoupleSeat = isLastRow;
                            const seatStatus = getSeatStatus(seat);

                            return (
                                <button
                                    key={seat._id}
                                    className={`${styles.seat} ${seatStatus.className} ${isCoupleSeat ? styles.couple : ''} ${isLoading ? styles.loading : ''}`}
                                    onClick={() => toggleSeat(seat.name)}
                                    disabled={seatStatus.disabled || isLoading}
                                    title={`${seat.name} - ${seat.seatTypeName} - ${seat.seatTypePrice.toLocaleString()} VND - ${seatStatus.tooltip}`}
                                >
                                    {seat.name}
                                </button>
                            );
                        })}
                    </div>
                );
            })}

            <div className={styles.summary}>
                <div>Ghế đã chọn: {selectedSeats.join(', ') || 'Chưa chọn'}</div>
                <div>Tổng tiền: {totalPrice.toLocaleString()} VND</div>
                <div className={styles.timeSection}>
                    <span>Thời gian còn lại: {formatTime(countdown)}</span>
                    {countdown < 120 && countdown > 0 && (
                        <button
                            className={styles.extendButton}
                            onClick={handleExtendSession}
                            disabled={isLoading}
                        >
                            Gia hạn
                        </button>
                    )}
                </div>
                {isLoading && <div className={styles.loadingText}>Đang xử lý...</div>}
            </div>
        </div>
    );
});

export default SeatList;