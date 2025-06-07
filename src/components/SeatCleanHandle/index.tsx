import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import seatService from '../../services/seatService';
import { clearLocalSessions, cleanExpiredSessions } from '../../features/showtime/showtimeSlice';
import { RootState, AppDispatch } from '../../store';
import { LocalSeatSession } from '../../utils/interfaces/sessionLocal';

const SeatCleanHandle: React.FC = () => {
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const { localSeatSessions } = useSelector((state: RootState) => state.showtime);

    // Debug function
    const debugState = () => {
        console.log('=== DEBUG REDUX STATE ===');
        console.log('Local seat sessions:', localSeatSessions);
        console.log('Total sessions:', localSeatSessions.length);
        console.log('=== END DEBUG ===');
    };

    // Tạo storage key unique cho showtime (giống SeatList)
    const getStorageKey = (key: string, showtimeId?: string) =>
        showtimeId ? `${key}_${showtimeId}` : key;

    // Lấy tất cả booking data từ localStorage (fallback)
    const getAllBookingDataFromStorage = () => {
        console.log('🔍 Getting booking data from localStorage as fallback...');

        const allData: Array<{
            selectedSeatIds: string[];
            showtimeId: string;
            storageKey: string;
        }> = [];

        // Duyệt qua tất cả localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key?.startsWith('bookingData_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');

                    if (data.selectedSeatIds && Array.isArray(data.selectedSeatIds) &&
                        data.selectedSeatIds.length > 0) {
                        allData.push({
                            selectedSeatIds: data.selectedSeatIds,
                            showtimeId: data.showtimeId,
                            storageKey: key
                        });
                    }
                } catch (error) {
                    console.error(`Error parsing booking data for key ${key}:`, error);
                    localStorage.removeItem(key);
                }
            }
        }

        // Backward compatibility
        const oldSelectedSeatIds = localStorage.getItem('selectedSeatIds');
        if (oldSelectedSeatIds) {
            try {
                const seatIds = JSON.parse(oldSelectedSeatIds);
                if (Array.isArray(seatIds) && seatIds.length > 0) {
                    allData.push({
                        selectedSeatIds: seatIds,
                        showtimeId: '',
                        storageKey: 'selectedSeatIds'
                    });
                }
            } catch (error) {
                console.error('Error parsing old selectedSeatIds:', error);
            }
        }

        return allData;
    };

    // Group sessions by showtime and sessionId
    const groupSessionsByShowtimeAndSession = () => {
        const groups: Record<string, {
            showtimeId: string;
            sessionId: string;
            seatIds: string[];
        }> = {};

        localSeatSessions.forEach((session: LocalSeatSession) => {
            const key = `${session.showtimeId}_${session.sessionId}`;
            if (!groups[key]) {
                groups[key] = {
                    showtimeId: session.showtimeId,
                    sessionId: session.sessionId,
                    seatIds: []
                };
            }
            groups[key].seatIds.push(session.seatId);
        });

        return Object.values(groups);
    };

    useEffect(() => {
        const currentPath = location.pathname;
        console.log('🔄 Path changed to:', currentPath);

        // Định nghĩa các trang liên quan đến booking/seat selection
        const seatRelatedPaths = [
            '/booking',
            '/seat-selection',
            '/seat',
            '/payment',
            '/checkout'
        ];

        const isInSeatRelatedPage = seatRelatedPaths.some(path =>
            currentPath.includes(path)
        );

        console.log('Is in seat related page?', isInSeatRelatedPage);

        if (!isInSeatRelatedPage) {
            console.log('🧹 Starting cleanup process...');
            debugState();

            const cleanupSeats = async () => {
                try {
                    // Priority 1: Cleanup từ Redux store (dữ liệu chính xác nhất)
                    if (localSeatSessions.length > 0) {
                        console.log(`🎯 Using Redux store - found ${localSeatSessions.length} sessions`);

                        const sessionGroups = groupSessionsByShowtimeAndSession();
                        console.log('📊 Session groups:', sessionGroups);

                        for (const group of sessionGroups) {
                            try {
                                console.log(`📡 Calling API to unmask seats for showtime ${group.showtimeId}:`, group.seatIds);

                                // Gọi API cleanup
                                await seatService.unmaskSeatsAsSelecting(group.seatIds);

                                console.log('✅ API cleanup success');

                                // Clear Redux store cho session này
                                dispatch(clearLocalSessions({
                                    showtimeId: group.showtimeId,
                                    sessionId: group.sessionId
                                }));

                                // Clear localStorage tương ứng
                                const storageKey = getStorageKey('bookingData', group.showtimeId);
                                localStorage.removeItem(storageKey);

                            } catch (apiError) {
                                console.error('❌ API cleanup error:', apiError);

                                // Vẫn clear store và localStorage dù API lỗi
                                dispatch(clearLocalSessions({
                                    showtimeId: group.showtimeId,
                                    sessionId: group.sessionId
                                }));

                                const storageKey = getStorageKey('bookingData', group.showtimeId);
                                localStorage.removeItem(storageKey);
                            }
                        }
                    } else {
                        // Fallback: Cleanup từ localStorage (khi Redux store trống)
                        console.log('📦 Using localStorage fallback');
                        const storageData = getAllBookingDataFromStorage();

                        if (storageData.length === 0) {
                            console.log('ℹ️ No data to cleanup');
                            return;
                        }

                        for (const data of storageData) {
                            try {
                                console.log(`📡 Fallback API call for seats:`, data.selectedSeatIds);
                                await seatService.unmaskSeatsAsSelecting(data.selectedSeatIds);
                                console.log('✅ Fallback API cleanup success');
                            } catch (apiError) {
                                console.error('❌ Fallback API cleanup error:', apiError);
                            }

                            // Clear localStorage
                            localStorage.removeItem(data.storageKey);
                        }
                    }

                    // Final cleanup - clear any remaining old format data
                    localStorage.removeItem('selectedSeats');
                    localStorage.removeItem('bookingSessionId');
                    localStorage.removeItem('selectedCombo');

                    // Clean expired sessions from Redux
                    dispatch(cleanExpiredSessions());

                    console.log('✅ Complete cleanup finished');

                } catch (error) {
                    console.error('❌ Critical error during cleanup:', error);

                    // Emergency cleanup
                    console.log('🚨 Emergency cleanup mode');

                    // Clear all Redux sessions
                    localSeatSessions.forEach((session: LocalSeatSession) => {
                        dispatch(clearLocalSessions({
                            showtimeId: session.showtimeId,
                            sessionId: session.sessionId
                        }));
                    });

                    // Clear all localStorage
                    const storageData = getAllBookingDataFromStorage();
                    storageData.forEach(data => {
                        localStorage.removeItem(data.storageKey);
                    });
                    localStorage.removeItem('selectedSeats');
                    localStorage.removeItem('bookingSessionId');
                    localStorage.removeItem('selectedCombo');

                }
            };

            const timeoutId = setTimeout(() => {
                console.log('⏰ Cleanup timeout triggered');
                cleanupSeats();
            }, 100);

            return () => {
                console.log('🛑 Cleanup timeout cleared');
                clearTimeout(timeoutId);
            };
        }
    }, [location.pathname, localSeatSessions, dispatch]);

    return null;
};

export default SeatCleanHandle;