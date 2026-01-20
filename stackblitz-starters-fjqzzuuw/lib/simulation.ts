import { type Team } from './teams';

export interface TeamStanding {
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface GroupMatch {
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
}

export interface GroupResult {
  groupName: string;
  standings: TeamStanding[];
  matchesByRound: Record<string, GroupMatch[]>;
}

export interface Matchup {
  teamA: Team;
  teamB: Team;
  winner?: Team;
  scoreA?: number;
  scoreB?: number;
  penaltyScoreA?: number;
  penaltyScoreB?: number;
  extraTime?: boolean;
}

function poisson(lambda: number): number {
  if (lambda <= 0) return 0;
  let L = Math.exp(-lambda);
  let p = 1.0;
  let k = 0;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

export function simulateMatch(
  teamA: Team,
  teamB: Team,
  surpriseLevel: number,
  isImportantMatch: boolean = false
): { scoreA: number; scoreB: number } {
  const baseScoringRate = 1.5;

  let lambdaA =
    baseScoringRate * (teamA.stats.goalCapacity / teamB.stats.defenseCapacity);
  let lambdaB =
    baseScoringRate * (teamB.stats.goalCapacity / teamA.stats.defenseCapacity);

  // Hierarchy factor for important matches
  if (isImportantMatch) {
    const hierarchyDiff = teamA.stats.hierarchy - teamB.stats.hierarchy;
    const levelDiff = Math.abs(teamA.stats.level - teamB.stats.level);

    // The effect is reduced if levels are similar
    const dampingFactor = 1 - Math.exp(-levelDiff / 5);

    if (hierarchyDiff > 0) {
      // Team A has more hierarchy
      lambdaA *= 1 + (hierarchyDiff / 20) * dampingFactor;
      lambdaB *= 1 - (hierarchyDiff / 20) * dampingFactor;
    } else {
      // Team B has more or equal hierarchy
      lambdaB *= 1 + (-hierarchyDiff / 20) * dampingFactor;
      lambdaA *= 1 - (-hierarchyDiff / 20) * dampingFactor;
    }
  }

  const surpriseFactor = surpriseLevel / 10.0;

  const applySurprise = (lambda: number) => {
    const randomModifier = Math.random() * 2;
    const surpriseEffect = 1 - surpriseFactor + randomModifier * surpriseFactor;
    return Math.max(0, lambda * surpriseEffect);
  };

  const finalLambdaA = applySurprise(lambdaA);
  const finalLambdaB = applySurprise(lambdaB);

  const scoreA = poisson(finalLambdaA);
  const scoreB = poisson(finalLambdaB);

  return { scoreA, scoreB };
}

function simulatePenaltyShootout(): {
  penaltyScoreA: number;
  penaltyScoreB: number;
} {
  const results = [
    [3, 0],
    [5, 4],
    [5, 3],
    [3, 2],
    [3, 1],
    [6, 5],
    [7, 6],
    [8, 7],
    [9, 8],
    [10, 9],
  ];

  const chosenResult = results[Math.floor(Math.random() * results.length)];

  if (Math.random() > 0.5) {
    return { penaltyScoreA: chosenResult[0], penaltyScoreB: chosenResult[1] };
  } else {
    return { penaltyScoreA: chosenResult[1], penaltyScoreB: chosenResult[0] };
  }
}

export function simulateKnockoutMatch(
  teamA: Team,
  teamB: Team,
  surpriseLevel: number
): Matchup {
  let { scoreA, scoreB } = simulateMatch(teamA, teamB, surpriseLevel, true);
  let winner: Team;
  let extraTime = false;
  let penaltyScoreA: number | undefined = undefined;
  let penaltyScoreB: number | undefined = undefined;

  if (scoreA === scoreB) {
    extraTime = true;
    // Simulate extra time - fewer goals are expected.
    const { scoreA: extraScoreA, scoreB: extraScoreB } = simulateMatch(
      teamA,
      teamB,
      surpriseLevel,
      true
    );

    if (extraScoreA !== extraScoreB) {
      winner = extraScoreA > extraScoreB ? teamA : teamB;
      // Add a single goal to represent the win in extra time
      if (extraScoreA > extraScoreB) scoreA++;
      else scoreB++;
    } else {
      // Penalties
      const penaltyResult = simulatePenaltyShootout();
      penaltyScoreA = penaltyResult.penaltyScoreA;
      penaltyScoreB = penaltyResult.penaltyScoreB;
      winner = penaltyScoreA > penaltyScoreB ? teamA : teamB;
    }
  } else {
    winner = scoreA > scoreB ? teamA : teamB;
  }

  return {
    teamA,
    teamB,
    winner,
    scoreA,
    scoreB,
    extraTime,
    penaltyScoreA,
    penaltyScoreB,
  };
}

export function simulateGroupStage(
  groups: Team[][],
  surpriseLevel: number
): GroupResult[] {
  const groupResults: GroupResult[] = [];
  const GROUP_NAMES = Array.from({ length: 16 }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  groups.forEach((group, index) => {
    if (group.length !== 4) return;

    const standings: Record<string, TeamStanding> = {};
    group.forEach((team) => {
      standings[team.name] = {
        team: team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      };
    });

    const matchesByRound: Record<string, GroupMatch[]> = {
      '0': [],
      '1': [],
      '2': [],
    };
    const pairings = [
      [0, 3],
      [1, 2],
      [0, 2],
      [1, 3],
      [0, 1],
      [2, 3],
    ];
    const roundDistribution = [0, 0, 1, 1, 2, 2];

    pairings.forEach((pair, matchIndex) => {
      const teamA = group[pair[0]];
      const teamB = group[pair[1]];

      const round = roundDistribution[matchIndex];
      // The last round (Fecha 3) is considered important
      const isImportant = round === 2;

      const { scoreA, scoreB } = simulateMatch(
        teamA,
        teamB,
        surpriseLevel,
        isImportant
      );
      matchesByRound[round].push({ teamA, teamB, scoreA, scoreB });

      standings[teamA.name].played++;
      standings[teamA.name].gf += scoreA;
      standings[teamA.name].ga += scoreB;
      standings[teamA.name].gd =
        standings[teamA.name].gf - standings[teamA.name].ga;

      standings[teamB.name].played++;
      standings[teamB.name].gf += scoreB;
      standings[teamB.name].ga += scoreA;
      standings[teamB.name].gd =
        standings[teamB.name].gf - standings[teamB.name].ga;

      if (scoreA > scoreB) {
        standings[teamA.name].wins++;
        standings[teamA.name].points += 3;
        standings[teamB.name].losses++;
      } else if (scoreB > scoreA) {
        standings[teamB.name].wins++;
        standings[teamB.name].points += 3;
        standings[teamA.name].losses++;
      } else {
        standings[teamA.name].draws++;
        standings[teamB.name].draws++;
        standings[teamA.name].points += 1;
        standings[teamB.name].points += 1;
      }
    });

    const sortedStandings = Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      // Tie-breaker: head-to-head not implemented, so random sort
      return Math.random() - 0.5;
    });

    groupResults.push({
      groupName: GROUP_NAMES[index],
      standings: sortedStandings,
      matchesByRound: matchesByRound,
    });
  });

  return groupResults;
}
