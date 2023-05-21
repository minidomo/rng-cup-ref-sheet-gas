namespace MatchManagerUtil {
    interface SheetData {
        matchId?: string;
        redTeamName?: string;
        blueTeamName?: string;
    }

    export function updateSheet(sheet: GoogleAppsScript.Spreadsheet.Sheet, data: SheetData = {}) {
        if (data.matchId) {
            sheet.getRange('D7').setValue(data.matchId);
        }

        const redRange = sheet.getRange('C2');
        const redName = data.redTeamName ?? (redRange.getValue() as string);
        redRange.setValue(redName);
        updatePlayers(sheet.getRange('C22:E24'), redName);

        const blueRange = sheet.getRange('E2');
        const blueName = data.blueTeamName ?? (blueRange.getValue() as string);
        blueRange.setValue(blueName);
        updatePlayers(sheet.getRange('C25:E27'), blueName);
    }

    function updatePlayers(range: GoogleAppsScript.Spreadsheet.Range, teamName: string) {
        const teams = Teams.get();
        const team = teams.find(e => e.name === teamName);
        if (team) {
            range.setValues(TableUtil.fillTable(range.getValues(), team.players));
        }
    }

    export function promptMatchId(): string | null {
        const UI = SpreadsheetApp.getUi();

        const response = UI.prompt('Enter the match id', UI.ButtonSet.OK_CANCEL);
        if (response.getSelectedButton() === UI.Button.CANCEL) {
            return null;
        }

        return response.getResponseText().trim();
    }
}
