namespace Settings {
    interface StageGeneralEntry {
        stage: string;
        maps: number;
        bestOf: number;
    }

    interface ModStarRating {
        mod: string;
        starRating: number;
    }

    interface StageModStarRatingEntry {
        stage: string;
        modStarRatings: ModStarRating[];
    }

    interface ModCombinationPercentageEntry {
        modCombination: string;
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

    export function getStageModStarRatingEntries(): StageModStarRatingEntry[] {
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
                const modStarRatings = mods.map((mod, index) => {
                    const msr: ModStarRating = {
                        mod,
                        starRating: parseFloat(row[index + offset]),
                    };

                    return msr;
                });

                const ret: StageModStarRatingEntry = {
                    stage: StringUtil.convert(row[0]),
                    modStarRatings,
                };

                return ret;
            });
    }

    export function getModCombinationPercentageEntries(): ModCombinationPercentageEntry[] {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
        if (!sheet) {
            return [];
        }

        return sheet
            .getRange('R3:S17')
            .getValues()
            .filter(RowUtil.isFull)
            .map(row => {
                const ret: ModCombinationPercentageEntry = {
                    modCombination: StringUtil.convert(row[0]),
                    percentage: parseFloat(row[1]),
                };

                return ret;
            });
    }
}
