export type Company = {
    id?: string; // Añade esta línea si no estaba incluida
    name: string;
    address: string;
    comuna: string;
    phone: string;
    logo?: string;
    created_by?: string; // Opcional si no siempre se incluye al crear
};