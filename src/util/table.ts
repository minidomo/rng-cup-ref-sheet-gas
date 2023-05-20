namespace TableUtil {
    export function toTable(data: any[], columns: number): any[][] {
        const rows = Math.ceil(data.length / columns);
        const arr = Array(rows).fill(Array(columns).fill(''));
        fillTable(arr, data);
        return arr;
    }

    export function fillTable(table: any[][], data: any[]): any[][] {
        let r = 0;
        let c = 0;
        data.forEach(e => {
            table[r][c] = e;
            c++;
            if (c === table[r].length) {
                r++;
                c = 0;
            }
        });

        return table;
    }
}
