namespace Settings {
    interface StageMapCountEntry {
        stage: string;
        count: number;
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

    export function getStageMapCountEntries(): StageMapCountEntry[] {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
        if (!sheet) {
            return [];
        }

        return sheet
            .getRange('B3:C12')
            .getValues()
            .filter(RowUtil.isFull)
            .map(row => {
                const ret: StageMapCountEntry = {
                    stage: StringUtil.convert(row[0]),
                    count: parseInt(row[1]),
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
            .getRange('F3:O3')
            .getValues()
            .reduce((prev, cur) => prev.concat(cur), [])
            .map(StringUtil.convert)
            .filter(e => !StringUtil.isEmptyString(e));

        return sheet
            .getRange('E4:O13')
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
            .getRange('Q3:R17')
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
