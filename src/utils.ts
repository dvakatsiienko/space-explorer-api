/* Core */
import SQL from 'sequelize';

export const paginateResults = ({
    // @ts-ignore
    after: cursor,
    pageSize = 20,
    // @ts-ignore
    results,
    getCursor = () => null,
}) => {
    if (pageSize < 1) return [];

    if (!cursor) return results.slice(0, pageSize);

    // @ts-ignore
    const cursorIndex = results.findIndex(item => {
        // @ts-ignore
        let itemCursor = item.cursor ? item.cursor : getCursor(item);

        return itemCursor ? cursor === itemCursor : false;
    });

    // console.log(cursorIndex);

    if (cursorIndex >= 0) {
        if (cursorIndex === results.length - 1) {
            return [];
        } else {
            return results.slice(
                cursorIndex + 1,
                Math.min(results.length, cursorIndex + 1 + pageSize),
            );
        }
    } else {
        return results.slice(0, pageSize);
    }
};

export const createStore = () => {
    const Op = SQL.Op;
    const operatorsAliases = {
        $in: Op.in,
    };

    // @ts-ignore
    const db = new SQL('database', 'username', 'password', {
        dialect: 'sqlite',
        storage: './store.sqlite',
        operatorsAliases,
        logging: false,
    });

    const users = db.define('user', {
        id: {
            type: SQL.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        createdAt: SQL.DATE,
        updatedAt: SQL.DATE,
        email: SQL.STRING,
        token: SQL.STRING,
    });

    const trips = db.define('trip', {
        id: {
            type: SQL.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        createdAt: SQL.DATE,
        updatedAt: SQL.DATE,
        launchId: SQL.INTEGER,
        userId: SQL.INTEGER,
    });

    return { users, trips };
};
