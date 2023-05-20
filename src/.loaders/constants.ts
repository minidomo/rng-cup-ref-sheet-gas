// https://developers.google.com/apps-script/reference

namespace Constants {
    export const SS = SpreadsheetApp.getActiveSpreadsheet();
    export const UI = SpreadsheetApp.getUi();
    export const CACHE = CacheService.getDocumentCache();
    export const PROPERTIES = PropertiesService.getScriptProperties();

    export namespace Sheets {}
}
