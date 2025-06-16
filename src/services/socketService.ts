import { io, Socket } from 'socket.io-client';

export interface SocketEvents {
    // Server to Client events
    'seat:selected': (data: { seatId: string; seatName: string; showtimeId: string; sessionId: string; userId?: string }) => void;
    'seat:unselected': (data: { seatId: string; seatName: string; showtimeId: string; sessionId: string; userId?: string }) => void;
    'seat:cleared': (data: { seatIds: string[]; showtimeId: string; sessionId: string }) => void;
    'seat:expired': (data: { seatIds: string[]; showtimeId: string; sessionId: string }) => void;
    'seat:error': (data: { error: string; seatId?: string; showtimeId: string }) => void;
    'showtime:status': (data: { showtimeId: string; occupiedSeats: string[]; activeSessions: any[] }) => void;
    'session:extended': (data: { sessionId: string; showtimeId: string; expiresAt: number }) => void;
    'user:joined': (data: { userId: string; sessionId: string; showtimeId: string }) => void;
    'user:left': (data: { userId: string; sessionId: string; showtimeId: string }) => void;
}

export interface ClientEvents {
    // Client to Server events
    'seat:select': (data: { seatId: string; seatName: string; showtimeId: string; sessionId: string }) => void;
    'seat:unselect': (data: { seatId: string; seatName: string; showtimeId: string; sessionId: string }) => void;
    'showtime:join': (data: { showtimeId: string; sessionId: string; userId?: string }) => void;
    'showtime:leave': (data: { showtimeId: string; sessionId: string }) => void;
    'session:extend': (data: { sessionId: string; showtimeId: string; minutes: number }) => void;
    'heartbeat': (data: { sessionId: string; showtimeId: string }) => void;
}

type EventCallback<T = any> = (data: T) => void;

class SocketService {
    private socket: Socket | null = null;
    private isConnected: boolean = false;
    private currentShowtimeId: string | null = null;
    private currentSessionId: string | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private eventListeners: Map<string, Set<EventCallback>> = new Map();

    constructor(private serverUrl: string = 'http://localhost:4000') { }

    // Connect to server
    connect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve(true);
                return;
            }

            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
            });

            this.setupEventListeners();

            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000);

            this.socket.on('connect', () => {
                clearTimeout(timeout);
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('✅ Socket connected:', this.socket?.id);
                resolve(true);
            });

            this.socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                console.error('❌ Socket connection error:', error);
                reject(error);
            });
        });
    }

    // Setup internal event listeners
    private setupEventListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('✅ Socket reconnected:', this.socket?.id);

            // Rejoin showtime if we were in one
            if (this.currentShowtimeId && this.currentSessionId) {
                this.joinShowtime(this.currentShowtimeId, this.currentSessionId);
            }
        });

        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            this.stopHeartbeat();
            console.log('❌ Socket disconnected:', reason);
        });

        this.socket.on('reconnect_attempt', (attempt) => {
            this.reconnectAttempts = attempt;
            console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('❌ Failed to reconnect after', this.maxReconnectAttempts, 'attempts');
        });

        // Forward all events to registered listeners
        const eventNames: (keyof SocketEvents)[] = [
            'seat:selected',
            'seat:unselected',
            'seat:cleared',
            'seat:expired',
            'seat:error',
            'showtime:status',
            'session:extended',
            'user:joined',
            'user:left'
        ];

        eventNames.forEach(eventName => {
            this.socket!.on(eventName, (data) => {
                this.emitToListeners(eventName, data);
            });
        });
    }

    // Register event listener
    on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(callback as EventCallback);
    }

    // Unregister event listener
    off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
        const listeners = this.eventListeners.get(event);
        if (!listeners) return;

        if (callback) {
            listeners.delete(callback as EventCallback);
        } else {
            listeners.clear();
        }
    }

    // Emit to registered listeners
    private emitToListeners(event: string, data: any): void {
        const listeners = this.eventListeners.get(event);
        if (!listeners) return;

        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} listener:`, error);
            }
        });
    }

    // Join showtime room
    async joinShowtime(showtimeId: string, sessionId: string, userId?: string): Promise<void> {
        if (!this.socket || !this.isConnected) {
            throw new Error('Socket not connected');
        }

        this.currentShowtimeId = showtimeId;
        this.currentSessionId = sessionId;

        const joinData = {
            showtimeId,
            sessionId,
            userId: userId || `user_${Date.now()}`
        };

        console.log('🎬 Joining showtime:', joinData);
        this.socket.emit('showtime:join', joinData);
        this.startHeartbeat();
    }

    // Leave showtime room
    async leaveShowtime(): Promise<void> {
        if (!this.socket || !this.currentShowtimeId || !this.currentSessionId) {
            return;
        }

        console.log('🎬 Leaving showtime:', this.currentShowtimeId);
        this.socket.emit('showtime:leave', {
            showtimeId: this.currentShowtimeId,
            sessionId: this.currentSessionId
        });

        this.stopHeartbeat();
        this.currentShowtimeId = null;
        this.currentSessionId = null;
    }

    // Select seat
    selectSeat(seatId: string, seatName: string): void {
        if (!this.socket || !this.isConnected || !this.currentShowtimeId || !this.currentSessionId) {
            throw new Error('Socket not connected or not in showtime');
        }

        const data = {
            seatId,
            seatName,
            showtimeId: this.currentShowtimeId,
            sessionId: this.currentSessionId
        };

        console.log('🪑 Selecting seat:', data);
        this.socket.emit('seat:select', data);
    }

    // Unselect seat
    unselectSeat(seatId: string, seatName: string): void {
        if (!this.socket || !this.isConnected || !this.currentShowtimeId || !this.currentSessionId) {
            throw new Error('Socket not connected or not in showtime');
        }

        const data = {
            seatId,
            seatName,
            showtimeId: this.currentShowtimeId,
            sessionId: this.currentSessionId
        };

        console.log('🪑 Unselecting seat:', data);
        this.socket.emit('seat:unselect', data);
    }

    // Extend session
    extendSession(minutes: number = 10): void {
        if (!this.socket || !this.isConnected || !this.currentShowtimeId || !this.currentSessionId) {
            throw new Error('Socket not connected or not in showtime');
        }

        const data = {
            sessionId: this.currentSessionId,
            showtimeId: this.currentShowtimeId,
            minutes
        };

        console.log('⏱️ Extending session:', data);
        this.socket.emit('session:extend', data);
    }

    // Start heartbeat
    private startHeartbeat(): void {
        this.stopHeartbeat();

        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.isConnected && this.currentShowtimeId && this.currentSessionId) {
                this.socket.emit('heartbeat', {
                    sessionId: this.currentSessionId,
                    showtimeId: this.currentShowtimeId
                });
            }
        }, 30000); // 30 seconds
    }

    // Stop heartbeat
    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // Disconnect
    disconnect(): void {
        this.stopHeartbeat();

        if (this.currentShowtimeId && this.currentSessionId) {
            this.leaveShowtime();
        }

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.isConnected = false;
        this.currentShowtimeId = null;
        this.currentSessionId = null;
        this.eventListeners.clear();
    }

    // Getters
    get connected(): boolean {
        return this.isConnected && this.socket?.connected === true;
    }

    get showtimeId(): string | null {
        return this.currentShowtimeId;
    }

    get sessionId(): string | null {
        return this.currentSessionId;
    }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;