import { createConnection } from "typeorm"

export const testConn = (drop: boolean = false) => {
    return createConnection({
        "type": "postgres",
        "host": "localhost",
        "port": 5432,
        "username": "daniel",
        "password": "password",
        "database": "book-club-test",
        "synchronize": drop,
        "logging": false,
        "dropSchema": drop,
        "entities": [
            "./src/entity/**/*.ts"
        ],
    }
    )
}