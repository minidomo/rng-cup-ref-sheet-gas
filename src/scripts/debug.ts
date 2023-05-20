namespace Debug {
    export function test() {
        const UI = SpreadsheetApp.getUi();
        UI.alert(JSON.stringify(Settings.getStageMapCountEntries(), null, 4));
        UI.alert(JSON.stringify(Settings.getStageModStarRatingEntries(), null, 4));
        UI.alert(JSON.stringify(Settings.getModCombinationPercentageEntries(), null, 4));
    }
}
