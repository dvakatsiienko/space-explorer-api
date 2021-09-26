/* Instruments */
import { LaunchModel } from './datasources';

interface Options {
    after: number;
    pageSize: number;
    results: LaunchModel[];
    getCursor?: () => null;
}

export const paginateResults = ({
    after: cursor,
    pageSize = 20,
    results,
    getCursor = () => null,
}: Options) => {
    if (pageSize < 1) return [];

    if (!cursor) return results.slice(0, pageSize);

    const cursorIndex = results.findIndex(item => {
        let itemCursor = item.flightNumber ? item.flightNumber : getCursor();

        return itemCursor ? cursor === itemCursor : false;
    });

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
