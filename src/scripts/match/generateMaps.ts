namespace MatchManager {
    export function generateMaps() {
        const UI = SpreadsheetApp.getUi();

        const matchId = MatchManagerUtil.promptMatchId();
        if (!matchId) {
            return;
        }

        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(matchId);
        if (!sheet) {
            UI.alert(`Could not find sheet with name: ${matchId}`);
            return;
        }

        const stageName = StringUtil.convert(sheet.getRange('D11').getValue());
        const stageGeneral = Settings.getStageGeneralEntries().find(e => e.stage === stageName);

        if (!stageGeneral) {
            UI.alert(`Could not find stage settings: ${stageName}`);
            return;
        }

        // generate mappool

        // clear current mappool area
        const mappoolRange = sheet.getRange('H3:L27');
        mappoolRange.clearContent();

        // update mappool area
    }
}
