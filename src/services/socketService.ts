import { io, Socket } from 'socket.io-client';
import type { DefaultEventsMap } from '@socket.io/component-emitter';


type JoinOptions = {
    sessionId?: string;
    token?: string;
};

class SocketService {
    socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;
    isConnected: boolean = false;
    sessionId: string | null = null;
    showtimeId: string | null = null;
    heartbeatInterval: NodeJS.Timeout | null = null;

    // Kết nối tới server
    connect(serverUrl = 'http://localhost:4000') {
        if (this.socket) {
            this.disconnect();
        }

        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
        });

        this.setupEventListeners();
        return this.socket;
    }
    on(event: string, callback: (...args: any[]) => void) {
        this.socket?.on(event, callback);
    }
    off(event: string, callback?: (...args: any[]) => void) {
        // Nếu callback không truyền, sẽ remove tất cả listeners cho event đó
        if (callback) {
            this.socket?.off(event, callback);
        } else {
            this.socket?.off(event);
        }
    }
    emit(event: string, data: any) {
        this.socket?.emit(event, data);
    }


    // Lắng nghe các sự kiện socket
    setupEventListeners() {
        this.socket?.on('connect', () => {
            console.log('✅ Connected to server:', this.socket?.id);
            this.isConnected = true;
        });

        this.socket?.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server:', reason);
            this.isConnected = false;
            this.stopHeartbeat();
        });

        this.socket?.on('connect_error', (error: any) => {
            console.error('Connection error:', error);
        });

        this.socket?.on('initialSeatStatus', (data: any) => this.handleInitialSeatStatus(data));
        this.socket?.on('seatSelected', (data: any) => this.handleSeatSelected(data));
        this.socket?.on('seatUnselected', (data: any) => this.handleSeatUnselected(data));
        this.socket?.on('seatSelectionError', (data: any) => this.handleSeatSelectionError(data));
        this.socket?.on('seatStatusChanged', (data: any) => this.handleSeatStatusChanged(data));
        this.socket?.on('seatsExpired', (data: any) => this.handleSeatsExpired(data));
        this.socket?.on('heartbeatResponse', (data: any) => this.handleHeartbeatResponse(data));
        this.socket?.on('sessionExtended', (data: any) => this.handleSessionExtended(data));
        this.socket?.on('mySeats', (data: any) => this.handleMySeats(data));
        this.socket?.on('userJoined', (data: any) => console.log('👋 User joined:', data));
        this.socket?.on('userLeft', (data: any) => console.log('👋 User left:', data));
        this.socket?.on('error', (data: any) => this.handleError(data));
    }

    // Tham gia showtime
    joinShowtime(showtimeId: string, options: JoinOptions = {}) {
        if (!this.socket || !this.isConnected) {
            throw new Error('Socket not connected');
        }

        this.showtimeId = showtimeId;
        this.sessionId = options.sessionId || `session_${Date.now()}_${Math.random()}`;

        const joinData = {
            showtimeId,
            sessionId: this.sessionId,
            token: options.token || localStorage.getItem('authToken')
        };

        this.socket.emit('joinShowtime', joinData);
        this.startHeartbeat();

        return this.sessionId;
    }

    // Chọn ghế
    selectSeat(seatId: string, seatName: string) {
        if (!this.socket || !this.isConnected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('selectSeat', { seatId, seatName });
    }

    // Bỏ chọn ghế
    unselectSeat(seatId: string) {
        if (!this.socket || !this.isConnected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('unselectSeat', { seatId });
    }

    // Lấy danh sách ghế của tôi
    getMySeats() {
        if (!this.socket || !this.isConnected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('getMySeats');
    }

    // Gia hạn phiên
    extendSession(minutes = 10) {
        if (!this.socket || !this.isConnected) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('extendSession', { minutes });
    }

    // Bắt đầu heartbeat
    startHeartbeat() {
        this.stopHeartbeat();

        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.isConnected) {
                this.socket.emit('heartbeat');
            }
        }, 30000); // 30s
    }

    // Dừng heartbeat
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // Ngắt kết nối
    disconnect() {
        this.stopHeartbeat();

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.isConnected = false;
        this.sessionId = null;
        this.showtimeId = null;
    }

    // Các hàm handler (override tùy component)
    handleInitialSeatStatus(data: any) {
        console.log('Handle initial seat status:', data);
    }

    handleSeatSelected(data: any) {
        console.log('Handle seat selected:', data);
    }

    handleSeatUnselected(data: any) {
        console.log('Handle seat unselected:', data);
    }

    handleSeatSelectionError(data: any) {
        console.log('Handle seat selection error:', data);
    }

    handleSeatStatusChanged(data: any) {
        console.log('Handle seat status changed:', data);
    }

    handleSeatsExpired(data: any) {
        console.log('Handle seats expired:', data);
    }

    handleHeartbeatResponse(data: any) {
        console.log('Handle heartbeat response:', data);
    }

    handleSessionExtended(data: any) {
        console.log('Handle session extended:', data);
    }

    handleMySeats(data: any) {
        console.log('Handle my seats:', data);
    }

    handleError(data: any) {
        console.error('Handle error:', data);
    }
}

const socketService = new SocketService();
export default socketService;
