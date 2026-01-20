'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Play, Trophy, X } from 'lucide-react';
import {
  type GroupResult,
  type Matchup,
  simulateKnockoutMatch,
} from '@/lib/simulation';
import { type Team } from '@/lib/teams';
import { cn } from '@/lib/utils';

type Stage = 'roundOf32' | 'roundOf16' | 'quarters' | 'semis' | 'final';

const STAGE_TITLES: Record<Stage, string> = {
  roundOf32: '16vos de Final',
  roundOf16: '8vos de Final',
  quarters: '4tos de Final',
  semis: 'Semifinal',
  final: 'Final',
};

const KnockoutPage = () => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [groupResults, setGroupResults] = useState<GroupResult[] | null>(null);
  const [matchups, setMatchups] = useState<Record<Stage, Matchup[]>>({
    roundOf32: [],
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
    const storedResults = sessionStorage.getItem('simulationResults');
    if (storedResults) {
      const results: GroupResult[] = JSON.parse(storedResults);
      setGroupResults(results);
      createInitialMatchups(results);
      setCurrentStage('roundOf32');
    } else {
      router.push('/');
    }
  }, [router]);

  const createInitialMatchups = (results: GroupResult[]) => {
    const roundOf32: Matchup[] = [];
    const bracketA: Team[] = []; // Left side
    const bracketB: Team[] = []; // Right side

    // 1A, 2B, 1C, 2D, 1E, 2F, 1G, 2H ... etc
    for (let i = 0; i < 8; i++) {
      bracketA.push(results[i * 2].standings[0].team); // 1A, 1C, 1E...
      bracketA.push(results[i * 2 + 1].standings[1].team); // 2B, 2D, 2F...
    }

    // 1B, 2A, 1D, 2C, 1F, 2E, 1H, 2G ... etc
    for (let i = 0; i < 8; i++) {
      bracketB.push(results[i * 2 + 1].standings[0].team); // 1B, 1D, 1F...
      bracketB.push(results[i * 2].standings[1].team); // 2A, 2C, 2E...
    }

    // Create matchups for Bracket A
    for (let i = 0; i < bracketA.length; i += 2) {
      roundOf32.push({ teamA: bracketA[i], teamB: bracketA[i + 1] });
    }
    // Create matchups for Bracket B
    for (let i = 0; i < bracketB.length; i += 2) {
      roundOf32.push({ teamA: bracketB[i], teamB: bracketB[i + 1] });
    }

    setMatchups((prev) => ({ ...prev, roundOf32 }));
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

    // Animate results
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
    if (currentStage === 'roundOf32') nextStageKey = 'roundOf16';
    else if (currentStage === 'roundOf16') nextStageKey = 'quarters';
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
    sessionStorage.removeItem('simulationResults');
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

  if (!groupResults) {
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
            Fase de Eliminación
          </h1>
          <p className="text-muted-foreground md:text-lg">
            ¡Que gane el mejor!
          </p>
        </div>
        <div className="w-[170px] text-right">
          {currentStage && !winner && (
            <Button
              onClick={handleSimulateStage}
              disabled={isSimulating}
              className="min-w-[160px]"
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
            const spacerHeight =
              stage === 'roundOf32'
                ? 0
                : stage === 'roundOf16'
                ? 50
                : stage === 'quarters'
                ? 150
                : stage === 'semis'
                ? 350
                : 750;
            return (
              <div
                key={stage}
                id={`stage-${stage}`}
                className="flex flex-col space-y-4 flex-shrink-0 w-64 justify-center"
              >
                <h2 className="text-2xl font-bold text-center mb-4">
                  {STAGE_TITLES[stage as Stage]}
                </h2>
                <div
                  className={cn(
                    'flex flex-col gap-4',
                    stage !== 'roundOf32' && 'justify-around h-full'
                  )}
                >
                  {stageMatchups.map((match, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {renderMatchup(match)}
                    </div>
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

export default KnockoutPage;
