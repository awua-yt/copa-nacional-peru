'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dices,
  Loader2,
  Play,
  RefreshCw,
  Trophy,
  Zap,
  ArrowRight,
  Settings,
  GripVertical,
  ArrowLeft,
} from 'lucide-react';
import { type Team } from '@/lib/teams';
import { simulateGroupStage, type GroupResult } from '@/lib/simulation';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const GROUP_NAMES = Array.from({ length: 16 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function GroupsPage() {
  const [pots, setPots] = useState<Team[][] | null>(null);
  const [groups, setGroups] = useState<Team[][]>(() => Array(16).fill([]));
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnTeam, setDrawnTeam] = useState<{
    team: Team;
    potIndex: number;
    groupName: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<
    GroupResult[] | null
  >(null);
  const [surpriseLevel, setSurpriseLevel] = useState(5);
  const router = useRouter();

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

  const allPots = useMemo(() => (pots ? pots.flat() : []), [pots]);

  const isPot1Complete = useMemo(
    () => (pots ? pots[0].length === 0 : false),
    [pots]
  );
  const isDrawComplete = useMemo(
    () => (pots ? pots.every((pot) => pot.length === 0) : false),
    [pots]
  );

  const handleDrawPot1 = useCallback(() => {
    if (isDrawing || isPot1Complete || !pots) return;

    setIsDrawing(true);
    const potToDrawFrom = pots[0];
    const teamIndex = Math.floor(Math.random() * potToDrawFrom.length);
    const team = potToDrawFrom[teamIndex];

    const groupIndex = groups.findIndex((g) => g.length === 0);

    if (groupIndex === -1) {
      setIsDrawing(false);
      return;
    }

    setDrawnTeam({ team, potIndex: 0, groupName: GROUP_NAMES[groupIndex] });

    setTimeout(() => {
      setPots((prevPots) => {
        const newPots = JSON.parse(JSON.stringify(prevPots));
        newPots[0] = newPots[0].filter((t: Team) => t.name !== team.name);
        return newPots;
      });

      setGroups((prevGroups) => {
        const newGroups = [...prevGroups];
        newGroups[groupIndex] = [...newGroups[groupIndex], team];
        return newGroups;
      });

      setDrawnTeam(null);
      setIsDrawing(false);
    }, 1500);
  }, [isDrawing, pots, groups, isPot1Complete]);

  const handleDrawRest = useCallback(() => {
    if (isDrawing || !isPot1Complete || isDrawComplete || !pots) return;

    setIsDrawing(true);

    setTimeout(() => {
      let currentPots = JSON.parse(JSON.stringify(pots));
      let currentGroups = JSON.parse(JSON.stringify(groups));

      for (let potIndex = 1; potIndex < currentPots.length; potIndex++) {
        let teamsToDraw = shuffleArray(currentPots[potIndex]);
        for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
          if (currentGroups[groupIndex].length < potIndex + 1) {
            const team = teamsToDraw.pop();
            if (team) {
              currentGroups[groupIndex].push(team);
            }
          }
        }
        currentPots[potIndex] = [];
      }

      setPots(currentPots);
      setGroups(currentGroups);
      setIsDrawing(false);
    }, 1000);
  }, [isDrawing, isPot1Complete, isDrawComplete, pots, groups]);

  const handleSimulate = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => {
      const results = simulateGroupStage(groups, surpriseLevel);
      setSimulationResults(results);
      setIsSimulating(false);
    }, 500);
  }, [groups, surpriseLevel]);

  const handleReset = () => {
    const storedPots = sessionStorage.getItem('sorteoPots');
    if (storedPots) {
      setPots(JSON.parse(storedPots));
    }
    setGroups(Array(16).fill([]));
    setSimulationResults(null);
    setIsDrawing(false);
    sessionStorage.removeItem('simulationResults');
  };

  const goToKnockoutStage = () => {
    if (simulationResults) {
      sessionStorage.setItem(
        'simulationResults',
        JSON.stringify(simulationResults)
      );
      router.push('/knockout');
    }
  };

  useEffect(() => {
    const resultsFromStorage = sessionStorage.getItem('simulationResults');
    if (resultsFromStorage) {
      sessionStorage.removeItem('simulationResults');
    }
  }, []);

  if (!pots) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al sorteo
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-accent font-headline">
              Formato de Grupos
            </h1>
            <p className="text-muted-foreground md:text-lg">
              Simulador de sorteo para la copa
            </p>
          </div>
          <div className="w-[170px]"></div>
        </header>

        {drawnTeam && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <Card className="w-80 border-accent shadow-2xl animate-in fade-in-0 zoom-in-90">
              <CardHeader>
                <CardTitle className="text-center text-accent">
                  ¡Equipo Sorteado!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-2xl font-bold">{drawnTeam.team.name}</p>
                <p className="text-muted-foreground">
                  del Bombo {drawnTeam.potIndex + 1}
                </p>
                <p className="text-lg">
                  al Grupo{' '}
                  <span className="font-bold text-accent">
                    {drawnTeam.groupName}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <section id="sorteo">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-headline">
              Paso 1: El Sorteo
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={handleDrawPot1}
                disabled={isDrawing || isPot1Complete}
                className="w-full"
              >
                {isDrawing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Dices className="mr-2 h-4 w-4" />
                )}
                {isPot1Complete ? 'Bombo 1 Sorteado' : 'Sortear Equipo Bombo 1'}
              </Button>
              {isPot1Complete && !isDrawComplete && (
                <Button onClick={handleDrawRest} disabled={isDrawing}>
                  {isDrawing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Sorteo Rápido
                </Button>
              )}
              <Button onClick={handleReset} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reiniciar
              </Button>
            </div>
          </div>
        </section>

        <section id="grupos">
          <h2 className="text-3xl font-bold mb-6 font-headline">Grupos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groups.map((group, index) => (
              <Card
                key={index}
                className={cn(group.length > 0 && 'border-primary/30')}
              >
                <CardHeader>
                  <CardTitle>Grupo {GROUP_NAMES[index]}</CardTitle>
                </CardHeader>
                <CardContent>
                  {group.length > 0 ? (
                    <ul className="space-y-2">
                      {group.map((team, teamIndex) => (
                        <li
                          key={team.name}
                          className="p-2 bg-secondary rounded-md text-sm fade-in"
                          style={{ animationDelay: `${teamIndex * 100}ms` }}
                        >
                          <span className="font-bold text-muted-foreground">
                            B
                            {pots.findIndex((b) =>
                              b.some((t) => t.name === team.name)
                            ) + 1}
                            :
                          </span>{' '}
                          {team.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm h-[184px] flex items-center justify-center">
                      Vacío
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {isDrawComplete && !simulationResults && (
          <section id="simulacion">
            <h2 className="text-3xl font-bold mb-6 font-headline">
              Paso 2: Simulación Fase de Grupos
            </h2>
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center">
                  Simular Fase de Grupos
                </CardTitle>
                <CardDescription className="text-center">
                  Nivel de sorpresa para la simulación:{' '}
                  <span className="font-bold text-accent">{surpriseLevel}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="w-full"
                >
                  {isSimulating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Simular Fase de Grupos
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {simulationResults && (
          <section id="resultados">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold font-headline">
                Resultados de la Fase de Grupos
              </h2>
              <Button onClick={goToKnockoutStage}>
                Ir a Fase de Eliminación
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {simulationResults.map((result) => (
                <Card key={result.groupName}>
                  <CardHeader>
                    <CardTitle>Grupo {result.groupName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="standings" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="standings">
                          Tabla de Posiciones
                        </TabsTrigger>
                        <TabsTrigger value="matches">Partidos</TabsTrigger>
                      </TabsList>
                      <TabsContent value="standings">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px]">#</TableHead>
                              <TableHead>Equipo</TableHead>
                              <TableHead className="text-center">PJ</TableHead>
                              <TableHead className="text-center">Pts</TableHead>
                              <TableHead className="text-center">DG</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.standings.map((standing, index) => (
                              <TableRow
                                key={standing.team.name}
                                className={cn(index < 2 && 'bg-green-500/10')}
                              >
                                <TableCell
                                  className={cn(
                                    'font-medium',
                                    index < 2 && 'text-green-400'
                                  )}
                                >
                                  {index + 1}
                                </TableCell>
                                <TableCell>{standing.team.name}</TableCell>
                                <TableCell className="text-center">
                                  {standing.played}
                                </TableCell>
                                <TableCell className="text-center font-bold">
                                  {standing.points}
                                </TableCell>
                                <TableCell className="text-center">
                                  {standing.gd > 0
                                    ? `+${standing.gd}`
                                    : standing.gd}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TabsContent>
                      <TabsContent value="matches">
                        <div className="space-y-4">
                          {Object.entries(result.matchesByRound).map(
                            ([round, matches]) => (
                              <div key={round}>
                                <h4 className="font-bold mb-2 text-md">
                                  Fecha {parseInt(round) + 1}
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {matches.map((match, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between items-center p-2 bg-secondary/50 rounded-md"
                                    >
                                      <span
                                        className={cn(
                                          'flex-1',
                                          match.scoreA > match.scoreB &&
                                            'font-bold'
                                        )}
                                      >
                                        {match.teamA.name}
                                      </span>
                                      <span className="font-mono text-accent mx-4">
                                        {match.scoreA} - {match.scoreB}
                                      </span>
                                      <span
                                        className={cn(
                                          'flex-1 text-right',
                                          match.scoreB > match.scoreA &&
                                            'font-bold'
                                        )}
                                      >
                                        {match.teamB.name}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
