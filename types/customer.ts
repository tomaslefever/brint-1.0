import { Order } from "./order";

export type Customer = {
    id: string;
    name: string | null;
    lastname: string | null;
    surname: string | null;
    age: string | null;
    rut: string | null;
    address: string | null;
    email: string | null;
    phone: string | null;
    orders?: Order[];
    created_by?: string;
};
