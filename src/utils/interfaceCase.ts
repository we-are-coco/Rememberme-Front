export interface Category {
    id: string;
    name: string;
}

export interface Item {
    id: string;
    user_id: string;
    title: string;
    category_id: string;
    description: string;
    brand: string;
    type: string;
    url: string;
    date: string;
    time: string;
    from_location: string;
    to_location: string;
    location: string;
    details: string;
    start_date: string;
    end_date: string;
    code: string;
    created_at: string;
    updated_at: string;
    is_used: boolean;
    notifications?: [];
}

export interface FormData {
    category_id: string;
    type: string;
    date: string;
    time: string;
    description: string;
    brand: string;
    title: string;
    code: string;
    from_location: string;
    to_location: string;
    location: string;
    details: string;
}

export interface AlertForm {
    title: string;
    content: string;
    showCancel: boolean;
    submit: any;
}

export interface LoginForm {
    email: string;
    password: string;
}

export interface RegisterForm {
    email: string;
    name: string;
    password: string;
    passwordCheck: string;
}

export interface UserData {
    id: string;
    name: string;
    email: string;
}