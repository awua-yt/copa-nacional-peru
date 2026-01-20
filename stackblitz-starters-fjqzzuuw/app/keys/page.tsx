'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Loader2, Play, Dices, ArrowLeft, ArrowRight } from 'lucide-react';
import { type Team } from '@/lib/teams';
import { type Matchup, simulateKnockoutMatch } from '@/lib/simulation';
import { cn } from '@/lib/utils';

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const STAGE_TITLES = {
  phase1: 'Fase 1',
  phase2: 'Fase 2',
  roundOf32: '16vos de Final',
};

type StageKey = keyof typeof STAGE_TITLES;

export default function KeysPage() {
  const router = useRouter();
  const [pots, setPots] = useState<Team[][] | null>(null);
  const [matchups, setMatchups] = useState<Record<StageKey, Matchup[]>>({
    phase1: [],
    phase2: [],
    roundOf32: [],
  });
  const [currentStage, setCurrentStage] = useState<StageKey | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [surpriseLevel, setSurpriseLevel] = useState(5);

  useEffect(() => {
    const storedPots = sessionStorage.getItem('sorteoPots');
    const storedSurpriseLevel = sessionStorage.getItem('surpriseLevel');
    if (storedPots) {
      setPots(JSON.parse(storedPots));
    } else {
      router.push('/');
    }
    if (storedSurpriseLevel) {
      setSurpriseLevel(parseInt(storedSurpriseLevel, 10));
    }
  }, [router]);

  const handleDrawPhase1 = useCallback(() => {
    if (!pots) return;
    setIsDrawing(true);
    const pot3 = shuffleArray(pots[2]);
    const pot4 = shuffleArray(pots[3]);
    const phase1Matchups: Matchup[] = [];
    for (let i = 0; i < 16; i++) {
      phase1Matchups.push({ teamA: pot3[i], teamB: pot4[i] });
    }
    setMatchups((prev) => ({ ...prev, phase1: phase1Matchups }));
    setCurrentStage('phase1');
    setIsDrawing(false);
  }, [pots]);

  const handleDrawPhase2 = useCallback(
    (phase1Winners: Team[]) => {
      if (!pots) return;
      setIsDrawing(true);
      const pot2 = shuffleArray(pots[1]);
      const phase2Matchups: Matchup[] = [];
      const shuffledWinners = shuffleArray(phase1Winners);
      for (let i = 0; i < 16; i++) {
        phase2Matchups.push({ teamA: shuffledWinners[i], teamB: pot2[i] });
      }
      setMatchups((prev) => ({ ...prev, phase2: phase2Matchups }));
      setCurrentStage('phase2');
      setIsDrawing(false);
    },
    [pots]
  );

  const handleDrawRoundOf32 = useCallback(
    (phase2Winners: Team[]) => {
      if (!pots) return;
      setIsDrawing(true);
      const pot1 = shuffleArray(pots[0]);
      const roundOf32Matchups: Matchup[] = [];
      const shuffledWinners = shuffleArray(phase2Winners);
      for (let i = 0; i < 16; i++) {
        roundOf32Matchups.push({ teamA: shuffledWinners[i], teamB: pot1[i] });
      }
      setMatchups((prev) => ({ ...prev, roundOf32: roundOf32Matchups }));
      setCurrentStage('roundOf32');
      setIsDrawing(false);
    },
    [pots]
  );

  const handleSimulateStage = useCallback(async () => {
    if (!currentStage) return;

    setIsSimulating(true);
    const currentMatchups = matchups[currentStage];
    const simulatedMatchups: Matchup[] = [];

    for (const match of currentMatchups) {
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

    for (let i = 0; i < simulatedMatchups.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setMatchups((prev) => {
        const newStageMatchups = [...prev[currentStage]];
        newStageMatchups[i] = simulatedMatchups[i];
        return { ...prev, [currentStage]: newStageMatchups };
      });
    }

    setIsSimulating(false);
  }, [currentStage, matchups, surpriseLevel]);

  const handleContinue = () => {
    if (!currentStage) return;
    const winners = matchups[currentStage].map((m) => m.winner!);
    if (currentStage === 'phase1') {
      handleDrawPhase2(winners);
    } else if (currentStage === 'phase2') {
      handleDrawRoundOf32(winners);
    } else if (currentStage === 'roundOf32') {
      sessionStorage.setItem('knockoutTeams', JSON.stringify(winners));
      router.push('/knockout-keys');
    }
  };

  const renderMatchup = (match: Matchup, index: number) => {
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
        key={index}
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

  if (!pots) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isPhase1Drawn = matchups.phase1.length > 0;
  const isPhase1Simulated =
    isPhase1Drawn && matchups.phase1.every((m) => m.winner);

  const isPhase2Drawn = matchups.phase2.length > 0;
  const isPhase2Simulated =
    isPhase2Drawn && matchups.phase2.every((m) => m.winner);

  const isRoundOf32Drawn = matchups.roundOf32.length > 0;
  const isRoundOf32Simulated =
    isRoundOf32Drawn && matchups.roundOf32.every((m) => m.winner);

  const stageButtonDisabled = isDrawing || isSimulating;

  const currentMatchupsList = currentStage ? matchups[currentStage] : [];
  const areCurrentMatchupsSimulated =
    currentMatchupsList.length > 0 &&
    currentMatchupsList.every((m) => m.winner);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-4xl mx-auto space-y-12">
        <header className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al sorteo
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-accent font-headline">
              Formato de Llaves
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Las fases previas a la gloria
            </p>
          </div>
          <div className="w-[170px]"></div>
        </header>

        <section id="draw-controls">
          <Card>
            <CardHeader>
              <CardTitle>Sorteo de Fases Preliminares</CardTitle>
              <CardDescription>
                Sortea los bombos en orden para definir los enfrentamientos.
                Nivel de sorpresa:{' '}
                <span className="font-bold text-accent">{surpriseLevel}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                onClick={handleDrawPhase1}
                disabled={stageButtonDisabled || isPhase1Drawn}
              >
                <Dices className="mr-2" /> 1. Sortear Fase 1 (B3 vs B4)
              </Button>
            </CardContent>
          </Card>
        </section>

        {currentStage && (
          <section id="simulation">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold font-headline">
                {STAGE_TITLES[currentStage]}
              </h2>
              {!areCurrentMatchupsSimulated ? (
                <Button
                  onClick={handleSimulateStage}
                  disabled={stageButtonDisabled}
                >
                  {isSimulating ? (
                    <Loader2 className="mr-2 animate-spin" />
                  ) : (
                    <Play className="mr-2" />
                  )}
                  Simular {STAGE_TITLES[currentStage]}
                </Button>
              ) : (
                <Button onClick={handleContinue} disabled={stageButtonDisabled}>
                  Continuar a la Siguiente Fase <ArrowRight className="ml-2" />
                </Button>
              )}
            </div>
            <div className="flex flex-col space-y-4 items-center">
              {currentMatchupsList.map((match, index) => (
                <div key={index} className="w-full max-w-xs">
                  {renderMatchup(match, index)}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
