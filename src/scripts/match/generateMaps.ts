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
        const stageStarRatings = Settings.getStageModPickStarRatingEntries().find(e => e.stage === stageName);

        if (!stageGeneral) {
            UI.alert(`Could not find stage settings: ${stageName}`);
            return;
        }

        if (!stageStarRatings) {
            UI.alert(`Could not find stage star ratings: ${stageName}`);
            return;
        }

        // generate mappool
        const mappoolMaps = Array(stageGeneral.maps)
            .map(() => randomModPick())
            .map(modPick => {
                const modPickStarRatingEntry = stageStarRatings.modPickStarRatings.find(e => e.modPick === modPick);
                if (!modPickStarRatingEntry) {
                    UI.alert(`Could not find star rating for stage (${stageName}) and mod pick (${modPick})`);
                    return;
                }

                return mdmappool.generateMap({
                    modPick,
                    starRating: modPickStarRatingEntry.starRating,
                });
            })
            .filter(e => e);

        // clear current mappool area
        const mappoolRange = sheet.getRange('H3:L27');
        mappoolRange.clearContent();

        // update mappool area
    }

    function randomModPick(): string {
        const cutoffs: Record<string, number> = {};
        Settings.getModPickPercentageEntries().forEach((e, index, arr) => {
            let offset = 0;
            if (index > 0) {
                const prevModPick = arr[index - 1].modPick;
                offset = cutoffs[prevModPick];
            }
            cutoffs[e.modPick] = e.percentage + offset;
        });

        const r = Math.random();
        let modPick = '';

        Object.entries(cutoffs).forEach(([pick, cutoff], index, arr) => {
            let prevCutoff = 0;
            if (index > 0) {
                const prevModPick = arr[index - 1][0];
                prevCutoff = cutoffs[prevModPick];
            }

            if (prevCutoff <= r && r < cutoff) {
                modPick = pick;
            }
        });

        return modPick;
    }
}
