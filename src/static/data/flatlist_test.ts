interface Item {
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
}

const data: Item[] = [
    {
        id: "id1",
        user_id: "user1",
        title: "item1",
        category_id: "CategoryID-00",
        description: "description1",
        brand: "brand1",
        type: "type1",
        url: "https://cocoscreenshot.blob.core.windows.net/screenshots/01JKD4ZTGES0P5HEK5QATVZCGB/temp/KakaoTalk_20250212_214950895_03.jpg",
        date: "2025-01-23",
        time: "20:00",
        from_location: "from1",
        to_location: "to1",
        location: "loc1",
        details: "detail1",
        start_date: "2025-01-23",
        end_date: "2025-01-24",
        code: "code1",
        created_at: "2025-01-23 20:00:00",
        updated_at: "2025-01-23 20:00:00"
    },
    {
        id: "id2",
        user_id: "user1",
        title: "item1",
        category_id: "CategoryID-00",
        description: "description1",
        brand: "brand1",
        type: "type1",
        url: "https://cocoscreenshot.blob.core.windows.net/screenshots/01JKD4ZTGES0P5HEK5QATVZCGB/temp/KakaoTalk_20250212_214950895_03.jpg",
        date: "2025-01-23",
        time: "20:00",
        from_location: "from1",
        to_location: "to1",
        location: "loc1",
        details: "detail1",
        start_date: "2025-01-23",
        end_date: "2025-01-24",
        code: "code1",
        created_at: "2025-01-23 20:00:00",
        updated_at: "2025-01-23 20:00:00"
    },
];

export default data;