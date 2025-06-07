import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './SeatList.module.scss';
import { ISeat } from '../../../../utils/interfaces/seat';
import seatService from '../../../../services/seatService';
import {
    addLocalSeatSession,
    removeLocalSeatSession,
    cleanExpiredSessions,
    clearLocalSessions
} from '../../../../features/showtime/showtimeSlice';
import { AppDispatch, RootState } from '../../../../store';
import { LocalSeatSession } from './../../../../utils/interfaces/sessionLocal';

type Props = {
    selectedSeats: string[];
    setSelectedSeats: React.Dispatch<React.SetStateAction<string[]>>;
    seats: ISeat[];
    showtimeId: string;
};

const SeatList: React.FC<Props> = ({
    selectedSeats,
    setSelectedSeats,
    seats,
    showtimeId
}) => {
    const [countdown, setCountdown] = useState<number>(600);
    const markTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [pendingMarkIds, setPendingMarkIds] = useState<string[]>([]);
    const [pendingUnmaskIds, setPendingUnmaskIds] = useState<string[]>([]);
    const [sessionId] = useState<string>(() => `session_${Date.now()}_${Math.random()}`);

    const dispatch = useDispatch<AppDispatch>();
    const { localSeatSessions } = useSelector((state: RootState) => state.showtime);
    // Tạo storage key unique cho showtime
    const getStorageKey = (key: string) => `${key}_${showtimeId}`;

    // Memoized - Ghế đang được chọn bởi session khác
    const occupiedSeats = useMemo(() => {
        const now = Date.now();
        const currentSessions = localSeatSessions.filter(
            (s: LocalSeatSession) => s.showtimeId === showtimeId &&
                s.sessionId !== sessionId &&
                s.expiresAt > now
        );
        return new Set(currentSessions.map((s: LocalSeatSession) => s.seatId));
    }, [localSeatSessions, showtimeId, sessionId]);

    // Cleanup expired sessions định kỳ
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            dispatch(cleanExpiredSessions());
        }, 30000); // 30 giây

        return () => clearInterval(cleanupInterval);
    }, [dispatch]);

    // LocalStorage management với showtimeId
    useEffect(() => {
        const selectedSeatIds = selectedSeats
            .map(seatName => seats.find(s => s.name === seatName)?._id)
            .filter((id): id is string => typeof id === 'string');


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

    // Khôi phục từ localStorage
    useEffect(() => {
        const storedData = localStorage.getItem(getStorageKey('bookingData'));

        if (storedData) {
            try {
                const data = JSON.parse(storedData);
                const timeDiff = Date.now() - data.timestamp;

                // Kiểm tra session còn hiệu lực (10 phút)
                if (timeDiff < 600000 &&
                    data.sessionId === sessionId &&
                    data.showtimeId === showtimeId) {

                    const availableSeats = data.selectedSeats.filter((seatName: string) => {
                        const seat = seats.find(s => s.name === seatName);
                        return seat && !seat.isBooked && !occupiedSeats.has(seat._id);
                    });

                    if (availableSeats.length > 0) {
                        setSelectedSeats(availableSeats);

                        // Thêm vào local sessions
                        availableSeats.forEach((seatName: string) => {
                            const seat = seats.find(s => s.name === seatName);
                            if (seat) {
                                dispatch(addLocalSeatSession({
                                    seatId: seat._id,
                                    seatName: seat.name,
                                    showtimeId,
                                    sessionId,
                                    selectedAt: Date.now(),
                                    expiresAt: Date.now() + 600000 // 10 phút
                                }));
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error parsing stored booking data:', error);
                localStorage.removeItem(getStorageKey('bookingData'));
            }
        }
    }, [seats, showtimeId, sessionId, dispatch, occupiedSeats, setSelectedSeats]);

    // API calls với retry logic
    useEffect(() => {
        if (pendingMarkIds.length === 0) return;

        if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);

        markTimeoutRef.current = setTimeout(async () => {
            try {
                // Gọi API hiện tại (không cần thay đổi backend)
                await seatService.markSeatsAsSelecting(pendingMarkIds);

                // Cập nhật local sessions
                pendingMarkIds.forEach(seatId => {
                    const seat = seats.find(s => s._id === seatId);
                    if (seat) {
                        dispatch(addLocalSeatSession({
                            seatId,
                            seatName: seat.name,
                            showtimeId,
                            sessionId,
                            selectedAt: Date.now(),
                            expiresAt: Date.now() + 600000 // 10 phút
                        }));
                    }
                });

                setPendingMarkIds([]);
            } catch (error) {
                console.error('Error marking seats:', error);
                // Retry logic hoặc rollback local state
                setPendingMarkIds([]);
            }
        }, 1000);
    }, [pendingMarkIds, seats, showtimeId, sessionId, dispatch]);

    useEffect(() => {
        if (pendingUnmaskIds.length === 0) return;

        if (markTimeoutRef.current) clearTimeout(markTimeoutRef.current);

        markTimeoutRef.current = setTimeout(async () => {
            try {
                await seatService.unmaskSeatsAsSelecting(pendingUnmaskIds);

                // Xóa khỏi local sessions
                pendingUnmaskIds.forEach(seatId => {
                    dispatch(removeLocalSeatSession({ seatId, showtimeId }));
                });

                setPendingUnmaskIds([]);
            } catch (error) {
                console.error('Error unmarking seats:', error);
                setPendingUnmaskIds([]);
            }
        }, 1000);
    }, [pendingUnmaskIds, showtimeId, dispatch]);

    const toggleSeat = (seatName: string) => {
        const selectedSeat = seats.find(seat => seat.name === seatName);
        if (!selectedSeat || selectedSeat.isBooked) return;

        // Kiểm tra ghế có đang được chọn bởi session khác không
        if (occupiedSeats.has(selectedSeat._id)) {
            return; // Không cho phép chọn
        }

        // Kiểm tra backend status (isSelecting từ API)
        if (selectedSeat.isSelecting && !selectedSeats.includes(seatName)) {
            return; // Ghế đang được chọn ở backend
        }

        let updatedSelectedSeats = [...selectedSeats];
        const isCurrentlySelected = selectedSeats.includes(seatName);
        const seatId = selectedSeat._id;

        if (isCurrentlySelected) {
            updatedSelectedSeats = updatedSelectedSeats.filter(name => name !== seatName);
            setSelectedSeats(updatedSelectedSeats);
            setPendingUnmaskIds(prev => [...prev, seatId]);
        } else {
            updatedSelectedSeats.push(seatName);
            setSelectedSeats(updatedSelectedSeats);
            setPendingMarkIds(prev => [...prev, seatId]);
        }
    };

    // Cleanup khi component unmount
    useEffect(() => {
        const selectedSeatIds = selectedSeats.flatMap(seatName => {
            const seatId = seats.find(s => s.name === seatName)?._id;
            return seatId ? [seatId] : [];
        });

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


    // Tự động clear sessions khi countdown = 0
    useEffect(() => {
        if (countdown === 0) {
            dispatch(clearLocalSessions({ showtimeId, sessionId }));
            setSelectedSeats([]);
            localStorage.removeItem(getStorageKey('bookingData'));
        }
    }, [countdown, dispatch, showtimeId, sessionId, setSelectedSeats]);

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

    // Helper function để xác định trạng thái ghế
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
                                    className={`${styles.seat} ${seatStatus.className} ${isCoupleSeat ? styles.couple : ''}`}
                                    onClick={() => toggleSeat(seat.name)}
                                    disabled={seatStatus.disabled}
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
                <div>Thời gian còn lại: {formatTime(countdown)}</div>
            </div>
        </div>
    );
};

export default SeatList;