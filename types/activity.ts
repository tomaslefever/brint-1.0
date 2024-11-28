import { User } from "./users";

export type Activity = {
    id: string;
    created: string;
    updated: string;
    order: string;
    author: User;
    content: string;
    expand: {
        author: User;
    };
};
