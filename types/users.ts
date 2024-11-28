import { Company } from "./company";

export type User = {
    id: string;
    created: string;
    updated: string;
    email: string;
    name: string;
    lastname: string;
    last_login: string;
    avatar: string;
    role: "admin" | "manager" | "author" | "client" | "editor" | "user";
    company: Company[];
}
