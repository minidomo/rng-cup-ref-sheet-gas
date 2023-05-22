namespace Debug {
    export function test() {
        const UI = SpreadsheetApp.getUi();
        UI.alert(JSON.stringify(Settings.getStageGeneralEntries(), null, 4));
        UI.alert(JSON.stringify(Settings.getStageModPickStarRatingEntries(), null, 4));
        UI.alert(JSON.stringify(Settings.getModPickPercentageEntries(), null, 4));
    }
}
