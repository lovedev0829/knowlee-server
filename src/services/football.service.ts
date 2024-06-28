import axios, { AxiosRequestConfig } from "axios";
import {
  IFooballTeamStats,
  IFootballCountry,
  IFootballFixtureResponse,
  IFootballFixtureStats,
  IFootballFixtureStatsResponse,
  IFootballLeagueResponse,
  IFootballLineup,
  IFootballLineupResponse,
  IFootballOddResponse,
  IFootballPlayerResponseData,
  IFootballPlayerStats,
  IFootballPlayerStatsResponse,
  IFootballPredictionResponse,
  IFootballTeam,
} from "../types/football";
import { FootballCountryModel } from "../models/football/country.model";
import { RequestError } from "../utils/globalErrorHandler";
import { status } from "../utils/constants";
import { FootballLeagueModel } from "../models/football/league.model";
import { SeasonModel } from "../models/football/season.model";
import { FootballTopRedCardModel } from "../models/football/topRedCard.model";
import { FootballTopYellowCardModel } from "../models/football/topYellowCard";
import { FootballTopScorerModel } from "../models/football/topScorer.model";
import { FootballTopAssistCardModel } from "../models/football/topAssists.model";
import { TeamModel } from "../models/football/team.model";
import { PlayerStatsModel } from "../models/football/playerStats.model";
import { FootballOddsModel } from "../models/football/odd.model";
import { FootballFixtureModel } from "../models/football/fixture.model";
import { FootballLineupsModel } from "../models/football/lineup.model";
import { FixtureStatsModel } from "../models/football/fixtureStats.model";
import { FootballFixtureUpcomingModel } from "../models/football/fixtureUpcoming.model";
import {
  openAIAssistantsCreate,
  openAIFilesCreate,
} from "../services/openAI.services";
import fs, { createReadStream } from "fs";
import path from "path";
import fsPromises from "fs/promises";
import { FootballPredictionModel } from "../models/football/prediction.model";

const API_FOOTBALLAPI_KEY = process.env.FOOTBALL_API_KEY as string;
const URI_FOOTBALL_API_URI = process.env.FOOTBALL_API_URI as string;

const footballApiCommonHeaders = {
  accept: "application/json",
  "x-apisports-key": API_FOOTBALLAPI_KEY,
};

//Get football country and saving into collection

export async function getFootballCountry() {
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${URI_FOOTBALL_API_URI}/countries`,
    headers: footballApiCommonHeaders,
  };

  try {
    const res = await axios.request<{ response: IFootballCountry[] }>(config);
    const countries = res.data.response;
    for (const country of countries) {
      // Check if the country already exists in the database
      const existingCountry = await FootballCountryModel.findOne({
        name: country.name,
      });

      // If the country does not exist, save it
      if (!existingCountry) {
        const newCountry = new FootballCountryModel(country);
        await newCountry.save();
      }
    }

    return countries;
  } catch (error) {
    throw new RequestError(
      `Something went wrong while fetching : ${error}`,
      status.error
    );
  }
}

//Get football Leagues and saving into collection

export async function getFootballLeagues() {
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${URI_FOOTBALL_API_URI}/leagues`,
    headers: footballApiCommonHeaders,
  };
  try {
    const res = await axios.request<{ response: IFootballLeagueResponse[] }>(
      config
    );
    const leagues = res.data.response;
    for (const leagueResponse of leagues) {
      const existingLeague = await FootballLeagueModel.findOne({
        "league.id": leagueResponse.league.id,
      });
      if (!existingLeague) {
        const newLeague = new FootballLeagueModel(leagueResponse);
        await newLeague.save();
      }
    }
    return leagues;
  } catch (error) {
    throw new RequestError(
      `Something went wrong while fetching : ${error}`,
      status.error
    );
  }
}

//Get season 2023 and saving into collection

export async function getFootballSeasons() {
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${URI_FOOTBALL_API_URI}/leagues/seasons`,
    headers: footballApiCommonHeaders,
  };

  try {
    const res = await axios.request<{ response: number[] }>(config);
    const seasons = res.data.response;

    for (const year of seasons) {
      if (year === 2023) {
        const existingSeason = await SeasonModel.findOne({ year });
        if (!existingSeason) {
          const newSeason = new SeasonModel({ year });
          await newSeason.save();
        }
      }
    }

    return seasons;
  } catch (error) {
    throw new RequestError(
      `Something went wrong while fetching : ${error}`,
      status.error
    );
  }
}

export async function getPlayers(
  endpoints: string[],
  league: number,
  season: number
): Promise<IFootballPlayerResponseData[][]> {
  const playersData: IFootballPlayerResponseData[][] = [];

  for (const endpoint of endpoints) {
    const config: AxiosRequestConfig = {
      method: "GET",
      url: `${URI_FOOTBALL_API_URI}/${endpoint}?league=${league}&season=${season}`,
      headers: footballApiCommonHeaders,
    };

    try {
      const res = await axios.request<{
        response: IFootballPlayerResponseData[];
      }>(config);
      const players = res.data.response;

      if (endpoint === "players/topredcards") {
        for (const player of players) {
          const newTopScorer = new FootballTopRedCardModel(player);
          try {
            await newTopScorer.save();
          } catch (error) {
            console.error("Error saving top scorer:", error);
          }
        }
      } else if (endpoint === "players/topyellowcards") {
        for (const player of players) {
          const newTopYellowCard = new FootballTopYellowCardModel(player);
          try {
            await newTopYellowCard.save();
          } catch (error) {
            console.error("Error saving top yellow card:", error);
          }
        }
      } else if (endpoint === "players/topscorers") {
        for (const player of players) {
          const newTopScorer = new FootballTopScorerModel(player);
          try {
            await newTopScorer.save();
          } catch (error) {
            console.error("Error saving top scorer:", error);
          }
        }
      } else if (endpoint === "players/topassists") {
        for (const player of players) {
          const newTopScorer = new FootballTopAssistCardModel(player);
          try {
            await newTopScorer.save();
          } catch (error) {
            console.error("Error saving top Assist:", error);
          }
        }
      }
      playersData.push(players);
    } catch (error) {
      throw new RequestError(
        `Something went wrong while fetching : ${error}`,
        status.error
      );
    }
  }
  return playersData;
}

async function callApi(endpoint: string, params: any = {}) {
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${URI_FOOTBALL_API_URI}/${endpoint}`,
    params: params,
    headers: footballApiCommonHeaders,
  };

  const res = await axios.request(config);
  return res.data;
}

async function getPlayersData(
  league: number,
  season: number,
  page: number = 1,
  playersData: any[] = []
) {
  const players = await callApi("players", { league, season, page });
  const newPlayersData = [...playersData, ...players.response];

  if (players.paging.current < players.paging.total) {
    page = players.paging.current + 1;
    if (page % 2 === 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return getPlayersData(league, season, page, newPlayersData);
  }
  return newPlayersData;
}

export async function getFootballTeams(league: number, season: number) {
  const teamsData = await callApi("teams", { league, season });
  const teams = teamsData.response.map((r: { team: IFootballTeam }) => r.team);

  for (const team of teams) {
    const existingTeam = await TeamModel.findOne({ id: team.id });
    if (!existingTeam) {
      const newTeam = new TeamModel(team);
      await newTeam.save();
    }
  }

  return teams;
}

export async function getFootballPredictions(fixtures: number) {
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${URI_FOOTBALL_API_URI}/predictions?fixture=${fixtures}`,
    headers: footballApiCommonHeaders,
  };

  try {
    const res = await axios.request<{
      response: IFootballPredictionResponse[];
    }>(config);
    return res.data.response;
  } catch (error) {
    throw new RequestError(
      `Something went wrong while fetching : ${error}`,
      status.error
    );
  }
}

export async function getFootballFixtures(league: number, season: number) {
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${URI_FOOTBALL_API_URI}/fixtures?league=${league}&season=${season}`,
    headers: footballApiCommonHeaders,
  };
  try {
    const res = await axios.request<{ response: IFootballFixtureResponse[] }>(
      config
    );
    const fixtures = res.data.response;

    for (const fixture of fixtures) {
      const existingFixture = await FootballFixtureModel.findOne({
        "fixture.id": fixture.fixture.id,
      });
      if (!existingFixture) {
        const newFixture = new FootballFixtureModel(fixture);
        await newFixture.save();
      }
    }
    return fixtures;
  } catch (error) {
    throw new RequestError(
      `Something went wrong while fetching : ${error}`,
      status.error
    );
  }
}

export async function getFootballPlayerStats(teamId: number) {
  // Fetch the last 10 fixtures for the team

  const fixtures = await FootballFixtureModel.find({
    $or: [{ "teams.home.id": teamId }, { "teams.away.id": teamId }],
    "fixture.date": { $lt: new Date() },
  })
    .sort({ "fixture.date": 1 })
    .limit(10);
  if (fixtures.length === 0) {
    //console.log(`No fixtures found for teamId: ${teamId}`);
    return [];
  }
  const fixtureIds = fixtures.map((fixture) => fixture.fixture.id);
  // Fetch and save player stats for each fixture
  const playerStatsPromises = fixtureIds.map(async (fixtureId) => {
    const config: AxiosRequestConfig = {
      method: "GET",
      url: `${URI_FOOTBALL_API_URI}/fixtures/players?fixture=${fixtureId}&team=${teamId}`,
      headers: footballApiCommonHeaders,
    };

    try {
      const res = await axios.request<{
        response: IFooballTeamStats[];
      }>(config);
      const playerStats = res.data.response;

      if (playerStats.length === 0) {
        //console.log(`No player stats found for fixtureId: ${fixtureId}`);
      }

      for (const stats of playerStats) {
        const newPlayerStats = new PlayerStatsModel(stats);
        await newPlayerStats.save();
      }
      return playerStats;
    } catch (error) {
      throw new RequestError(
        `Something went wrong while fetching : ${error}`,
        status.error
      );
    }
  });
  let allPlayerStats = [];
  for (let i = 0; i < playerStatsPromises.length; i++) {
    let stats = await playerStatsPromises[i];
    allPlayerStats.push(stats);
  }
  return allPlayerStats.flat();
}

export async function getFootballFixtureStats(teamId: number) {
  // Fetch the last 10 fixtures for the team

  const fixtures = await FootballFixtureModel.find({
    $or: [{ "teams.home.id": teamId }, { "teams.away.id": teamId }],
    "fixture.date": { $lt: new Date() },
  })
    .sort({ "fixture.date": 1 })
    .limit(10);
  if (fixtures.length === 0) {
    //console.log(`No fixtures found for teamId: ${teamId}`);
    return [];
  }
  const fixtureIds = fixtures.map((fixture) => fixture.fixture.id);
  // Fetch and save fixture stats for each fixture
  const fixtureStatsPromises = fixtureIds.map(async (fixtureId) => {
    const config: AxiosRequestConfig = {
      method: "GET",
      url: `${URI_FOOTBALL_API_URI}/fixtures/statistics?fixture=${fixtureId}&team=${teamId}`,
      headers: footballApiCommonHeaders,
    };

    try {
      const res = await axios.request<{
        response: IFootballFixtureStats[];
      }>(config);
      const fixtureStats = res.data.response;

      if (fixtureStats.length === 0) {
        //console.log(`No fixture stats found for fixtureId: ${fixtureId}`);
      }

      for (const stats of fixtureStats) {
        const newFixtureStats = new FixtureStatsModel(stats);
        await newFixtureStats.save();
      }
      return fixtureStats;
    } catch (error) {
      throw new RequestError(
        `Something went wrong while fetching : ${error}`,
        status.error
      );
    }
  });
  let allFixtureStats = [];
  for (let i = 0; i < fixtureStatsPromises.length; i++) {
    let stats = await fixtureStatsPromises[i];
    allFixtureStats.push(stats);
  }
  return allFixtureStats.flat();
}

export async function getFootballOdds(fixture: number) {
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${URI_FOOTBALL_API_URI}/odds?fixture=${fixture}`,
    headers: footballApiCommonHeaders,
  };
  try {
    const res = await axios.request<{ response: IFootballOddResponse[] }>(
      config
    );
    const odds = res.data.response;
    for (const odd of odds) {
      const newOdd = new FootballOddsModel(odd);
      try {
        await newOdd.save();
      } catch (error) {
        console.error("Error saving odd:", error);
      }
    }
    return odds;
  } catch (error) {
    throw new RequestError(
      `Something went wrong while fetching : ${error}`,
      status.error
    );
  }
}

export async function getFootballLineups(fixtureId: number) {
  const config: AxiosRequestConfig = {
    method: "GET",
    url: `${URI_FOOTBALL_API_URI}/fixtures/lineups?fixture=${fixtureId}`,
    headers: footballApiCommonHeaders,
  };

  try {
    const res = await axios.request<{ response: IFootballLineup[] }>(config);
    const lineups = res.data.response;
    // Check if the lineups array is empty
    if (lineups.length === 0) {
      throw new Error(`No lineup found for fixture ID ${fixtureId}`);
    }
    for (const lineup of lineups) {
      const newLineup = new FootballLineupsModel(lineup);
      try {
        await newLineup.save();
        //console.log("Lineup saved:", lineup);
      } catch (error) {
        console.error("Error saving lineup:", error);
      }
    }
    return lineups;
  } catch (error) {
    console.error(`Something went wrong while fetching : ${error}`);
    throw new RequestError(
      `Something went wrong while fetching : ${error}`,
      status.error
    );
  }
}

export const createFixtureStatsAwayTeamFile = async (
  team_away_id: number
) => {
  try {
    if (!team_away_id) {
      console.warn(`team_away_id is undefined or null`);
      return null;
    }
    const teamAwayData = await FixtureStatsModel.find({
      "team.id": team_away_id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    if (
      !teamAwayData ||
      teamAwayData.length === 0
    ) {
      console.warn(
        `No data found for team_away_id ${team_away_id}`
      );
      return "";
    };
    const fileName = `FixtureStats${team_away_id}`;
    await fsPromises.writeFile(fileName, JSON.stringify(teamAwayData));
    const files = await openAIFilesCreate({
      file: createReadStream(fileName),
    });
    await fsPromises.unlink(fileName);
    return files?.id;
  } catch (error) {
    throw new RequestError(
      `Error while creating the createFixtureStatsAwayTeamFile : ${error}`,
      status.error
    );
  }
};

export const createFixtureStatsHomeTeamFile = async (
  team_home_id: number,
) => {
  try {
    if (!team_home_id) {
      console.warn(`team_home_id is undefined or null`);
      return null;
    }
    const teamHomeData = await FixtureStatsModel.find({
      "team.id": team_home_id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    if (
      !teamHomeData ||
      teamHomeData.length === 0
    ) {
      console.warn(
        `No data found for team_home_id ${team_home_id}`
      );
      return "";
    }
    const fileName = `FixtureStats${team_home_id}`;
    await fsPromises.writeFile(fileName, JSON.stringify(teamHomeData));
    const files = await openAIFilesCreate({
      file: createReadStream(fileName),
    });
    await fsPromises.unlink(fileName);
    return files?.id;
  } catch (error) {
    throw new RequestError(
      `Error while creating the createFixtureStatsFile : ${error}`,
      status.error
    );
  }
};

export const createPlayerStatsHomeTeamFile = async (
  team_home_id: number,
) => {
  try {
    if (!team_home_id) {
      console.warn(`team_home_id is undefined or null`);
      return null;
    }

    const teamHomeData = await PlayerStatsModel.find({
      "team.id": team_home_id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    if (
      !teamHomeData ||
      teamHomeData.length === 0
    ) {
      console.warn(
        `No data found for or team_home_id ${team_home_id}`
      );
      return "";
    }
    const fileName = `PlayerStats${team_home_id}`;
    await fsPromises.writeFile(fileName, JSON.stringify(teamHomeData));
    const files = await openAIFilesCreate({
      file: createReadStream(fileName),
    });
    await fsPromises.unlink(fileName);
    return files?.id;
  } catch (error) {
    throw new RequestError(
      `Error while creating the createPlayerStatsHomeTeamFile : ${error}`,
      status.error
    );
  }
};
export const createPlayerStatsAwayTeamFile = async (
  team_away_id: number,
) => {
  try {
    if (!team_away_id) {
      console.warn(`team_away_id is undefined or null`);
      return null;
    }

    const teamAwayData = await PlayerStatsModel.find({
      "team.id": team_away_id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    if (
      !teamAwayData ||
      teamAwayData.length === 0
    ) {
      console.warn(
        `No data found for or team_home_id ${team_away_id}`
      );
      return "";
    }
    const fileName = `PlayerStats${team_away_id}`;
    await fsPromises.writeFile(fileName, JSON.stringify(teamAwayData));
    const files = await openAIFilesCreate({
      file: createReadStream(fileName),
    });
    await fsPromises.unlink(fileName);
    return files?.id;
  } catch (error) {
    throw new RequestError(
      `Error while creating the createPlayerStatsAwayTeamFile : ${error}`,
      status.error
    );
  }
}

export const createPredicitonFile = async (
  team_home_id: number,
  team_away_id: number
) => {
  try {
    if (!team_away_id || !team_home_id) {
      console.warn(`team_away_id or team_home_id is undefined or null`);
      return null;
    }
    const teamData = await FootballPredictionModel.findOne({
      "teams.home.id": team_home_id,
      "teams.away.id": team_away_id,
    });
    if (!teamData) {
      console.warn(
        `No data found for team_away_id ${team_away_id} or team_home_id ${team_home_id}`
      );
      return "";
    }
    const fileName = `Prediction${team_away_id}_${team_home_id}`;
    await fsPromises.writeFile(fileName, JSON.stringify(teamData));
    const files = await openAIFilesCreate({
      file: createReadStream(fileName),
    });
    await fsPromises.unlink(fileName);
    return files?.id ?? "";
  } catch (error) {
    throw new RequestError(
      `Error while creating the createPredicitonStatsFile : ${error}`,
      status.error
    );
  }
};

export const createOddsFile = async (fixture_id: number) => {
  try {
    if (!fixture_id) {
      console.warn(`fixture_id is undefined or null`);
      return null;
    }
    const teamData = await FootballOddsModel.findOne({
      "fixture.id": fixture_id,
    });
    if (!teamData) {
      console.warn(`No data found for Odds ${fixture_id}`);
      return "";
    }
    const fileName = `Odds${fixture_id}`;
    await fsPromises.writeFile(fileName, JSON.stringify(teamData));
    const files = await openAIFilesCreate({
      file: createReadStream(fileName),
    });
    await fsPromises.unlink(fileName);
    return files?.id;
  } catch (error) {
    throw new RequestError(
      `Error while creating the createOddStatsFile : ${error}`,
      status.error
    );
  }
};

export const createLineupFile = async (
  team_home_id: number,
  team_away_id: number
) => {
  try {
    if (!team_away_id || !team_home_id) {
      console.warn(`team_away_id or team_home_id is undefined or null`);
      return null;
    }
    const teamAwayData = await FootballLineupsModel.find({
      "team.id": team_away_id,
    });

    const teamHomeData = await FootballLineupsModel.find({
      "team.id": team_home_id,
    });

    if (
      !teamAwayData ||
      !teamHomeData ||
      teamAwayData.length === 0 ||
      teamHomeData.length === 0
    ) {
      console.warn(
        `No data found for team_away_id ${team_away_id} or team_home_id ${team_home_id}`
      );
      return "";
    }
    const LineupStatdata = [...teamAwayData, ...teamHomeData];
    const fileName = `lineup${team_away_id}_${team_home_id}`;
    await fsPromises.writeFile(fileName, JSON.stringify(LineupStatdata));
    const files = await openAIFilesCreate({
      file: createReadStream(fileName),
    });
    await fsPromises.unlink(fileName);
    return files?.id;
  } catch (error) {
    throw new RequestError(
      `Error while creating the createLineupStatsFile : ${error}`,
      status.error
    );
  }
};
