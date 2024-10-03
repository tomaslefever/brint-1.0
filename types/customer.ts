export type Customer = {
    id?: string; // Añade esta línea si no estaba incluida
    name: string;
    lastname: string;
    rut: string;
    address: string;
    email: string;
    phone: string;
    orders?: string; // Opcional si no siempre se incluye al crear
    created_by?: string; // Opcional si no siempre se incluye al crear
};