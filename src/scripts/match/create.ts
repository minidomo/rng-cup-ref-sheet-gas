namespace MatchManager {
    interface InputResult {
        matchId: string;
        redTeamName: string;
        blueTeamName: string;
    }

    export function create() {
        const input = getInput();
        if (!input) {
            return;
        }

        const sheet = createSheet(input.matchId);
        if (!sheet) {
            return;
        }

        MatchManagerUtil.updateSheet(sheet, input);
    }

    function getInput(): InputResult | null {
        const UI = SpreadsheetApp.getUi();

        let response = UI.prompt('Enter the match id', UI.ButtonSet.OK_CANCEL);
        if (response.getSelectedButton() === UI.Button.CANCEL) {
            return null;
        }

        const matchId = response.getResponseText().trim();

        response = UI.prompt(`Enter red team's name`, UI.ButtonSet.OK_CANCEL);
        if (response.getSelectedButton() === UI.Button.CANCEL) {
            return null;
        }

        const redTeamName = response.getResponseText().trim();

        response = UI.prompt(`Enter blue team's name`, UI.ButtonSet.OK_CANCEL);
        if (response.getSelectedButton() === UI.Button.CANCEL) {
            return null;
        }

        const blueTeamName = response.getResponseText().trim();

        return {
            matchId,
            redTeamName,
            blueTeamName,
        };
    }

    function createSheet(matchId: string): GoogleAppsScript.Spreadsheet.Sheet | null {
        const UI = SpreadsheetApp.getUi();
        const SS = SpreadsheetApp.getActiveSpreadsheet();

        if (SS.getSheetByName(matchId)) {
            UI.alert(`Duplicate match id. Delete the existing one before creating another: ${matchId}`);
            return null;
        }

        const templateName = 'Match - Template';
        const template = SS.getSheetByName(templateName);
        if (!template) {
            UI.alert(`Could not find sheet with name: ${templateName}`);
            return null;
        }

        const sheet = template.copyTo(SS);
        sheet.setName(matchId);

        return sheet;
    }
}
