// controllers/CountryController.ts
import { Request, Response } from "express";
import { sendResponse } from "../utils/response.utils";
import { RequestError } from "../utils/globalErrorHandler";
import { status } from "../utils/constants";
import { FootballFixtureModel } from "../models/football/fixture.model";
import {
  createFixtureStatsAwayTeamFile,
  createFixtureStatsHomeTeamFile,
  createLineupFile,
  createOddsFile,
  createPlayerStatsAwayTeamFile,
  createPlayerStatsHomeTeamFile,
  createPredicitonFile,
  getFootballCountry,
  getFootballFixtureStats,
  getFootballFixtures,
  getFootballLeagues,
  getFootballLineups,
  getFootballOdds,
  getFootballPlayerStats,
  getFootballPredictions,
  getFootballSeasons,
  getFootballTeams,
  getPlayers,
} from "../services/football.service";
import { FootballPredictionModel } from "../models/football/prediction.model";
import { openAIAssistantsCreate, openAIThreadRunCreate, openAIThreadsCreate, openAIThreadsDel, openAIThreadsMessagesCreate, openAIThreadsMessagesList } from "../services/openAI.services";
import { FootballFixtureUpcomingModel } from "../models/football/fixtureUpcoming.model";
import { Thread } from "openai/resources/beta/threads/threads";
import UserThreadModel, { IUserThreadDocument } from "../models/knowlee-agent/UserThread.model";
import { findOneAndUpdateUserThreadDocument, findOneUserThread } from "../services/knowlee-agent/userThread.services";
import { findOneAndUpdateUserUsageStatDocument } from "../services/userUsageStat.services";
import { createOneUserAgentDocument } from "../services/knowlee-agent/agent.services";

//@DESC Get all countries
//@ROUTE GET /api/football/sportCountry
const DEFAULT_MODEL = 'gpt-4o';

export const getCountries = async (req: Request, res: Response) => {
  try {
    const getCountry = await getFootballCountry();
    return sendResponse(
      res,
      status.success,
      "Countries fetched and saved successfully",
      getCountry
    );
  } catch (error) {
    throw new RequestError(
      `Something went wrong while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get all leagues
//@ROUTE GET /api/football/sportLeague

export const getLeagues = async (req: Request, res: Response) => {
  try {
    const getLeagues = await getFootballLeagues();
    return sendResponse(
      res,
      status.success,
      "Leagues fetched and saved successfully",
      getLeagues
    );
  } catch (error) {
    throw new RequestError(
      `Something went wrong when while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get Seasons
//@ROUTE GET /api/football/sportSeason

export const getSeasons = async (req: Request, res: Response) => {
  try {
    const getSeason = await getFootballSeasons();
    return sendResponse(
      res,
      status.success,
      "Season fetched and saved successfully",
      getSeason
    );
  } catch (error) {
    throw new RequestError(
      `Something went wrong when while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get Teams Info
//@ROUTE GET /api/football/sportTeam-info

export const getTeams = async (req: Request, res: Response) => {
  try {
    let league = parseInt(req.query.league as string) || 135;
    let season = parseInt(req.query.season as string) || 2023;

    const getTeams = await getFootballTeams(league, season);
    return sendResponse(
      res,
      status.success,
      "Season fetched and saved successfully",
      getTeams
    );
  } catch (error) {
    throw new RequestError(
      `Something went wrong when while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get Top Scorers
//@ROUTE GET /api/football//sport-topscorers

export const getTopScorers = async (req: Request, res: Response) => {
  try {
    let league = parseInt(req.query.league as string) || 135;
    let season = parseInt(req.query.season as string) || 2023;

    const getPlayer = await getPlayers(["players/topscorers"], league, season);
    sendResponse(
      res,
      status.success,
      "Top scorers fetched and saved successfully",
      getPlayer
    );
  } catch (error) {
    throw new RequestError(
      `Something went wrong when while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get TopAssists
//@ROUTE GET /api/football/sport-topassists

export const getTopAssists = async (req: Request, res: Response) => {
  try {
    let league = parseInt(req.query.league as string) || 135;
    let season = parseInt(req.query.season as string) || 2023;

    const getPlayer = await getPlayers(["players/topassists"], league, season);
    return sendResponse(
      res,
      status.success,
      "Top Assists fetched and saved successfully",
      getPlayer
    );
  } catch (error) {
    throw new RequestError(
      `Something went wrong when while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get Top yellow  Cards
//@ROUTE GET /api/football/sport-yellowcards

export const getTopYellowCards = async (req: Request, res: Response) => {
  try {
    let league = parseInt(req.query.league as string) || 135;
    let season = parseInt(req.query.season as string) || 2023;

    const getPlayer = await getPlayers(
      ["players/topyellowcards"],
      league,
      season
    );
    return sendResponse(
      res,
      status.success,
      "Top Yellow card  fetched and saved successfully",
      getPlayer
    );
  } catch (error) {
    throw new RequestError(
      `Something went wrong when while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get Top Red  Cards
//@ROUTE GET /api/football//sport-redcards

export const getTopRedCards = async (req: Request, res: Response) => {
  try {
    let league = parseInt(req.query.league as string) || 135;
    let season = parseInt(req.query.season as string) || 2023;

    const getPlayer = await getPlayers(["players/topredcards"], league, season);
    return sendResponse(
      res,
      status.success,
      "Top Red fetched and saved successfully",
      getPlayer
    );
  } catch (error) {
    throw new RequestError(
      `Something went wrong when while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get Fixtures
//@ROUTE GET /api/football/sportFixtures

export const getFixtures = async (req: Request, res: Response) => {
  let league = parseInt(req.query.league as string) || 135;
  let season = parseInt(req.query.season as string) || 2023;

  const getFixture = await getFootballFixtures(league, season);
  try {
    return sendResponse(
      res,
      status.success,
      "Fixtures fetched and saved successfully",
      getFixture
    );
  } catch (error) {
    throw new RequestError(
      `Something went wrong when while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get getFixturesByDate
//@ROUTE GET /api/football//sportFixturesByDate

export const getFixturesByDate = async (req: Request, res: Response) => {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0); // set the time to 00:00:00.000
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  const dayAfterTomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 3)
  );

  try {
    const specificFixtures = await FootballFixtureModel.aggregate([
      {
        $addFields: {
          convertedDate: {
            $dateFromString: {
              dateString: "$fixture.date",
            },
          },
        },
      },
      {
        $match: {
          convertedDate: {
            $gte: tomorrow,
            $lte: dayAfterTomorrow,
          },
        },
      },
    ]);

    let results: any[] = [];
    for (const fixture of specificFixtures) {
      // Check if a fixture with the same id already exists
      const existingFixture = await FootballFixtureUpcomingModel.findOne({
        "fixture.id": fixture.fixture.id,
      });

      // If it does, skip this iteration

      if (existingFixture) {
        // If it does, add it to the results and skip this iteration
        results.push(existingFixture);
      } else {
        // Save the new fixture
        const newFixture = new FootballFixtureUpcomingModel(fixture);
        await newFixture.save();
        results.push(newFixture);
      }
    }
    return sendResponse(
      res,
      status.success,
      "Upcoming matches fixture save successful",
      results
    );
  } catch (error) {
    throw new RequestError(`Something went wrong : ${error}`, status.error);
  }
};

//@DESC Get Predictions
//@ROUTE GET /api/football/sportPredictions

export const getPredictions = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0); // set the time to 00:00:00.000
    const tomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );
    const dayAfterTomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 3)
    );

    const fixtures = await FootballFixtureUpcomingModel.aggregate([
      {
        $addFields: {
          convertedDate: {
            $dateFromString: {
              dateString: "$fixture.date",
            },
          },
        },
      },
      {
        $match: {
          convertedDate: {
            $gte: tomorrow,
            $lte: dayAfterTomorrow,
          },
        },
      },
    ]);

    if (fixtures.length === 0) {
      throw new Error("No fixtures found in the next two days");
    }
    const fixtureIds = fixtures.map((fixture) => fixture.fixture.id);
    const successfulPredictions = [];
    // Fetch and save predictions for each fixture
    for (const id of fixtureIds) {
      try {
        const [prediction] = await getFootballPredictions(id);
        const newPrediction = new FootballPredictionModel(prediction);
        await newPrediction.save();
        successfulPredictions.push(newPrediction);
      } catch (error) {
        console.error(
          `Something went wrong while fetching prediction for fixture ${id}: ${error}`
        );
      }
    }
    return sendResponse(
      res,
      status.success,
      "Player stats fetched and saved successfully",
      successfulPredictions
    );
  } catch (error) {
    throw new Error(`Something went wrong while fetching : ${error}`);
  }
};

//@DESC Get Player stats
//@ROUTE GET /api/football/sportPlayerstats

export const getPlayerStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0); // set the time to 00:00:00.000
    const tomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );
    const dayAfterTomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 3)
    );

    const fixtures = await FootballFixtureModel.aggregate([
      {
        $addFields: {
          convertedDate: {
            $dateFromString: {
              dateString: "$fixture.date",
            },
          },
        },
      },
      {
        $match: {
          convertedDate: {
            $gte: tomorrow,
            $lte: dayAfterTomorrow,
          },
        },
      },
    ]);

    const playerStats = [];

    for (const fixture of fixtures) {
      const homeTeamId = fixture.teams.home.id;
      const awayTeamId = fixture.teams.away.id;

      const homeTeamPlayerStat = await getFootballPlayerStats(homeTeamId);
      const awayTeamPlayerStat = await getFootballPlayerStats(awayTeamId);

      playerStats.push(homeTeamPlayerStat, awayTeamPlayerStat);
    }

    if (playerStats.flat().length === 0) {
      return sendResponse(res, status.not_found, "No player stats found");
    } else {
      return sendResponse(
        res,
        status.success,
        "Player stats fetched and saved successfully",
        playerStats.flat()
      );
    }
  } catch (error) {
    throw new RequestError(
      `Something went wrong when while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get Fixture stats
//@ROUTE GET /api/football/sportFixture-stats

export const getFixtureStatistics = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0); // set the time to 00:00:00.000
    const tomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );
    const dayAfterTomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 3)
    );

    const fixtures = await FootballFixtureModel.aggregate([
      {
        $addFields: {
          convertedDate: {
            $dateFromString: {
              dateString: "$fixture.date",
            },
          },
        },
      },
      {
        $match: {
          convertedDate: {
            $gte: tomorrow,
            $lte: dayAfterTomorrow,
          },
        },
      },
    ]);

    const fixtureStats = [];

    for (const fixture of fixtures) {
      const homeTeamId = fixture.teams.home.id;
      const awayTeamId = fixture.teams.away.id;

      const homeTeamPlayerStat = await getFootballFixtureStats(homeTeamId);
      const awayTeamPlayerStat = await getFootballFixtureStats(awayTeamId);

      fixtureStats.push(homeTeamPlayerStat, awayTeamPlayerStat);
    }

    if (fixtureStats.flat().length === 0) {
      return sendResponse(res, status.not_found, "No player stats found");
    } else {
      return sendResponse(
        res,
        status.success,
        "Player stats fetched and saved successfully",
        fixtureStats.flat()
      );
    }
  } catch (error) {
    throw new RequestError(
      `Something went wrong when while fetching : ${error}`,
      status.error
    );
  }
};

//@DESC Get Fixture lineup
//@ROUTE GET /api/football/sportFixtures-Lineup/

export const getFixtureLineups = async (req: Request, res: Response) => {
  // Query the fixtures collection for fixtures starting in the next 30 minutes
  const fixtures = await FootballFixtureModel.aggregate([
    {
      $addFields: {
        convertedDate: {
          $toDate: "$fixture.date", // convert string to date
        },
        thirtyMinutesLater: {
          $add: [
            {
              $toDate: "$fixture.date", // convert string to date
            },
            30 * 60 * 1000, // add 30 minutes
          ],
        },
      },
    },
    {
      $match: {
        convertedDate: {
          $lte: "$thirtyMinutesLater",
        },
      },
    },
  ]);

  if (fixtures.length === 0) {
    return sendResponse(
      res,
      status.not_found,
      "No fixtures found starting in the next 30 minutes"
    );
  }

  for (const fixture of fixtures) {
    if (!fixture.fixture.id) {
      return sendResponse(res, status.not_found, "No Id found");
    } else {
      const lineup = await getFootballLineups(fixture.fixture.id);
      return sendResponse(
        res,
        status.success,
        "Lineups fetched and saved successfully",
        lineup
      );
    }
  }
};

//@DESC Get odds
//@ROUTE GET /api/football/sportOdds

export const getOdds = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0); // set the time to 00:00:00.000
    const tomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    );
    const dayAfterTomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 3)
    );

    const fixtures = await FootballFixtureModel.aggregate([
      {
        $addFields: {
          convertedDate: {
            $dateFromString: {
              dateString: "$fixture.date",
            },
          },
        },
      },
      {
        $match: {
          convertedDate: {
            $gte: tomorrow,
            $lte: dayAfterTomorrow,
          },
        },
      },
    ]);
    //console.log(fixtures.length);
    if (fixtures.length === 0) {
      return sendResponse(res, status.not_found, "No fixtures found ");
    }

    const odds: any[] = [];
    for (const fixture of fixtures) {
      if (fixture.fixture.id) {
        const fixtureOdds = await getFootballOdds(fixture.fixture.id);
        if (!odds.find((odds) => odds.fixtureId === fixture.fixture.id)) {
          odds.push({ fixtureId: fixture.fixture.id, odds: fixtureOdds });
        }
      }
    }

    for (const odd of odds) {
      sendResponse(
        res,
        status.success,
        "Odds fetched and saved successfully",
        odd
      );
    }

    return sendResponse(
      res,
      status.success,
      "Odds fetched and saved successfully",
      odds
    );
  } catch (error) {
    throw new RequestError(
      `Something went wrong while fetching : ${error}`,
      status.error
    );
  }
};

export const createFixtureAssistant = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new RequestError("Could not verify user", 401);
  const userId = user.id;
  const {
    
    team_home_name,
    team_away_name,
    fixture_id,
    team_away_id,
    team_home_id,
    entityIds,
    initialPrompts
  } = req.body;

  const existingFixture = await FootballFixtureUpcomingModel.findOne({
    "fixture.id": fixture_id,
  });
  if (!existingFixture)
    throw new RequestError("Fixture not found", status.not_found);
  
    if (existingFixture.fixture.assistantId) {
      return sendResponse(
        res,
        status.success,
        "Assistant already exists for this fixture",
        existingFixture.fixture.assistantId
      );
    }

  let file_ids: string[] = [];

  const FixtureStatsHomeId = await createFixtureStatsHomeTeamFile(
    team_home_id
  );
  const FixtureStatsAwayId = await createFixtureStatsAwayTeamFile(
    team_away_id
  );
  
  const PlayerStatsHomeId = await createPlayerStatsHomeTeamFile(team_home_id);
  const PlayerStatsAwayId = await createPlayerStatsAwayTeamFile(team_away_id);
  const PredictionsId = await createPredicitonFile(team_home_id, team_away_id);
  const oddsId = await createOddsFile(fixture_id);
  const lineUpId = await createLineupFile(team_home_id, team_away_id);

  if (FixtureStatsHomeId) file_ids.push(FixtureStatsHomeId);
  if (FixtureStatsAwayId) file_ids.push(FixtureStatsAwayId);
  if (PlayerStatsHomeId) file_ids.push(PlayerStatsHomeId);
  if (PlayerStatsAwayId) file_ids.push(PlayerStatsAwayId);
  if (PredictionsId) file_ids.push(PredictionsId);
  if (oddsId) file_ids.push(oddsId);
  if (lineUpId) file_ids.push(lineUpId);
  //console.log("🚀 ~ file: football.controller.ts:664 ~ createFixtureAssistant ~ file_ids:", file_ids)

  if (!file_ids || file_ids.length === 0) {
    throw new Error("No file_ids provided");
  }

  const assistant = await openAIAssistantsCreate({
    name: `AI Win Bet ${team_home_name}-${team_away_name}`,
    instructions: "Provide 3 events to bet on",
    metadata: {
      creatorId: userId,
    },
    // file_ids: file_ids,
    model: DEFAULT_MODEL,
  });


  let assistantId = assistant.id; // replace this with actual assistantId

  if (assistantId) {
    if (!existingFixture.fixture.assistantId) {
      const updatedFixture =
        await FootballFixtureUpcomingModel.findOneAndUpdate(
          { "fixture.id": fixture_id },
          { "fixture.assistantId": assistantId },
          { new: true } // This option returns the updated document
        );
      if (!updatedFixture) {
        throw new RequestError("Fixture not found", status.not_found);
      }
    }
  }
  
  const userUsageStat = await findOneAndUpdateUserUsageStatDocument(
    { userId: userId },
    { $inc: { userAgentCount: 1 } },
    { upsert: true, new: true }
  );

    // create userAgent document
    const userAgent = await createOneUserAgentDocument({ creatorId: userId, assistant, entityIds, initialPrompts });

  return sendResponse(res, 200, "success", { userAgent });
};