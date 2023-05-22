namespace Settings {
    interface StageGeneralEntry {
        stage: string;
        maps: number;
        bestOf: number;
    }

    interface ModPickStarRating {
        modPick: string;
        starRating: number;
    }

    interface StageModPickStarRatingEntry {
        stage: string;
        modPickStarRatings: ModPickStarRating[];
    }

    interface ModPickPercentageEntry {
        modPick: string;
        percentage: number;
    }

    interface WinConditionPercentageEntry {
        winCondition: string;
        percentage: number;
    }

    export function getStageGeneralEntries(): StageGeneralEntry[] {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
        if (!sheet) {
            return [];
        }

        return sheet
            .getRange('B3:D12')
            .getValues()
            .filter(RowUtil.isFull)
            .map(row => {
                const ret: StageGeneralEntry = {
                    stage: StringUtil.convert(row[0]),
                    maps: parseInt(row[1]),
                    bestOf: parseInt(row[2]),
                };

                return ret;
            });
    }

    export function getStageModPickStarRatingEntries(): StageModPickStarRatingEntry[] {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
        if (!sheet) {
            return [];
        }

        const mods = sheet
            .getRange('G3:P3')
            .getValues()
            .reduce((prev, cur) => prev.concat(cur), [])
            .map(StringUtil.convert)
            .filter(e => !StringUtil.isEmptyString(e));

        return sheet
            .getRange('F4:P13')
            .getValues()
            .filter(row => !RowUtil.isEmpty(row))
            .map(row => {
                const offset = 1;
                const modPickStarRatings = mods.map((mod, index) => {
                    const msr: ModPickStarRating = {
                        modPick: mod,
                        starRating: parseFloat(row[index + offset]),
                    };

                    return msr;
                });

                const ret: StageModPickStarRatingEntry = {
                    stage: StringUtil.convert(row[0]),
                    modPickStarRatings: modPickStarRatings,
                };

                return ret;
            });
    }

    export function getModPickPercentageEntries(): ModPickPercentageEntry[] {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
        if (!sheet) {
            return [];
        }

        return sheet
            .getRange('R3:S17')
            .getValues()
            .filter(RowUtil.isFull)
            .map(row => {
                const ret: ModPickPercentageEntry = {
                    modPick: StringUtil.convert(row[0]),
                    percentage: parseFloat(row[1]),
                };

                return ret;
            });
    }

    export function getWinConditionPercentageEntries(): WinConditionPercentageEntry[] {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
        if (!sheet) {
            return [];
        }

        return sheet
            .getRange('U3:V6')
            .getValues()
            .filter(RowUtil.isFull)
            .map(row => {
                const ret: WinConditionPercentageEntry = {
                    winCondition: StringUtil.convert(row[0]),
                    percentage: parseFloat(row[1]),
                };

                return ret;
            });
    }
}
