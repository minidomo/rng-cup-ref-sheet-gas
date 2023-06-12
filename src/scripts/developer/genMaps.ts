namespace Developer {
    export function genMaps() {
        const UI = SpreadsheetApp.getUi();

        // get sheet
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('temp');
        if (!sheet) {
            UI.alert('missing temp sheet');
            return;
        }

        // prompt mod
        const mod = promptMod();
        if (mod === null) {
            return;
        }

        // get SR for mod
        const mpsr = Settings.getStageModPickStarRatingEntries()
            .find(e => e.stage === 'Grand Finals')
            ?.modPickStarRatings.find(e => e.modPick.toLowerCase() === mod.toLowerCase());
        if (!mpsr) {
            UI.alert(`Could not find star rating for mod: ${mod}`);
            return;
        }

        // find random maps
        const maps = mdmappool.generateMaps({
            modPick: mpsr.modPick,
            mode: 'osu',
            amount: 'multiple',
            beatmapFilter: makeBeatmapFilter(mpsr.starRating),
        });

        if (!maps) {
            UI.alert('No maps found');
            return;
        }

        // make rows with maps
        const rows: any[][] = maps.map(mpmap => {
            const mods = mpmap.modPick.match(/.{2}/g) as string[];

            const attributes = adjustAttributes(
                {
                    bpm: parseFloat(mpmap.beatmap.bpm),
                    length: parseFloat(mpmap.beatmap.hit_length),
                    cs: parseFloat(mpmap.beatmap.diff_size),
                    hp: parseFloat(mpmap.beatmap.diff_drain),
                    ar: parseFloat(mpmap.beatmap.diff_approach),
                    od: parseFloat(mpmap.beatmap.diff_overall),
                },
                mods,
            );

            return [
                getTitleValue(mpmap.beatmap),
                parseFloat(mpmap.beatmap.difficultyrating),
                attributes.bpm,
                getLengthValue(Math.round(attributes.length)),
                attributes.cs,
                attributes.ar,
                attributes.od,
                attributes.hp,
                mpmap.beatmap.creator,
                mpmap.beatmap.beatmap_id,
                getMapValue(mpmap),
                getMapCommandValue(mpmap.beatmap.beatmap_id),
                getModCommandValue(mpmap.modPick),
                getScoreModeCommandValue(randomScoreMode()),
            ];
        });

        // get available rows
        const availableRows = getAvailableRows(sheet);

        // update sheet
        for (let i = 0; i < Math.min(rows.length, availableRows.length); i++) {
            const row = rows[i];
            sheet.getRange(availableRows[i], 1, 1, row.length).setValues([row]).setFontLine('none');
        }
    }

    function promptMod(): string | null {
        const UI = SpreadsheetApp.getUi();
        const response = UI.prompt('mod', UI.ButtonSet.OK_CANCEL);

        if (response.getSelectedButton() === UI.Button.OK) {
            return response.getResponseText().trim();
        } else {
            return null;
        }
    }

    function makeBeatmapFilter(starRating: number): mdmappool.BeatmapFilter {
        const f: mdmappool.BeatmapFilter = beatmap => {
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
            if (starRating - 0.1 > diffRating || diffRating > starRating + 0.2) {
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

    function getAvailableRows(sheet: GoogleAppsScript.Spreadsheet.Sheet): number[] {
        const ret: number[] = [];

        for (let i = 1; i < sheet.getMaxRows(); i++) {
            if (sheet.getRange(i, 1).isBlank()) {
                ret.push(i);
            }
        }

        return ret;
    }

    function getTitleValue(beatmap: OsuApiTypes.BeatmapResponse): string {
        const { title, artist, version, beatmap_id } = beatmap;
        let cellStr = `${artist} - ${title} [${version}]`;
        cellStr = cellStr.replace(/"/g, '""');

        return `=HYPERLINK("https://osu.ppy.sh/b/${beatmap_id}", "${cellStr}")`;
    }

    function getLengthValue(seconds: number): string {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;

        const minString = `${min}`.padStart(2, '0');
        const secString = `${sec}`.padStart(2, '0');

        return `${minString}:${secString}`;
    }

    function getMapValue(mpmap: mdmappool.MappoolMap): string {
        const { title, artist, version, beatmap_id } = mpmap.beatmap;
        let cellStr = `${mpmap.modPick}: ${artist} - ${title} [${version}]`;
        cellStr = cellStr.replace(/"/g, '""');

        return `=HYPERLINK("https://osu.ppy.sh/b/${beatmap_id}", "${cellStr}")`;
    }

    function getModCommandValue(modPick: string): string {
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

    function getScoreModeCommandValue(scoreMode: string): string {
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

    function getMapCommandValue(beatmapId: string): string {
        return `!mp map ${beatmapId} 0`;
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

    interface BeatmapAttributes {
        bpm: number;
        length: number;
        cs: number;
        ar: number;
        od: number;
        hp: number;
    }

    // referenced https://github.com/MaxOhn/rosu-pp/blob/68050f7848e0c197382663dfd081beef8d5b8fed/src/beatmap/attributes.rs
    function adjustAttributes<T extends Partial<BeatmapAttributes>>(attributes: T, mods: string[]) {
        const ret = Object.assign({}, attributes);
        const isDt = mods.includes('DT');
        const isHr = mods.includes('HR');

        if (typeof ret.bpm !== 'undefined') {
            if (isDt) {
                ret.bpm *= 1.5;
            }
        }

        if (typeof ret.length !== 'undefined') {
            if (isDt) {
                ret.length /= 1.5;
            }
        }

        if (typeof ret.cs !== 'undefined') {
            if (isHr) {
                ret.cs = Math.min(ret.cs * 1.3, 10);
            }
        }

        if (typeof ret.hp != 'undefined') {
            if (isHr) {
                ret.hp = Math.min(ret.hp * 1.4, 10);
            }
        }

        if (typeof ret.ar !== 'undefined') {
            let ar = ret.ar;

            if (isHr) {
                ar = Math.min(ar * 1.4, 10);
            }

            if (isDt) {
                const preempt = difficultyRange(ar, 1800, 1200, 450) / 1.5;
                if (preempt > 1200) {
                    ar = (1800 - preempt) / 120;
                } else {
                    ar = (1200 - preempt) / 150 + 5;
                }
            }

            ret.ar = ar;
        }

        if (typeof ret.od !== 'undefined') {
            let od = ret.od;

            if (isHr) {
                od = Math.min(od * 1.4, 10);
            }

            if (isDt) {
                const hitWindow = difficultyRange(od, 80, 50, 20) / 1.5;
                od = (80 - hitWindow) / 6;
            }

            ret.od = od;
        }

        return ret;
    }

    function difficultyRange(difficulty: number, min: number, mid: number, max: number) {
        if (difficulty > 5) {
            return mid + ((max - mid) * (difficulty - 5)) / 5;
        } else if (difficulty < 5) {
            return mid - ((mid - min) * (5 - difficulty)) / 5;
        } else {
            return mid;
        }
    }
}
