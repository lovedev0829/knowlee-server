// types/Country
export interface IFootballCountry {
  name: string;
  code: string;
  flag: string;
}

export interface IFootballCountryResponse {
  get: string;
  parameters: {
    name: string;
  };
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: {
    name: string;
    code: string;
    flag: string;
  };
}

//types/League
export interface IFootballSeasonCoverage {
  fixtures: {
    events: boolean;
    lineups: boolean;
    statistics_fixtures: boolean;
    statistics_players: boolean;
  };
  standings: boolean;
  players: boolean;
  top_scorers: boolean;
  top_assists: boolean;
  top_cards: boolean;
  injuries: boolean;
  predictions: boolean;
  odds: boolean;
}

export interface IFootballSeasonData {
  year: number;
  start: string;
  end: string;
  current: boolean;
  coverage: IFootballSeasonCoverage;
}

export interface IFootballLeague {
  id: number;
  name: string;
  type: string;
  logo: string;
}

export interface IFootballLeagueResponse {
  league: IFootballLeague;
  country: IFootballCountry;
  seasons: IFootballSeasonData[];
}

export interface IFootballLeagueResponseData {
  get: string;
  parameters: {
    id: string;
  };
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: IFootballLeagueResponse[];
}

export interface IFootballSeason {
  year: number;
}

export interface IFootballTeam {
  id: number;
  name: string;
  code: string;
  country: string;
  founded: number;
  national: boolean;
  logo: string;
}

export interface IFootballPlayer {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  birth: {
    date: string;
    place: string;
    country: string;
  };
  nationality: string;
  height: string;
  weight: string;
  injured: boolean;
  photo: string;
}

export interface IFootballTeam {
  id: number;
  name: string;
  logo: string;
}

export interface IFootballLeagueData {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

export interface IFootballStatistics {
  team: IFootballTeam;
  league: IFootballLeagueData;
  games: any;
  substitutes: any;
  shots: any;
  goals: any;
  passes: any;
  tackles: any;
  duels: any;
  dribbles: any;
  fouls: any;
  cards: any;
  penalty: any;
}

export interface IFootballPlayerResponse {
  player: IFootballPlayer;
  statistics: IFootballStatistics[];
}

export interface IPaging {
  current: number;
  total: number;
}

export interface IFootballPlayerResponseData {
  get: string;
  parameters: {
    season: string;
    league: string;
  };
  errors: any[];
  results: number;
  paging: IPaging;
  response: IFootballPlayerResponse[];
}

export interface IFootballFixtureTeam {
  id: number;
  name: string;
  logo: string;
  winner: boolean;
}

export interface IFootballGoal {
  home: number;
  away: number;
}

export interface IFootballScore {
  home: number | null;
  away: number | null;
}

export interface IFootballFixture {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  assistantId: string;
  periods: {
    first: number;
    second: number | null;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
  status: {
    long: string;
    short: string;
    elapsed: number;
  };
}

export interface IFootballFixtureLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round: string;
}

export interface IFootballFixtureResponse {
  fixture: IFootballFixture;
  league: IFootballFixtureLeague;
  teams: {
    home: IFootballFixtureTeam;
    away: IFootballFixtureTeam;
  };
  goals: IFootballGoal;
  score: {
    halftime: IFootballScore;
    fulltime: IFootballScore;
    extratime: IFootballScore;
    penalty: IFootballScore;
  };
}

// types/predictions.ts
export interface IFootballPredictionVenue {
  id: number;
  name: string;
  city: string;
}

export interface IFootballPredictionStatus {
  long: string;
  short: string;
  elapsed: number;
}

export interface IFootballPredictionFixture {
  id: number;
  referee: string;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number;
    second: number;
  };
  venue: IFootballPredictionVenue;
  status: IFootballPredictionStatus;
}

export interface IFootballPredictionLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
  round: string;
}

export interface IFootballPrediction {
  winner: {
    id: number;
    name: string;
    comment: string;
  };
  win_or_draw: boolean;
  under_over: string;
  goals: {
    home: string;
    away: string;
  };
  advice: string;
  percent: {
    home: string;
    draw: string;
    away: string;
  };
}

export interface IFootballPredictionTeamStats {
  id: number;
  name: string;
  logo: string;
  last_5: {
    form: string;
    att: string;
    def: string;
    goals: {
      for: {
        total: number;
        average: number;
      };
      against: {
        total: number;
        average: number;
      };
    };
  };
  league: IFootballPredictionLeague;
}

export interface IFootballPredictionResponse {
  predictions: IFootballPrediction;
  league: IFootballPredictionLeague;
  teams: {
    home: IFootballPredictionTeamStats;
    away: IFootballPredictionTeamStats;
  };
  comparison: any;
  h2h: IFootballPredictionFixture[];
}

export interface IFootballPlayerStats {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  statistics: any[];
}

export interface IFooballTeamStats {
  team: {
    id: number;
    name: string;
    logo: string;
    update: string;
  };
  players: IFootballPlayerStats[];
  timestamp?: Date;
}

export interface IFootballPlayerStatsResponse {
  get: string;
  parameters: {
    fixture: string;
  };
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: IFooballTeamStats[];
}

export interface IFootballFixtureStatistic {
  type: string | null | number;
  value: number | string | null;
}

export interface IFootballFixtureStats {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: IFootballFixtureStatistic[];
  timestamp?: Date;
}

export interface IFootballFixtureStatsResponse {
  get: string;
  parameters: {
    team: string;
    fixture: string;
  };
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
}

//types/lineups.ts
export interface IFootballLineupPlayer {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
}

export interface IFootballLineupTeam {
  id: number;
  name: string;
  logo: string;
  colors: {
    player: {
      primary: string;
      number: string;
      border: string;
    };
    goalkeeper: {
      primary: string;
      number: string;
      border: string;
    };
  };
}

export interface IFootballLineup {
  team: IFootballLineupTeam;
  formation: string;
  startXI: { player: IFootballLineupPlayer }[];
  substitutes: { player: IFootballLineupPlayer }[];
  coach: {
    id: number;
    name: string;
    photo: string;
  };
}

export interface IPaging {
  current: number;
  total: number;
}

export interface IFootballLineupResponse {
  get: string;
  parameters: {
    fixture: string;
  };
  errors: any[];
  results: number;
  paging: IPaging;
  response: IFootballLineup[];
}

// types/football/IOddsResponse.ts
export interface IFootballOddValue {
  value: string | number;
  odd: string;
}

export interface IFootballBet {
  id: number;
  name: string;
  values: IFootballOddValue[];
}

export interface IFootballBookmaker {
  id: number;
  name: string;
  bets: IFootballBet[];
}

export interface IFootballOddFixture {
  id: number;
  timezone: string;
  date: string;
  timestamp: number;
}

export interface IFootballOddLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

export interface IFootballOdds {
  league: IFootballOddLeague;
  fixture: IFootballOddFixture;
  update: string;
  bookmakers: IFootballBookmaker[];
}

export interface IFootballOddResponse {
  get: string;
  parameters: {
    fixture: string;
    bookmaker: string;
  };
  errors: any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: IFootballOdds[];
}
