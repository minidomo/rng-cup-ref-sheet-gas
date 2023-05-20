namespace RowUtil {
    export function isEmpty(row: any[]) {
        return row.every(StringUtil.isEmptyString);
    }

    export function hasEmpty(row: any[]) {
        return row.some(StringUtil.isEmptyString);
    }

    export function isFull(row: any[]) {
        return row.every(e => !StringUtil.isEmptyString(e));
    }
}
