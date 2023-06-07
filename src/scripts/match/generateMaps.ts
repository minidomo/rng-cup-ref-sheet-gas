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

        const append = promptMapAppendage();
        if (typeof append === 'undefined') {
            return;
        }

        const stageName = StringUtil.convert(sheet.getRange('D11').getValue());
        const stageGeneral = Settings.getStageGeneralEntries().find(e => e.stage === stageName);

        if (!stageGeneral) {
            UI.alert(`Could not find stage settings: ${stageName}`);
            return;
        }

        // generate mappool
        const mappoolMaps = Array(stageGeneral.maps)
            .fill(null)
            .map(() => randomMap(stageName))
            .filter(e => e) as mdmappool.MappoolMap[];

        if (mappoolMaps.length === 0) {
            UI.alert(`Could not find beatmaps`);
            return;
        }

        // generate score modes for each map
        const scoreModes = Array(mappoolMaps.length)
            .fill(null)
            .map(() => randomScoreMode());

        const mappoolRange = sheet.getRange('H3:L27');
        if (!append) {
            // clear current mappool area
            mappoolRange.clearContent();
        }

        // get indices to put the maps in
        const availableRowIndices = Array(mappoolRange.getNumRows())
            .fill(null)
            .map((_, index) => index)
            .filter(offset => sheet.getRange(mappoolRange.getRow() + offset, mappoolRange.getColumn() + 1).isBlank());

        // update mappool area
        for (let i = 0; i < Math.min(mappoolMaps.length, availableRowIndices.length); i++) {
            const row = toMapRow(mappoolMaps[i], scoreModes[i]);
            sheet
                .getRange(mappoolRange.getRow() + availableRowIndices[i], mappoolRange.getColumn() + 1, 1, row.length)
                .setValues([row])
                .setFontLine('none');
        }
    }

    function promptMapAppendage(): boolean | undefined {
        const UI = SpreadsheetApp.getUi();
        const response = UI.prompt(
            `Append maps with existing ones on the sheet? Click a button.`,
            UI.ButtonSet.YES_NO_CANCEL,
        );
        if (response.getSelectedButton() === UI.Button.YES) {
            return true;
        } else if (response.getSelectedButton() === UI.Button.NO) {
            return false;
        } else {
            return;
        }
    }

    function randomMap(stageName: string): mdmappool.MappoolMap | null {
        const UI = SpreadsheetApp.getUi();
        const stageStarRatings = Settings.getStageModPickStarRatingEntries().find(e => e.stage === stageName);

        if (!stageStarRatings) {
            UI.alert(`Could not find stage star ratings: ${stageName}`);
            return null;
        }

        const modPick = randomModPick();
        const mpsrEntry = stageStarRatings.modPickStarRatings.find(e => e.modPick === modPick);

        if (!mpsrEntry) {
            UI.alert(`Could not find star rating for stage (${stageName}) and mod pick (${modPick})`);
            return null;
        }

        return mdmappool.generateMap({
            modPick,
            starRating: mpsrEntry.starRating,
            mode: 'osu',
            beatmapFilter: makeBeatmapFilter(mpsrEntry.starRating),
        });
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

    function makeBeatmapFilter(starRating: number): mdmappool.BeatmapFilter {
        const f: mdmappool.BeatmapFilter = beatmap => {
            const SR_ERROR = 0.1;
            const MAX_LENGTH = 380;
            const MIN_LENGTH = 180;

            if (beatmap.audio_unavailable !== '0') {
                return false;
            }

            if (beatmap.download_unavailable !== '0') {
                return false;
            }

            if (beatmap.approved !== '1') {
                return false;
            }

            const diffRating = parseFloat(beatmap.difficultyrating);
            if (Math.abs(diffRating - starRating) > SR_ERROR) {
                return false;
            }

            const totalLength = parseInt(beatmap.total_length);
            if (totalLength < MIN_LENGTH || totalLength > MAX_LENGTH) {
                return false;
            }

            return true;
        };

        return f;
    }

    function randomScoreMode(): string {
        const cutoffs: Record<string, number> = {};
        Settings.getWinConditionPercentageEntries()
            .filter(e => e.percentage > 0)
            .forEach((e, index, arr) => {
                let offset = 0;
                if (index > 0) {
                    const prevModPick = arr[index - 1].winCondition;
                    offset = cutoffs[prevModPick];
                }
                cutoffs[e.winCondition] = e.percentage + offset;
            });

        const r = Math.random();
        let winCondition = '';

        Object.entries(cutoffs).forEach(([wc, cutoff], index, arr) => {
            let prevCutoff = 0;
            if (index > 0) {
                const prevModPick = arr[index - 1][0];
                prevCutoff = cutoffs[prevModPick];
            }

            if (prevCutoff <= r && r < cutoff) {
                winCondition = wc;
            }
        });

        return winCondition;
    }

    function toModCommand(modPick: string) {
        let modStr = '';

        if (modPick === 'FM') {
            modStr = 'Freemod';
        } else if (modPick === 'NM') {
            modStr = 'NF';
        } else {
            const mods = modPick.match(/.{2}/g) as string[];
            modStr = `NF ${mods.join(' ')}`;
        }

        return `!mp mods ${modStr}`;
    }

    function toScoreModeCommand(scoreMode: string) {
        let scoreModeCode = '';

        if (scoreMode === 'Score') {
            scoreModeCode = '0';
        } else if (scoreMode === 'Accuracy') {
            scoreModeCode = '1';
        } else if (scoreMode === 'Combo') {
            scoreModeCode = '2';
        } else {
            scoreModeCode = '3';
        }

        return `!mp set 2 ${scoreModeCode}`;
    }

    function toMapCommand(beatmapId: string) {
        return `!mp map ${beatmapId} 0`;
    }

    function toMapName(mappoolMap: mdmappool.MappoolMap) {
        const { title, artist, version, beatmap_id } = mappoolMap.beatmap;
        let cellStr = `${mappoolMap.modPick}: ${artist} - ${title} [${version}]`;
        cellStr = cellStr.replace(/"/g, '""');

        return `=HYPERLINK("https://osu.ppy.sh/b/${beatmap_id}", "${cellStr}")`;
    }

    function toMapRow(mappoolMap: mdmappool.MappoolMap, scoreMode: string) {
        return [
            toMapName(mappoolMap),
            toMapCommand(mappoolMap.beatmap.beatmap_id),
            toModCommand(mappoolMap.modPick),
            toScoreModeCommand(scoreMode),
        ];
    }
}
