namespace Teams {
    interface Team {
        name: string;
        players: string[];
    }

    export function get(): Team[] {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Rosters');
        if (!sheet) {
            return [];
        }

        return sheet
            .getRange('A2:E')
            .getValues()
            .filter(RowUtil.isFull)
            .map(row => {
                const players = row.slice(1).map(StringUtil.convert);

                const ret: Team = {
                    name: StringUtil.convert(row[0]),
                    players,
                };

                return ret;
            });
    }
}
