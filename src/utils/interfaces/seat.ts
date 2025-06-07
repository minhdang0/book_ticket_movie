export interface ISeat {
    _id: string;
    room_id: string;
    name: string;
    isBooked: boolean;
    isSelecting: boolean;
    seatTypeName: string;
    seatTypePrice: number;
}
