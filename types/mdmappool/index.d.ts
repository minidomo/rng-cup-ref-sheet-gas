/// <reference path="../lib/osu-api.d.ts" />

declare namespace mdmappool {
    type BeatmapFilter = (beatmap: OsuApiTypes.BeatmapResponse) => boolean;

    interface GenerationConfiguration {
        modPick: string,
        starRating: number,
        mode: 'osu' | 'taiko' | 'mania' | 'ctb',
        timestamp?: string,
        beatmapFilter?: BeatmapFilter,
    }

    interface MappoolMap {
        beatmap: OsuApiTypes.BeatmapResponse,
        modPick: string,
    }
}