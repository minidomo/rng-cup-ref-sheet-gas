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

        updateSheet(sheet, input);
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
            UI.alert('Duplicate match id. Delete the existing one before creating another');
            return null;
        }

        const template = SS.getSheetByName('Match - Template');
        if (!template) {
            UI.alert('Could not find sheet with name "Match - Template"');
            return null;
        }

        const sheet = template.copyTo(SS);
        sheet.setName(matchId);

        return sheet;
    }

    function updateSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet, input: InputResult) {
        sheet.getRange('C2').setValue(input.redTeamName);
        sheet.getRange('E2').setValue(input.blueTeamName);
        sheet.getRange('D7').setValue(input.matchId);

        const teams = Teams.get();

        const red = teams.find(e => e.name === input.redTeamName);
        if (red) {
            const playerRange = sheet.getRange('C22:E24');
            playerRange.setValues(TableUtil.fillTable(playerRange.getValues(), red.players));
        }

        const blue = teams.find(e => e.name === input.blueTeamName);
        if (blue) {
            const playerRange = sheet.getRange('C25:E27');
            playerRange.setValues(TableUtil.fillTable(playerRange.getValues(), blue.players));
        }
    }
}
