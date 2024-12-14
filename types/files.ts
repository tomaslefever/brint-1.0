import { User } from "./users";
import { Order } from "./order";

export type File = {
    id: string;
    created: string;
    updated: string;
    attachment: string;
    order: Order;
    type: 'model3d' | 'fotografiaPaciente' | 'fotografiaAdicional' | 'imagenRadiologica' | 'comparisons';
    owner: User;
    expand?: {
        owner?: User,
        order?: Order
    }
}
