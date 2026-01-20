export interface TeamStats {
  level: number;
  goalCapacity: number;
  defenseCapacity: number;
  hierarchy: number;
}

export interface Team {
  name: string;
  stats: TeamStats;
}

const bombo1: Team[] = [
  {
    name: 'Universitario',
    stats: {
      level: 9.8,
      goalCapacity: 9.5,
      defenseCapacity: 9.8,
      hierarchy: 10.0,
    },
  },
  {
    name: 'Alianza Lima',
    stats: {
      level: 9.5,
      goalCapacity: 8.5,
      defenseCapacity: 9.9,
      hierarchy: 10.0,
    },
  },
  {
    name: 'Sporting Cristal',
    stats: {
      level: 9.2,
      goalCapacity: 9.2,
      defenseCapacity: 7.0,
      hierarchy: 9.8,
    },
  },
  {
    name: 'Melgar',
    stats: {
      level: 8.8,
      goalCapacity: 8.2,
      defenseCapacity: 8.0,
      hierarchy: 8.5,
    },
  },
  {
    name: 'Cusco FC',
    stats: {
      level: 8.5,
      goalCapacity: 9.3,
      defenseCapacity: 5.5,
      hierarchy: 5.0,
    },
  },
  {
    name: 'Alianza Atlético',
    stats: {
      level: 8.4,
      goalCapacity: 8.0,
      defenseCapacity: 4.5,
      hierarchy: 6.0,
    },
  },
  {
    name: 'Sport Huancayo',
    stats: {
      level: 8.2,
      goalCapacity: 7.8,
      defenseCapacity: 7.5,
      hierarchy: 6.5,
    },
  },
  {
    name: 'Deportivo Garcilaso',
    stats: {
      level: 8.0,
      goalCapacity: 8.1,
      defenseCapacity: 5.0,
      hierarchy: 3.0,
    },
  },
  {
    name: 'ADT',
    stats: {
      level: 7.8,
      goalCapacity: 7.5,
      defenseCapacity: 4.0,
      hierarchy: 3.5,
    },
  },
  {
    name: 'Cienciano',
    stats: {
      level: 7.7,
      goalCapacity: 7.0,
      defenseCapacity: 6.5,
      hierarchy: 8.8,
    },
  },
  {
    name: 'Chankas CYC',
    stats: {
      level: 7.5,
      goalCapacity: 7.4,
      defenseCapacity: 6.4,
      hierarchy: 2.5,
    },
  },
  {
    name: 'Atlético Grau',
    stats: {
      level: 7.4,
      goalCapacity: 7.2,
      defenseCapacity: 6.8,
      hierarchy: 5.5,
    },
  },
  {
    name: 'Sport Boys',
    stats: {
      level: 7.3,
      goalCapacity: 7.8,
      defenseCapacity: 5.2,
      hierarchy: 8.2,
    },
  },
  {
    name: 'UTC Cajamarca',
    stats: {
      level: 7.1,
      goalCapacity: 5.5,
      defenseCapacity: 2.5,
      hierarchy: 5.8,
    },
  },
  {
    name: 'Juan Pablo II College',
    stats: {
      level: 7.0,
      goalCapacity: 6.0,
      defenseCapacity: 5.0,
      hierarchy: 1.5,
    },
  },
  {
    name: 'Binacional',
    stats: {
      level: 6.8,
      goalCapacity: 5.8,
      defenseCapacity: 3.5,
      hierarchy: 6.2,
    },
  },
];

const bombo2: Team[] = [
  {
    name: 'Comerciantes Unidos',
    stats: {
      level: 6.8,
      goalCapacity: 6.9,
      defenseCapacity: 6.5,
      hierarchy: 4.0,
    },
  },
  {
    name: 'FC Cajamarca',
    stats: {
      level: 6.6,
      goalCapacity: 6.0,
      defenseCapacity: 6.8,
      hierarchy: 2.0,
    },
  },
  {
    name: 'UCV Moquegua',
    stats: {
      level: 6.2,
      goalCapacity: 6.3,
      defenseCapacity: 5.8,
      hierarchy: 1.5,
    },
  },
  {
    name: 'Unión Comercio',
    stats: {
      level: 6.0,
      goalCapacity: 6.5,
      defenseCapacity: 4.0,
      hierarchy: 6.0,
    },
  },
  {
    name: 'Tacna Heroica',
    stats: {
      level: 5.9,
      goalCapacity: 6.6,
      defenseCapacity: 3.8,
      hierarchy: 2.2,
    },
  },
  {
    name: 'César Vallejo',
    stats: {
      level: 5.8,
      goalCapacity: 5.5,
      defenseCapacity: 6.2,
      hierarchy: 7.0,
    },
  },
  {
    name: 'Ayacucho FC',
    stats: {
      level: 5.5,
      goalCapacity: 4.5,
      defenseCapacity: 3.0,
      hierarchy: 5.5,
    },
  },
  {
    name: 'Santos FC',
    stats: {
      level: 5.4,
      goalCapacity: 6.1,
      defenseCapacity: 6.1,
      hierarchy: 2.8,
    },
  },
  {
    name: 'San Martín',
    stats: {
      level: 5.2,
      goalCapacity: 5.8,
      defenseCapacity: 4.5,
      hierarchy: 7.5,
    },
  },
  {
    name: 'Comerciantes FC',
    stats: {
      level: 5.0,
      goalCapacity: 4.0,
      defenseCapacity: 3.5,
      hierarchy: 2.0,
    },
  },
  {
    name: 'Alianza Universidad',
    stats: {
      level: 4.8,
      goalCapacity: 3.8,
      defenseCapacity: 3.2,
      hierarchy: 5.0,
    },
  },
  {
    name: 'San Marcos',
    stats: {
      level: 4.5,
      goalCapacity: 3.0,
      defenseCapacity: 6.9,
      hierarchy: 1.8,
    },
  },
  {
    name: 'Agropecuaria',
    stats: {
      level: 4.3,
      goalCapacity: 5.0,
      defenseCapacity: 5.2,
      hierarchy: 2.5,
    },
  },
  {
    name: 'Carlos Mannucci',
    stats: {
      level: 4.2,
      goalCapacity: 5.7,
      defenseCapacity: 4.8,
      hierarchy: 8.0,
    },
  },
  {
    name: 'Deportivo Llacuabamba',
    stats: {
      level: 4.0,
      goalCapacity: 5.2,
      defenseCapacity: 2.5,
      hierarchy: 3.0,
    },
  },
  {
    name: 'Deportivo Coopsol',
    stats: {
      level: 3.8,
      goalCapacity: 3.9,
      defenseCapacity: 2.8,
      hierarchy: 4.5,
    },
  },
];

const bombo3: Team[] = [
  {
    name: 'José María Arguedas',
    stats: {
      level: 4.9,
      goalCapacity: 4.3,
      defenseCapacity: 3.5,
      hierarchy: 1.5,
    },
  },
  {
    name: 'Construcción Civil',
    stats: {
      level: 4.8,
      goalCapacity: 4.1,
      defenseCapacity: 4.9,
      hierarchy: 1.5,
    },
  },
  {
    name: 'Santo Domingo (Chachapoyas)',
    stats: {
      level: 4.7,
      goalCapacity: 4.1,
      defenseCapacity: 4.0,
      hierarchy: 1.8,
    },
  },
  {
    name: 'Juventud Alfa de Calca',
    stats: {
      level: 4.6,
      goalCapacity: 4.4,
      defenseCapacity: 3.8,
      hierarchy: 1.2,
    },
  },
  {
    name: 'Nuevo San Cristóbal',
    stats: {
      level: 4.5,
      goalCapacity: 4.2,
      defenseCapacity: 4.1,
      hierarchy: 1.4,
    },
  },
  {
    name: 'Estudiantil CNI de Iquitos',
    stats: {
      level: 4.2,
      goalCapacity: 4.0,
      defenseCapacity: 3.5,
      hierarchy: 6.8,
    },
  },
  {
    name: 'Nacional FBC',
    stats: {
      level: 4.1,
      goalCapacity: 4.1,
      defenseCapacity: 4.2,
      hierarchy: 2.0,
    },
  },
  {
    name: 'Deportivo Ucrania',
    stats: {
      level: 4.0,
      goalCapacity: 3.8,
      defenseCapacity: 4.3,
      hierarchy: 1.2,
    },
  },
  {
    name: 'Patriotas FC de Tacna',
    stats: {
      level: 3.9,
      goalCapacity: 4.1,
      defenseCapacity: 3.2,
      hierarchy: 1.8,
    },
  },
  {
    name: 'Deportivo Lute de Chiclayo',
    stats: {
      level: 3.8,
      goalCapacity: 3.5,
      defenseCapacity: 3.0,
      hierarchy: 1.5,
    },
  },
  {
    name: 'UDA Huancavelica',
    stats: {
      level: 3.7,
      goalCapacity: 3.4,
      defenseCapacity: 3.3,
      hierarchy: 2.0,
    },
  },
  {
    name: 'Juventus Huamachuco',
    stats: {
      level: 3.5,
      goalCapacity: 3.6,
      defenseCapacity: 2.8,
      hierarchy: 2.5,
    },
  },
  {
    name: 'Juventud Cautivo de Piura',
    stats: {
      level: 3.4,
      goalCapacity: 3.4,
      defenseCapacity: 2.9,
      hierarchy: 1.5,
    },
  },
  {
    name: 'Unión Huaral',
    stats: {
      level: 3.2,
      goalCapacity: 3.2,
      defenseCapacity: 3.6,
      hierarchy: 8.2,
    },
  },
  {
    name: 'Deportivo Municipal',
    stats: {
      level: 3.1,
      goalCapacity: 3.7,
      defenseCapacity: 3.4,
      hierarchy: 8.5,
    },
  },
  {
    name: 'Juan Aurich',
    stats: {
      level: 3.0,
      goalCapacity: 2.5,
      defenseCapacity: 3.5,
      hierarchy: 7.8,
    },
  },
].map((team) => ({
  ...team,
  stats: {
    ...team.stats,
    defenseCapacity: Math.max(team.stats.defenseCapacity, 2.5),
  },
}));

const bombo4: Team[] = [
  {
    name: 'Social Pariacoto de Áncash',
    stats: {
      level: 2.8,
      goalCapacity: 3.5,
      defenseCapacity: 2.5,
      hierarchy: 1.5,
    },
  },
  {
    name: 'Sport Bolognesi',
    stats: {
      level: 2.7,
      goalCapacity: 3.0,
      defenseCapacity: 2.5,
      hierarchy: 6.5,
    },
  },
  {
    name: 'Pacífico FC',
    stats: {
      level: 2.6,
      goalCapacity: 3.1,
      defenseCapacity: 2.5,
      hierarchy: 4.8,
    },
  },
  {
    name: 'Melgar Reserva',
    stats: {
      level: 3.5,
      goalCapacity: 4.3,
      defenseCapacity: 2.8,
      hierarchy: 1.0,
    },
  },
  {
    name: 'Cultural Volante',
    stats: {
      level: 2.4,
      goalCapacity: 3.2,
      defenseCapacity: 2.5,
      hierarchy: 1.2,
    },
  },
  {
    name: 'Ecosem Pasco',
    stats: {
      level: 2.3,
      goalCapacity: 3.0,
      defenseCapacity: 2.5,
      hierarchy: 1.8,
    },
  },
  {
    name: 'Carlos Stein',
    stats: {
      level: 2.2,
      goalCapacity: 2.8,
      defenseCapacity: 2.5,
      hierarchy: 4.2,
    },
  },
  {
    name: 'Alto Rendimiento JVM',
    stats: {
      level: 2.1,
      goalCapacity: 2.9,
      defenseCapacity: 2.5,
      hierarchy: 1.0,
    },
  },
  {
    name: 'San Antonio de Moquegua',
    stats: {
      level: 2.0,
      goalCapacity: 2.5,
      defenseCapacity: 2.5,
      hierarchy: 1.0,
    },
  },
  {
    name: 'El Pirata',
    stats: {
      level: 2.5,
      goalCapacity: 2.8,
      defenseCapacity: 2.5,
      hierarchy: 3.0,
    },
  },
  {
    name: 'Amazon Callao FC',
    stats: {
      level: 1.8,
      goalCapacity: 2.6,
      defenseCapacity: 2.5,
      hierarchy: 1.0,
    },
  },
  {
    name: 'Juventud Santo Domingo',
    stats: {
      level: 1.6,
      goalCapacity: 2.0,
      defenseCapacity: 2.5,
      hierarchy: 1.0,
    },
  },
  {
    name: 'Deportivo Municipal Pangoa',
    stats: {
      level: 1.4,
      goalCapacity: 2.1,
      defenseCapacity: 2.5,
      hierarchy: 1.0,
    },
  },
  {
    name: 'Diablos Rojos de Juliaca',
    stats: {
      level: 1.2,
      goalCapacity: 1.8,
      defenseCapacity: 2.5,
      hierarchy: 1.2,
    },
  },
  {
    name: 'AD Cantolao',
    stats: {
      level: 1.5,
      goalCapacity: 1.2,
      defenseCapacity: 2.5,
      hierarchy: 4.5,
    },
  },
  {
    name: 'Rauker FC de Pucallpa',
    stats: {
      level: 0.5,
      goalCapacity: 0.5,
      defenseCapacity: 2.5,
      hierarchy: 1.0,
    },
  },
].map((team) => ({
  ...team,
  stats: {
    ...team.stats,
    defenseCapacity: Math.max(team.stats.defenseCapacity, 2.5),
  },
}));

export const bombos = [bombo1, bombo2, bombo3, bombo4];
