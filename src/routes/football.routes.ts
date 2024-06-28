// routes/country.routes.ts
import express from "express";
import { errorWrap } from "../utils/errors.util";
import { checkJwt } from "../middleware/auth";
import { checkUser } from "../middleware/checkUser";
import {
  createFixtureAssistant,
  getCountries,
  getFixtureLineups,
  getFixtureStatistics,
  getFixtures,
  getFixturesByDate,
  getLeagues,
  getOdds,
  getPlayerStats,
  getPredictions,
  getSeasons,
  getTeams,
  getTopAssists,
  getTopRedCards,
  getTopScorers,
  getTopYellowCards,
} from "../controllers/football.controller";

const router = express.Router();

router.use(errorWrap(checkJwt, "Could not verify jwt"));
router.use(errorWrap(checkUser, "Could not verify user"));

router.post(
  "/fixtureAgent",
  errorWrap(createFixtureAssistant, "Could not create fixture assistant")
);


//Get Sport Api 

router.get(
  "/sportCountry",
  errorWrap(getCountries, "Could not get Football countries")
);

router.get(
  "/sportLeague",
  errorWrap(getLeagues, "Could not get Football leagues")
);

router.get(
  "/sportSeason",
  errorWrap(getSeasons, "Could not get Football season")
);

router.get(
  "/sportTeam-info",
  errorWrap(getTeams, "Could not get Football Team information")
);

router.get(
  "/sport-topscorers",
  errorWrap(getTopScorers, "Could not get Football top scorers information")
);

router.get(
  "/sport-topassists",
  errorWrap(getTopAssists, "Could not get Football Top assists information")
);

router.get(
  "/sport-topyellowcards",
  errorWrap(
    getTopYellowCards,
    "Could not get Football yellow cards information"
  )
);

router.get(
  "/sport-topredcards",
  errorWrap(getTopRedCards, "Could not get Football red cards information")
);

router.get(
  "/sportFixtures",
  errorWrap(getFixtures, "Could not get Football fixtures information")
);
router.get(
  "/sportFixturesByDate",
  errorWrap(getFixturesByDate, "Could not get Football fixtures information")
);

router.get(
  "/sportPredictions",
  errorWrap(getPredictions, "Could not get Football Predictions information")
);

router.get(
  "/sportPlayerstats",
  errorWrap(getPlayerStats, "Could not get Player stats information")
);

router.get(
  "/sportFixture-stats",
  errorWrap(getFixtureStatistics, "Could not get fixture stats information")
);

router.get(
  "/sportFixtures-Lineup",
  errorWrap(getFixtureLineups, "Could not get fixture lineup information")
);

router.get("/sportOdds", errorWrap(getOdds, "Could not get odd information"));

export default router;
