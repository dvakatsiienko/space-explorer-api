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
