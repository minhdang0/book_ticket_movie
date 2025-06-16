import React, { memo, useEffect, useRef, useState } from 'react';
import styles from './SeatList.module.scss';
import { ISeat } from '../../../../utils/interfaces/seat';
import billService from '../../../../services/billService';
import seatApiService from '../../../../services/seatApiService';
import socketService from '../../../../services/socketService';
import {
    useSeatSelection,
    useSocketConnection,
    useSeatPolling,
    useSessionManagement,
    useLocalStorage
} from '../../../../hooks/useSeatSelection';
import Loading from '../../../../components/Loading/Loading';

interface IProduct {
    type: string;
    seat_number?: string;
    name?: string;
    quantity?: number;
    price?: number;
}

interface IBillState {
    id: string;
    user_id: string;
    showtime_id: string;
    total: number;
    payment_method: string;
    created_at: string;
    updated_at: string;
    product_list: IProduct[];
}

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
    // Use custom hooks
    const {
        occupiedSeats,
        setOccupiedSeats,
        isLoading,
        setIsLoading,
        sessionId,
        dispatch
    } = useSeatSelection(showtimeId);
    const [loading, setLoading] = useState<Boolean>(false);
    // Socket connection hook
    const { isConnected } = useSocketConnection(showtimeId, sessionId, setOccupiedSeats);

    // Seat polling hook
    const { pollOccupiedSeats } = useSeatPolling(showtimeId, sessionId, setOccupiedSeats);

    // Session management hook
    const {
        countdown,
        setCountdown,
        restoreSessionFromServer,
        clearSession,
    } = useSessionManagement(
        showtimeId,
        sessionId,
        selectedSeats,
        setSelectedSeats,
        seats,
        dispatch
    );

    // Local storage hook
    const { getSeatIds, restoreFromLocalStorage } = useLocalStorage(
        showtimeId,
        sessionId,
        selectedSeats,
        seats
    );

    // Component specific state
    const [bookedSeatsFromBills, setBookedSeatsFromBills] = useState<Set<string>>(new Set());
    const markTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load booked seats from bills
    useEffect(() => {
        const loadBooked = async () => {
            setLoading(true);
            try {
                const allBills: any = await billService.getAll();
                const booked = allBills
                    .filter((b: IBillState) => b.showtime_id === showtimeId)
                    .flatMap((b: IBillState) => b.product_list
                        .filter((p: any) => p.type === 'seat')
                        .map(p => p.seat_number));
                setBookedSeatsFromBills(new Set(booked));
            } catch (err) {
                console.error('Không tải được bills:', err);
            } finally {
                setLoading(false);
            }
        };
        loadBooked();

        return () => {
            setBookedSeatsFromBills(new Set());
        };
    }, [showtimeId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const allowedPaths = ['/payment', '/select-seat'];
            const currentPath = location.pathname || window.location.pathname;
            const shouldClear = !allowedPaths.some(path => currentPath.startsWith(path));

            if (shouldClear) {
                seatApiService.clearSession(sessionId, showtimeId).catch(console.error);
                localStorage.removeItem(`bookingData_${showtimeId}`);
                setSelectedSeats([]);
            }
        };
    }, [showtimeId, sessionId, setSelectedSeats]);

    // Initialize socket connection and restore session
    console.log(showtimeId, sessionId)

    useEffect(() => {
        const initializeConnection = async () => {
            try {
                // Connect socket if not connected
                if (!socketService.connected) {
                    await socketService.connect();
                }
                // Join showtime room
                await socketService.joinShowtime(showtimeId, sessionId);

                // Restore session from server first
                await restoreSessionFromServer();

                // If no seats restored from server, try localStorage
                if (selectedSeats.length === 0) {
                    const localData = restoreFromLocalStorage();
                    if (localData && localData.selectedSeats) {
                        setSelectedSeats(localData.selectedSeats);
                    }
                }

                // Start polling occupied seats
                pollOccupiedSeats();
            } catch (error) {
                console.error('Failed to initialize connection:', error);
            }
        };

        const timeoutId = setTimeout(initializeConnection, 100);
        return () => clearTimeout(timeoutId);
    }, [showtimeId, sessionId]);
    console.log(seats)
    // Debounced seat selection with seatApiService
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
                setIsLoading(true);

                // Use seatApiService to select seats
                const result = await seatApiService.selectSeats({
                    showtimeId,
                    seatIds: selectedSeatIds,
                    sessionId
                });

                // THAY ĐỔI: Cập nhật occupiedSeats từ response
                if (result.occupiedSeatIds && Array.isArray(result.occupiedSeatIds)) {
                    setOccupiedSeats(new Set(result.occupiedSeatIds));
                }

                // Refresh occupied seats after selection
                setTimeout(() => {
                    pollOccupiedSeats();
                }, 500);

            } catch (error) {
                console.error('Failed to select seats:', error);
                // Revert selection on error
                setSelectedSeats([]);
            } finally {
                setIsLoading(false);
            }
        }, 1000);

        return () => {
            if (markTimeoutRef.current) {
                clearTimeout(markTimeoutRef.current);
            }
        };
    }, [selectedSeats, getSeatIds, showtimeId, sessionId, setIsLoading, pollOccupiedSeats, setSelectedSeats, setOccupiedSeats]);

    // Toggle seat selection
    const toggleSeat = async (seatName: string) => {
        if (isLoading || seatApiService.loading) return;

        const selectedSeat = seats.find(seat => seat.name === seatName);
        if (!selectedSeat || selectedSeat.isBooked) return;

        // Check if seat is occupied by others
        if (occupiedSeats.has(selectedSeat._id)) {
            return;
        }

        const isCurrentlySelected = selectedSeats.includes(seatName);

        if (isCurrentlySelected) {
            // Unselect seat
            try {
                setIsLoading(true);

                await seatApiService.unselectSeats({
                    showtimeId,
                    seatIds: [selectedSeat._id],
                    sessionId
                });

                const updatedSeats = selectedSeats.filter(name => name !== seatName);
                setSelectedSeats(updatedSeats);

                // Refresh occupied seats
                setTimeout(() => {
                    pollOccupiedSeats();
                }, 500);

            } catch (error) {
                console.error('Failed to unselect seat:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Select seat - just update local state, server update handled by useEffect
            const updatedSeats = [...selectedSeats, seatName];
            setSelectedSeats(updatedSeats);
        }
    };

    // Handle extend session
    const handleExtendSession = async () => {
        try {
            setIsLoading(true);
            const success = await seatApiService.extendSession(sessionId, showtimeId, 10);
            if (success) {
                setCountdown(600);
                console.log('Session extended successfully');
            }
        } catch (error) {
            console.error('Error extending session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle clear session
    const handleClearSession = async () => {
        try {
            await clearSession();
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    };

    // Auto clear when countdown reaches 0
    useEffect(() => {
        if (countdown === 0) {
            handleClearSession();
        }
    }, [countdown]);

    // Helper functions
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

    const getSeatStatus = (seat: ISeat) => {
        const isSelected = selectedSeats.includes(seat.name);
        const isOccupiedByOther = occupiedSeats.has(seat._id);

        if (bookedSeatsFromBills.has(seat.name)) {
            return { className: styles.sold, disabled: true, tooltip: 'Ghế đã bán' };
        }

        if (seat.isBooked) {
            return { className: styles.sold, disabled: true, tooltip: 'Ghế đã bán' };
        }

        if (isSelected) {
            return { className: styles.selected, disabled: false, tooltip: 'Ghế bạn đang chọn' };
        }

        if (isOccupiedByOther || seat.isSelecting === true) {
            return {
                className: styles.selecting,
                disabled: true,
                tooltip: 'Đang được chọn bởi người khác'
            };
        }

        return { className: styles.available, disabled: false, tooltip: 'Ghế trống' };
    };

    // Calculate total price
    const totalPrice = selectedSeats.reduce((sum, name) => {
        const seat = seats.find(s => s.name === name);
        return seat ? sum + seat.seatTypePrice : sum;
    }, 0);

    const groupedSeats = getRowsFromSeats();
    const lastRow = groupedSeats[groupedSeats.length - 1]?.row;

    if (loading || isLoading) return <Loading />;

    return (
        <div className={styles.cinema}>
            <div className={styles.legend}>
                <span className={`${styles.seat} ${styles.available}`} /> Ghế trống
                <span className={`${styles.seat} ${styles.vip}`} /> Ghế VIP
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
                            const isVipSeat = seat.seatTypeName?.toLowerCase().includes('vip');
                            const seatStatus = getSeatStatus(seat);

                            return (
                                <button
                                    key={seat._id}
                                    className={`${styles.seat} ${seatStatus.className} ${isCoupleSeat ? styles.couple : ''} ${isVipSeat ? styles.vip : ''} ${(isLoading || seatApiService.loading) ? styles.loading : ''}`}
                                    onClick={() => toggleSeat(seat.name)}
                                    disabled={seatStatus.disabled || isLoading || seatApiService.loading}
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
                            disabled={isLoading || seatApiService.loading}
                        >
                            Gia hạn
                        </button>
                    )}
                </div>
                <div className={styles.connectionStatus}>
                    Socket: {isConnected ? '🟢 Kết nối' : '🔴 Mất kết nối'}
                </div>
                {(isLoading || seatApiService.loading) && (
                    <div className={styles.loadingText}>Đang xử lý...</div>
                )}
            </div>
        </div>
    );
});

export default SeatList;