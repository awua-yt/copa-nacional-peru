'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Play, Trophy, X } from 'lucide-react';
import {
  type Matchup,
  simulateKnockoutMatch,
} from '@/lib/simulation';
import { type Team } from '@/lib/teams';
import { cn } from '@/lib/utils';

type Stage = 'roundOf16' | 'quarters' | 'semis' | 'final';

const STAGE_TITLES: Record<Stage, string> = {
  roundOf16: '8vos de Final',
  quarters: '4tos de Final',
  semis: 'Semifinal',
  final: 'Final',
};

const KnockoutKeysPage = () => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [matchups, setMatchups] = useState<Record<Stage, Matchup[]>>({
    roundOf16: [],
    quarters: [],
    semis: [],
    final: [],
  });
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [surpriseLevel, setSurpriseLevel] = useState(5);
  const [winner, setWinner] = useState<Team | null>(null);
  const [showWinnerCard, setShowWinnerCard] = useState(false);

  useEffect(() => {
    const storedTeams = sessionStorage.getItem('knockoutTeams');
    if (storedTeams) {
      const parsedTeams: Team[] = JSON.parse(storedTeams);
      setTeams(parsedTeams);
      createInitialMatchups(parsedTeams);
      setCurrentStage('roundOf16');
    } else {
      router.push('/keys');
    }
  }, [router]);

  const createInitialMatchups = (teams: Team[]) => {
    const roundOf16: Matchup[] = [];
    // Simple pairing for now, can be improved with seeding
    for (let i = 0; i < teams.length; i += 2) {
      roundOf16.push({ teamA: teams[i], teamB: teams[i + 1] });
    }
    setMatchups((prev) => ({ ...prev, roundOf16 }));
  };

  const handleSimulateStage = useCallback(async () => {
    if (!currentStage) return;

    setIsSimulating(true);
    const currentMatchups = matchups[currentStage];
    const nextStageMatchups: Matchup[] = [];
    const simulatedMatchups: Matchup[] = [];

    for (const match of currentMatchups) {
      if (match.winner) {
        simulatedMatchups.push(match);
        continue;
      }
      const result = simulateKnockoutMatch(
        match.teamA,
        match.teamB,
        surpriseLevel
      );
      simulatedMatchups.push({
        ...result,
        teamA: match.teamA,
        teamB: match.teamB,
      });
    }

    // Animate results one by one
    for (let i = 0; i < simulatedMatchups.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setMatchups((prev) => {
        const newStageMatchups = [...prev[currentStage]];
        newStageMatchups[i] = simulatedMatchups[i];
        return { ...prev, [currentStage]: newStageMatchups };
      });
    }

    for (let i = 0; i < simulatedMatchups.length; i += 2) {
      const winner1 = simulatedMatchups[i].winner;
      const winner2 = simulatedMatchups[i + 1]?.winner;

      if (winner1 && winner2) {
        nextStageMatchups.push({ teamA: winner1, teamB: winner2 });
      } else if (winner1 && currentStage === 'final') {
        setWinner(winner1);
        setShowWinnerCard(true);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    let nextStageKey: Stage | null = null;
    if (currentStage === 'roundOf16') nextStageKey = 'quarters';
    else if (currentStage === 'quarters') nextStageKey = 'semis';
    else if (currentStage === 'semis') nextStageKey = 'final';
    else if (currentStage === 'final') nextStageKey = null;

    if (nextStageKey) {
      setMatchups((prev) => ({ ...prev, [nextStageKey!]: nextStageMatchups }));
      setCurrentStage(nextStageKey);
      setTimeout(() => {
        const stageElement = document.getElementById(`stage-${nextStageKey}`);
        if (stageElement && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const elementLeft = stageElement.offsetLeft;
          const elementWidth = stageElement.offsetWidth;
          const containerWidth = container.offsetWidth;
          const scrollLeft =
            elementLeft - containerWidth / 2 + elementWidth / 2;
          container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }, 100);
    } else {
      setCurrentStage(null);
    }

    setIsSimulating(false);
  }, [currentStage, matchups, surpriseLevel]);

  const handleGoBack = () => {
    sessionStorage.removeItem('knockoutTeams');
    router.push('/');
  };

  const renderMatchup = (match: Matchup) => {
    const isWinnerA = match.winner && match.winner.name === match.teamA.name;
    const isWinnerB = match.winner && match.winner.name === match.teamB.name;
    const showPenalties = match.penaltyScoreA !== undefined;

    const scoreDisplayA = showPenalties
      ? `${match.scoreA} (${match.penaltyScoreA})`
      : `${match.scoreA}`;

    const scoreDisplayB = showPenalties
      ? `${match.scoreB} (${match.penaltyScoreB})`
      : `${match.scoreB}`;

    return (
      <Card
        className={cn(
          'text-center transition-all duration-500 w-full',
          match.winner && 'border-primary'
        )}
      >
        <CardContent className="p-3 space-y-2">
          <div
            className={cn(
              'flex justify-between items-center p-2 rounded-md text-sm',
              isWinnerA && 'bg-primary/20 font-bold',
              match.winner && !isWinnerA && 'opacity-50'
            )}
          >
            <span>{match.teamA.name}</span>
            <span className="font-bold text-base">
              {match.scoreA !== undefined ? scoreDisplayA : '-'}
            </span>
          </div>
          <div className="text-center text-xs font-bold text-muted-foreground">
            {match.extraTime ? (showPenalties ? 'PEN' : 'T.E.') : 'VS'}
          </div>
          <div
            className={cn(
              'flex justify-between items-center p-2 rounded-md text-sm',
              isWinnerB && 'bg-primary/20 font-bold',
              match.winner && !isWinnerB && 'opacity-50'
            )}
          >
            <span>{match.teamB.name}</span>
            <span className="font-bold text-base">
              {match.scoreB !== undefined ? scoreDisplayB : '-'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!teams) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stageEntries = Object.entries(matchups).filter(
    ([_, m]) => m.length > 0
  ) as [Stage, Matchup[]][];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex justify-between items-center p-4 sm:p-6 border-b flex-shrink-0">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al sorteo
        </Button>
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-accent">
            Fase Eliminatoria (Llaves)
          </h1>
          <p className="text-muted-foreground md:text-lg">
            El camino a la final
          </p>
        </div>
        <div className="w-[180px] text-right">
          {currentStage && !winner && (
            <Button
              onClick={handleSimulateStage}
              disabled={isSimulating}
              className="min-w-[170px]"
            >
              {isSimulating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Simular {STAGE_TITLES[currentStage]}
            </Button>
          )}
        </div>
      </header>
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-auto"
      >
        <div className="flex flex-row items-start justify-start min-h-full min-w-max gap-4 lg:gap-8 p-8">
          {winner && showWinnerCard && (
            <div className="fixed inset-0 flex items-center justify-center bg-background/90 z-50">
              <Card className="relative max-w-md mx-auto bg-amber-300/10 border-amber-400 text-center animate-in fade-in-0 zoom-in-95">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => setShowWinnerCard(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="flex flex-col items-center gap-4 text-2xl text-amber-400">
                    <Trophy className="w-16 h-16 animate-bounce" />
                    ¡Campeón del Torneo!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{winner.name}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {stageEntries.map(([stage, stageMatchups]) => {
            return (
              <div
                key={stage}
                id={`stage-${stage}`}
                className="flex flex-col space-y-4 flex-shrink-0 w-64"
              >
                <h2 className="text-2xl font-bold text-center mb-4">
                  {STAGE_TITLES[stage as Stage]}
                </h2>
                <div className="flex flex-col gap-4">
                  {stageMatchups.map((match, index) => (
                    <div key={index}>{renderMatchup(match)}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default KnockoutKeysPage;
