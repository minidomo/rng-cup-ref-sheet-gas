namespace MatchManager {
    export function refresh() {
        const matchId = promptMatchId();
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

    function promptMatchId(): string | null {
        const UI = SpreadsheetApp.getUi();

        const response = UI.prompt('Enter the match id', UI.ButtonSet.OK_CANCEL);
        if (response.getSelectedButton() === UI.Button.CANCEL) {
            return null;
        }

        return response.getResponseText().trim();
    }
}
