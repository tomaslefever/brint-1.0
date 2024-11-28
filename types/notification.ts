import { User } from "./users";
import { Order } from "./order";
export interface Notification {
    id: string;
    notification_id: string;
    created: string;
    updated: string;
    user: string;
    read: boolean;
    message: string;
    type: "info" | "warning" | "error" | "success" | "comment";
    expand?: {
        user?: User,
        order?: Order
    }
}
