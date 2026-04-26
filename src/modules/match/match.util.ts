// import type { WisdenTableResponse } from "../../common/types/wisden.types.js";
// // data: {
// //         seriesName: string
// //         season: string
// //         teams: {
// //             matchesLost: number
// //             matchesPlayed: number
// //             matchesWon: number
// //             matchesTied?: number
// //             points: number
// //             teamName: string
// //             netRunRate: number
// //             teamShortName: string
// //             position: number
// //             noResults: number
// //             teamId: string
// //             seriesForm: {
// //                 matchId: string
// //                 result: "W" | "L" | "T" | "NR" | "D"
// //             }[]
// //             nextMatches: {
// //                 isHome: boolean
// //                 matchId: string
// //                 oppTeamName: string
// //                 matchDate: string
// //             }[]
// //         }[]
// //     }
// export const createIplSeriesStandingsPayload = (standings: WisdenTableResponse) => {
//     return {
//         teams: standings.groups.flatMap(group => group.team.map(team => ({
//             matchesLost: team.lost,
//             matchesPlayed: team.matches,
//             matchesWon: team.won,
//             matchesTied: team.matches - team.won - team.lost - team.no_result,
//             points: team.points,
//             teamName: team.team_name,
//             netRunRate: team.net_run_rate,
//             teamShortName: team.team_short_name || team.team_abbreviation,
//             position: team.position,
//             noResults: team.no_result,
//             teamId: String(team.team_id),
//             seriesForm: [], // This would require additional data to populate
//             nextMatches: [], // This would require additional data to populate
//         }))),
//     }
// }
