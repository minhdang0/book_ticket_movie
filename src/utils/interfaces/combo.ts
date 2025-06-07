export interface ICombo {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
}

export interface ComboItem extends ICombo {
    quantity: number;
}
