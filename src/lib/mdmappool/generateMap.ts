namespace mdmappool {
    export function generateMap(config: mdmappool.GenerationConfiguration): mdmappool.MappoolMap | null {
        const attempts = 5;
        const beatmapParams = makeBeatmapParams(config);

        for (let i = 0; i < attempts; i++) {
            let beatmaps = findBeatmaps(beatmapParams);

            if (config.beatmapFilter) {
                beatmaps = beatmaps.filter(config.beatmapFilter);
            }

            // const beatmap = getClosestStarRatingBeatmap(beatmaps, config.starRating);
            const beatmap = randomBeatmap(beatmaps);
            if (beatmap) {
                return {
                    beatmap,
                    modPick: config.modPick,
                };
            }
        }

        return null;
    }

    function findBeatmaps(params: Partial<OsuApiTypes.BeatmapParams>): OsuApiTypes.BeatmapResponse[] {
        const attempts = 2;
        const ret: OsuApiTypes.BeatmapResponse[] = [];

        for (let i = 0; i < attempts; i++) {
            const beatmaps = OsuApi.getBeatmaps(params);
            if (beatmaps) {
                ret.push(...beatmaps);
            }
        }

        return ret;
    }

    function getClosestStarRatingBeatmap(
        beatmaps: OsuApiTypes.BeatmapResponse[],
        starRating: number,
    ): OsuApiTypes.BeatmapResponse | null {
        if (beatmaps.length === 0) {
            return null;
        }

        return beatmaps.reduce((prev, cur) => {
            const diff1 = Math.abs(parseFloat(prev.difficultyrating) - starRating);
            const diff2 = Math.abs(parseFloat(cur.difficultyrating) - starRating);
            return diff1 < diff2 ? prev : cur;
        }, beatmaps[0]);
    }

    function randomBeatmap(beatmaps: OsuApiTypes.BeatmapResponse[]): OsuApiTypes.BeatmapResponse | null {
        if (beatmaps.length === 0) {
            return null;
        }

        const rIndex = Math.floor(Math.random() * beatmaps.length);
        return beatmaps[rIndex];
    }

    function makeBeatmapParams(config: mdmappool.GenerationConfiguration): Partial<OsuApiTypes.BeatmapParams> {
        const ret: Partial<OsuApiTypes.BeatmapParams> = {};

        if (config.mode === 'osu') {
            ret['m'] = '0';
        } else if (config.mode === 'taiko') {
            ret['m'] = '1';
        } else if (config.mode === 'ctb') {
            ret['m'] = '2';
        } else if (config.mode === 'mania') {
            ret['m'] = '3';
        }

        ret['mods'] = `${getModValue(config.modPick)}`;

        if (config.timestamp) {
            ret['since'] = config.timestamp;
        } else {
            ret['since'] = randomTimestamp();
        }

        return ret;
    }

    function getModValue(modPick: string) {
        let ret = 0;

        const mods = modPick.match(/.{2}/g);

        if (mods?.includes('HR')) {
            ret |= 16;
        }

        if (mods?.includes('DT')) {
            ret |= 64;
        }

        return ret;
    }

    function randomTimestamp() {
        const date = randomDate(new Date(2010, 0, 1, 0, 0, 0), new Date());

        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        const hour = `${date.getHours()}`.padStart(2, '0');
        const minutes = `${date.getMinutes()}`.padStart(2, '0');
        const second = `${date.getSeconds()}`.padStart(2, '0');

        return `${date.getFullYear()}-${month}-${day} ${hour}:${minutes}:${second}`;
    }

    function randomDate(start: Date, end: Date) {
        const startTime = start.getTime();
        const endTime = end.getTime();
        return new Date(startTime + Math.random() * (endTime - startTime));
    }
}
