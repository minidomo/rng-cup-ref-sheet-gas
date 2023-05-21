namespace MatchManager {
    export function refresh() {
        const matchId = MatchManagerUtil.promptMatchId();
        if (!matchId) {
            return;
        }

        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(matchId);
        if (!sheet) {
            const UI = SpreadsheetApp.getUi();
            UI.alert(`Could not find sheet with name: ${matchId}`);
            return;
        }

        MatchManagerUtil.updateSheet(sheet);
    }
}
