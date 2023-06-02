namespace MatchManager {
    export function updateWinners() {
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

        const osuMatchUrl = StringUtil.convert(sheet.getRange('D8').getValue());
        const osuMatchId = parseOsuMatchId(osuMatchUrl);
        if (!osuMatchId) {
            UI.alert('Could not find osu match id');
            return;
        }

        const osuMatch = OsuApi.getMatch(osuMatchId);
        if (!osuMatch) {
            UI.alert(`Could not find osu match data`);
            return;
        }

        const mapIds = sheet
            .getRange('J3:J27')
            .getValues()
            .reduce((prev, cur) => prev.concat(cur), [])
            .map(e => {
                const val = StringUtil.convert(e);
                const match = val.match(/(\d+) 0$/);
                if (!match) {
                    return val;
                }
                return match[1];
            });

        const winners = mapIds.map(id => {
            if (id === '') {
                return '';
            }

            // check for matching id and existing scores
            const game = osuMatch.games.find(e => e.beatmap_id === id && e.scores.length > 0);
            if (!game) {
                return '';
            }

            return determineWinner(game);
        });

        sheet.getRange('H3:H27').setValues(winners.map(e => [e]));
    }

    function parseOsuMatchId(url: string): string | null {
        const match = url.match(/(\d+)$/);
        return match ? match[1] : null;
    }

    function determineWinner(game: OsuApiTypes.MatchGameData): 'Red' | 'Blue' | '' {
        const blueScores = game.scores.filter(e => e.team === '1');
        const redScores = game.scores.filter(e => e.team === '2');
        let blueValue = 0;
        let redValue = 0;

        if (game.scoring_type === '1') {
            blueValue = blueScores.map(calculateAccuracy).reduce((prev, cur) => prev + cur, 0);
            redValue = redScores.map(calculateAccuracy).reduce((prev, cur) => prev + cur, 0);
        } else if (game.scoring_type === '2') {
            blueValue = blueScores.map(e => parseInt(e.maxcombo)).reduce((prev, cur) => prev + cur, 0);
            redValue = redScores.map(e => parseInt(e.maxcombo)).reduce((prev, cur) => prev + cur, 0);
        } else if (game.scoring_type === '3') {
            blueValue = blueScores.map(e => parseInt(e.score)).reduce((prev, cur) => prev + cur, 0);
            redValue = redScores.map(e => parseInt(e.score)).reduce((prev, cur) => prev + cur, 0);
        }

        if (blueValue > redValue) {
            return 'Blue';
        } else if (redValue > blueValue) {
            return 'Red';
        } else {
            return '';
        }
    }

    function calculateAccuracy(score: OsuApiTypes.MatchGameScoreData) {
        // https://osu.ppy.sh/wiki/en/Gameplay/Accuracy
        const divisor =
            300 *
            (parseInt(score.count100) + parseInt(score.count300) + parseInt(score.count50) + parseInt(score.countmiss));
        const dividend = 300 * parseInt(score.count300) + 100 * parseInt(score.count100) + 50 * parseInt(score.count50);
        return dividend / divisor;
    }
}
