namespace Developer {
    export function debug() {
        const UI = SpreadsheetApp.getUi();
        const gf = Settings.getStageModPickStarRatingEntries().find(e => e.stage === 'Grand Finals');
        UI.alert(JSON.stringify(gf, null, 4));
    }
}
