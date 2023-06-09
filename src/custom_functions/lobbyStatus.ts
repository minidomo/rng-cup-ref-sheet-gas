/**
 * @customfunction
 */
function lobbyStatus(redRange: string[][], blueRange: string[][], lobbyInfoRange: string[][], mapRange: string[][]) {
    const redTeam = LobbyStatusHelper.toTeam(redRange, 'red');
    const blueTeam = LobbyStatusHelper.toTeam(blueRange, 'blue');
    const lobbyInfo = LobbyStatusHelper.toLobbyInformation(lobbyInfoRange);
    const mapResults = mapRange.filter(row => !RowUtil.isEmpty(row)).map(LobbyStatusHelper.toMapResult);

    if (StringUtil.isEmptyString(lobbyInfo.matchId)) {
        return 'ERROR: Missing match id';
    }

    if (StringUtil.isEmptyString(lobbyInfo.stage)) {
        return 'ERROR: Missing stage';
    }

    if (lobbyInfo.bestOf === -1) {
        return 'ERROR: Invalid best of number';
    }

    if (!LobbyStatusHelper.isCorrectNumberOfMaps(lobbyInfo, mapResults)) {
        return 'ERROR: Incorrect number of maps';
    }

    if (LobbyStatusHelper.isDefaultWin(redTeam.score, blueTeam.score)) {
        return LobbyStatusHelper.summaryMessage(redTeam, blueTeam, lobbyInfo, mapResults);
    }

    if (StringUtil.isEmptyString(lobbyInfo.mpLink)) {
        return 'Setup a room and enter the MP-link';
    }

    if (LobbyStatusHelper.wonExpectedMatches(redTeam.score, blueTeam.score, lobbyInfo.bestOf)) {
        return LobbyStatusHelper.summaryMessage(redTeam, blueTeam, lobbyInfo, mapResults);
    }

    return LobbyStatusHelper.scoreMessage(redTeam, blueTeam, lobbyInfo);
}

namespace LobbyStatusHelper {
    interface Team {
        name: string;
        score: number;
        color: TeamColor;
    }

    interface LobbyInformation {
        matchId: string;
        mpLink: string;
        referee: string;
        bestOf: number;
        stage: string;
    }

    type TeamColor = 'red' | 'blue';
    type WinCondition = 'scorev2' | 'accuracy' | 'combo' | 'score';

    interface MapResult {
        name: string;
        winCondition: WinCondition;
        winner?: TeamColor;
    }

    export function toTeam(range: string[][], color: TeamColor) {
        const ret: Team = {
            name: StringUtil.convert(range[0][0]),
            score: parseInt(range[1][0]),
            color,
        };

        return ret;
    }

    export function toLobbyInformation(range: string[][]) {
        const bestOfStr = StringUtil.convert(range[3][0]);

        let bestOf = -1;
        if (/^\d+$/.test(bestOfStr)) {
            bestOf = parseInt(bestOfStr);

            if (bestOf <= 0 || bestOf % 2 === 0) {
                bestOf = -1;
            }
        }

        const ret: LobbyInformation = {
            matchId: StringUtil.convert(range[0][0]),
            mpLink: StringUtil.convert(range[1][0]),
            referee: StringUtil.convert(range[2][0]),
            bestOf,
            stage: StringUtil.convert(range[4][0]),
        };

        return ret;
    }

    export function toMapResult(row: string[]) {
        const ret: MapResult = {
            name: StringUtil.convert(row[1]),
            winCondition: parseWinCondition(StringUtil.convert(row[4])),
        };

        const color = StringUtil.convert(row[0]).toLowerCase();
        if (color === 'red' || color === 'blue') {
            ret.winner = color;
        }

        return ret;
    }

    function parseWinCondition(command: string): WinCondition {
        const regex = /!mp set \d (\d)/;
        const match = command.match(regex) as RegExpMatchArray;
        const scoremode = match[1];

        switch (scoremode) {
            case '0':
                return 'score';
            case '1':
                return 'accuracy';
            case '2':
                return 'combo';
            default:
                return 'scorev2';
        }
    }

    export function summaryMessage(
        redTeam: Team,
        blueTeam: Team,
        lobbyInfo: LobbyInformation,
        mapResults: MapResult[],
    ) {
        let message = `**${lobbyInfo.stage}: Match ${lobbyInfo.matchId}**\r`;

        if (lobbyInfo.mpLink == '') {
            message += '\r';
        } else {
            message += `<${lobbyInfo.mpLink}>\r\r`;
        }

        message += `:red_square: ${discordEscapeCharacters(redTeam.name)} | ${redTeam.score} : ${
            blueTeam.score
        } | ${discordEscapeCharacters(blueTeam.name)} :blue_square:\r\r`;
        message += mapResults
            .filter(res => res.winner)
            .map(res => `:${res.winner}_square: | ${res.name} \`[${StringUtil.capitalizeStart(res.winCondition)}]\``)
            .join('\r');
        message = message.trim();
        return message;
    }

    function discordEscapeCharacters(value: string) {
        let ret = value;
        const escapableCharacters = '\\`~!@#$%^&*()_+-=[]{}|;\':",./<>?'.split('');
        escapableCharacters.forEach(e => {
            const regex = createRegex(e);
            ret = ret.replace(regex, `\\${e}`);
        });
        return ret;
    }

    function createRegex(character: string) {
        const specialCharacters = '$^*()+[]\\.?|';

        if (specialCharacters.includes(character)) {
            return new RegExp(`\\${character}`, 'g');
        }

        return new RegExp(character, 'g');
    }

    export function wonExpectedMatches(redScore: number, blueScore: number, bestOf: number) {
        const winningTarget = (bestOf + 1) / 2;
        return redScore === winningTarget || blueScore === winningTarget;
    }

    export function scoreMessage(redTeam: Team, blueTeam: Team, lobbyInfo: LobbyInformation) {
        let ret = `${redTeam.name} | ${redTeam.score} : ${blueTeam.score} | ${blueTeam.name} // Best of ${lobbyInfo.bestOf}`;
        if (ret.startsWith('!')) {
            // prevent accidently using a command by prepending a period
            ret = `.${ret}`;
        }
        return ret;
    }

    export function isDefaultWin(redScore: number, blueScore: number) {
        return redScore === -1 || blueScore === -1;
    }

    export function isCorrectNumberOfMaps(lobbyInfo: LobbyInformation, mapResults: MapResult[]): boolean {
        const stageGeneral = Settings.getStageGeneralEntries().find(e => e.stage === lobbyInfo.stage);

        if (!stageGeneral) {
            return false;
        }

        return stageGeneral.maps === mapResults.length;
    }
}
