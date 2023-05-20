namespace SheetsUtil {
    export function getAllSheetNames() {
        const SS = SpreadsheetApp.getActiveSpreadsheet();
        return SS.getSheets().map(e => e.getSheetName());
    }
}
