import { ISeat } from "../interfaces/seat";

export const seatData: ISeat[] = [];

const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

let id = 1;

for (let roomId = 1; roomId <= 6; roomId++) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        const seatCount = row === "J" ? 9 : 18;
        const typeId = rowIndex <= 2 ? 1 : rowIndex < 9 ? 2 : 3;

        for (let seatNum = 1; seatNum <= seatCount; seatNum++) {
            seatData.push({
                id: id++,
                roomId,
                typeId,
                name: `${row}${seatNum}`,
                isBooked: false
            });
        }
    }
}
