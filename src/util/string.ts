namespace StringUtil {
    export function convert(value: any) {
        if (typeof value === 'string') {
            return value.trim();
        }

        return `${value}`;
    }

    export function isEmptyString(value: any) {
        return typeof value === 'string' && value === '';
    }

    export function capitalizeStart(str: string) {
        if (str.length === 0) {
            return str;
        }

        if (str.length === 1) {
            return str.toUpperCase();
        }

        return str[0].toUpperCase() + str.slice(1);
    }
}
