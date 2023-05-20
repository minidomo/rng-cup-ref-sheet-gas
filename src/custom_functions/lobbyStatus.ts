/**
 * @customfunction
 */
function lobbyStatus(redRange: string[][], blueRange: string[][], lobbyInfoRange: string[][], mapRange: string[][]) {
    const redTeam = LobbyStatusHelper.toTeam(redRange, 'red');
    const blueTeam = LobbyStatusHelper.toTeam(blueRange, 'blue');
    const lobbyInfo = LobbyStatusHelper.toLobbyInformation(lobbyInfoRange);
    const mapResults = mapRange.map(LobbyStatusHelper.toMapResult);

    if (lobbyInfo.matchId === '') {
        return 'ERROR: Missing match id';
    }

    if (lobbyInfo.stage === '') {
        return 'ERROR: Missing stage';
    }

    if (lobbyInfo.bestOf === -1) {
        return 'ERROR: Invalid best of number';
    }

    if (LobbyStatusHelper.isDefaultWin(redTeam.score, blueTeam.score)) {
        return LobbyStatusHelper.summaryMessage(redTeam, blueTeam, lobbyInfo, mapResults);
    }

    if (lobbyInfo.mpLink === '') {
        return 'Setup a room and enter the MP-link';
    }

    if (LobbyStatusHelper.wonExpectedMatches(redTeam.score, blueTeam.score, lobbyInfo.bestOf)) {
        return LobbyStatusHelper.summaryMessage(redTeam, blueTeam, lobbyInfo, mapResults);
    }

    return LobbyStatusHelper.scoreMessage(redTeam, blueTeam);
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

    interface MapResult {
        name: string;
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
        };

        const color = row[0].toLowerCase();
        if (color === 'red' || color === 'blue') {
            ret.winner = color;
        }

        return ret;
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

        message += `:red_square: ${redTeam.name} | ${redTeam.score} : ${blueTeam.score} | ${blueTeam.name} :blue_square:\r\r`;
        message += mapResults
            .filter(res => res.winner)
            .map(res => `:${res.winner}_square: | ${res.name}`)
            .join('\r');
        message = message.trim();
        return message;
    }

    export function wonExpectedMatches(redScore: number, blueScore: number, bestOf: number) {
        const winningTarget = (bestOf + 1) / 2;
        return redScore === winningTarget || blueScore === winningTarget;
    }

    export function scoreMessage(redTeam: Team, blueTeam: Team) {
        return `${redTeam.name} | ${redTeam.score} : ${blueTeam.score} | ${blueTeam.name}`;
    }

    export function isDefaultWin(redScore: number, blueScore: number) {
        return redScore === -1 || blueScore === -1;
    }
}
