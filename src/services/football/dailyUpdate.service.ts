import cron from "node-cron";
import {
  getFixtureStatistics,
  getFixtures,
  getFixturesByDate,
  getPlayerStats,
  getPredictions,
  getTopAssists,
  getTopRedCards,
  getTopScorers,
  getTopYellowCards,
} from "../../controllers/football.controller";
import { Request, Response } from "express";

const req: Partial<Request> = {
  params: {},
  body: {},
  query: {},
};
const res: Partial<Response> = {
  status: function (code: number) {
    this.statusCode = code;
    return this;
  },
  json: function (obj: any) {
    return this;
  },
  send: (body: any) => console.log(body),
} as Partial<Response> & {
  send: (body: any) => void;
  status: (code: number) => any;
  json: (obj: any) => any;
};

export function scheduleDailyUpdates() {
  // Schedule tasks to be run on the server.
  cron.schedule("0 0 * * *", async () => {
    try {
      await getFixturesByDate(req as Request, res as Response);
      await getTopAssists(req as Request, res as Response);
      await getTopRedCards(req as Request, res as Response);
      await getTopYellowCards(req as Request, res as Response);
      await getTopScorers(req as Request, res as Response);
      await getFixtures(req as Request, res as Response);
      await getPredictions(req as Request, res as Response);
      await getFixtureStatistics(req as Request, res as Response);
      await getPlayerStats(req as Request, res as Response);
      //console.log("Data updated successfully");
    } catch (error) {
      //console.log(error);
    }
  });
}
