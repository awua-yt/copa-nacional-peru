'use client';

import React, { useState, useEffect } from 'react';
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
  ListCollapse,
  Grid,
  GripVertical,
  Settings,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import { bombos as initialBombos, type Team } from '@/lib/teams';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { Slider } from '@/components/ui/slider';

export default function HomePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [pots, setPots] = useState<Team[][]>([]);
  const [surpriseLevel, setSurpriseLevel] = useState(5);

  useEffect(() => {
    const storedPots = sessionStorage.getItem('sorteoPots');
    const storedSurpriseLevel = sessionStorage.getItem('surpriseLevel');

    if (storedPots) {
      try {
        const parsed = JSON.parse(storedPots);
        if (Array.isArray(parsed) && parsed.every(Array.isArray)) {
          setPots(parsed);
        } else {
          setPots(JSON.parse(JSON.stringify(initialBombos)));
        }
      } catch (e) {
        console.error('Failed to parse pots from sessionStorage', e);
        setPots(JSON.parse(JSON.stringify(initialBombos)));
      }
    } else {
      setPots(JSON.parse(JSON.stringify(initialBombos)));
    }

    if (storedSurpriseLevel) {
      setSurpriseLevel(parseInt(storedSurpriseLevel, 10));
    }
  }, []);

  const [editingTeam, setEditingTeam] = useState<{
    team: Team;
    potIndex: number;
    teamIndex: number;
  } | null>(null);
  const [tempStats, setTempStats] = useState<Team['stats'] | null>(null);
  const [tempName, setTempName] = useState<string>('');

  const [draggedItem, setDraggedItem] = useState<{
    potIndex: number;
    teamIndex: number;
  } | null>(null);
  const [dragOverPot, setDragOverPot] = useState<number | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const savePotsToSession = (newPots: Team[][]) => {
    sessionStorage.setItem('sorteoPots', JSON.stringify(newPots));
    setPots(newPots);
  };

  const handleOpenEditModal = (
    team: Team,
    potIndex: number,
    teamIndex: number
  ) => {
    setEditingTeam({ team, potIndex, teamIndex });
    setTempStats(team.stats);
    setTempName(team.name);
  };

  const handleStatChange = (stat: keyof Team['stats'], value: string) => {
    if (tempStats) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
        setTempStats({ ...tempStats, [stat]: numValue });
      }
    }
  };

  const handleSaveStats = () => {
    if (editingTeam && tempStats && tempName) {
      const newPots = JSON.parse(JSON.stringify(pots));
      newPots[editingTeam.potIndex][editingTeam.teamIndex].stats = tempStats;
      newPots[editingTeam.potIndex][editingTeam.teamIndex].name = tempName;
      savePotsToSession(newPots);
      setEditingTeam(null);
      setTempStats(null);
      setTempName('');
    }
  };

  const handleStartTournament = (path: string) => {
    sessionStorage.setItem('surpriseLevel', String(surpriseLevel));
    router.push(path);
  };

  const onDragStart = (potIndex: number, teamIndex: number) => {
    setDraggedItem({ potIndex, teamIndex });
  };

  const onDragOver = (e: React.DragEvent, potIndex: number) => {
    e.preventDefault();
    if (draggedItem && draggedItem.potIndex !== potIndex) {
      setDragOverPot(potIndex);
    }
  };

  const onDrop = (targetPotIndex: number) => {
    if (!draggedItem) return;

    const { potIndex: sourcePotIndex, teamIndex: sourceTeamIndex } =
      draggedItem;

    if (sourcePotIndex === targetPotIndex) return;

    const newPots = JSON.parse(JSON.stringify(pots));
    const [movedTeam] = newPots[sourcePotIndex].splice(sourceTeamIndex, 1);
    newPots[targetPotIndex].push(movedTeam);
    savePotsToSession(newPots);

    setDraggedItem(null);
    setDragOverPot(null);
  };

  const onDragEnd = () => {
    setDraggedItem(null);
    setDragOverPot(null);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {editingTeam && tempStats && (
        <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editando a {editingTeam.team.name}</DialogTitle>
              <DialogDescription>
                Ajusta el nombre y las estadísticas del equipo. Los valores
                deben estar entre 0 y 10.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="level" className="text-right">
                  Nivel
                </Label>
                <Input
                  id="level"
                  type="number"
                  value={tempStats.level}
                  onChange={(e) => handleStatChange('level', e.target.value)}
                  className="col-span-3"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="goalCapacity" className="text-right">
                  Cap. Gol
                </Label>
                <Input
                  id="goalCapacity"
                  type="number"
                  value={tempStats.goalCapacity}
                  onChange={(e) =>
                    handleStatChange('goalCapacity', e.target.value)
                  }
                  className="col-span-3"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="defenseCapacity" className="text-right">
                  Cap. Defensa
                </Label>
                <Input
                  id="defenseCapacity"
                  type="number"
                  value={tempStats.defenseCapacity}
                  onChange={(e) =>
                    handleStatChange('defenseCapacity', e.target.value)
                  }
                  className="col-span-3"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hierarchy" className="text-right">
                  Jerarquía
                </Label>
                <Input
                  id="hierarchy"
                  type="number"
                  value={tempStats.hierarchy}
                  onChange={(e) =>
                    handleStatChange('hierarchy', e.target.value)
                  }
                  className="col-span-3"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <Button onClick={handleSaveStats}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <main className="max-w-7xl w-full mx-auto space-y-12">
        <header className="text-center space-y-2 relative">
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <Sun className="h-5 w-5" />
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              aria-label="Toggle theme"
            />
            <Moon className="h-5 w-5" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-accent font-headline pt-10">
            Simulador de Copa
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Configura los bombos y elige el formato del torneo
          </p>
        </header>

        <section id="bombos">
          <h2 className="text-3xl font-bold mb-6 font-headline text-center">
            Configuración de Bombos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {pots.map((pot, potIndex) => (
              <Card
                key={potIndex}
                className={cn(
                  'transition-all border-2 border-orange-500/60',
                  'bg-card/50 dark:bg-card',
                  dragOverPot === potIndex &&
                    'border-primary ring-2 ring-primary'
                )}
                onDragOver={(e) => onDragOver(e, potIndex)}
                onDrop={() => onDrop(potIndex)}
                onDragLeave={() => setDragOverPot(null)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Bombo {potIndex + 1}</span>
                    <Badge
                      variant={pot.length === 16 ? 'default' : 'secondary'}
                    >
                      {pot.length} / 16
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 h-72 overflow-y-auto pr-2">
                    {pot.map((team, teamIndex) => (
                      <li
                        key={`${team.name}-${potIndex}-${teamIndex}`}
                        draggable
                        onDragStart={() => onDragStart(potIndex, teamIndex)}
                        onDragEnd={onDragEnd}
                        className={cn(
                          'flex justify-between items-center text-sm p-2 bg-secondary/50 rounded-md group cursor-grab',
                          draggedItem?.potIndex === potIndex &&
                            draggedItem?.teamIndex === teamIndex &&
                            'opacity-50'
                        )}
                      >
                        <div className="flex items-center gap-2 text-left flex-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground/50 transition-opacity opacity-0 group-hover:opacity-100" />
                          <span>{team.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() =>
                            handleOpenEditModal(team, potIndex, teamIndex)
                          }
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                    {pot.length === 0 && (
                      <li className="text-sm text-center text-muted-foreground p-2">
                        Bombo vacío
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="settings">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Zap className="w-6 h-6 text-accent" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label
                  htmlFor="surprise"
                  className="block text-sm font-medium mb-2"
                >
                  Nivel de Sorpresa:{' '}
                  <span className="font-bold text-accent">{surpriseLevel}</span>
                </label>
                <p className="text-xs text-muted-foreground mb-4">
                  A mayor nivel, resultados más impredecibles.
                </p>
                <Slider
                  id="surprise"
                  min={0}
                  max={10}
                  step={1}
                  value={[surpriseLevel]}
                  onValueChange={(value) => setSurpriseLevel(value[0])}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:border-primary/80 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Grid className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Formato de Grupos</CardTitle>
              <CardDescription>
                Sorteo clásico con 16 grupos de 4 equipos. Los dos mejores
                avanzan a la fase eliminatoria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => handleStartTournament('/groups')}
              >
                Iniciar Sorteo de Grupos
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-accent/80 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <ListCollapse className="w-12 h-12 text-accent" />
              </div>
              <CardTitle className="text-2xl">Formato de Llaves</CardTitle>
              <CardDescription>
                Torneo con fases preliminares. Los equipos de bombos inferiores
                luchan por un puesto en la fase final.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleStartTournament('/keys')}
              >
                Iniciar Formato de Llaves
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
