import { model, Schema, Document } from "mongoose";
import { IFootballPredictionResponse } from "../../types/football";

export type IFootballPredictionDocument = IFootballPredictionResponse &
  Document;

const PredictionSchema = new Schema({
  winner: {
    id: Number,
    name: String,
    comment: String,
  },
  win_or_draw: Boolean,
  under_over: String,
  goals: {
    home: String,
    away: String,
  },
  advice: String,
  percent: {
    home: String,
    draw: String,
    away: String,
  },
});

const LeagueSchema = new Schema({
  id: Number,
  name: String,
  country: String,
  logo: String,
  flag: String,
  season: Number,
  round: String,
});

const TeamSchema = new Schema({
  id: Number,
  name: String,
  logo: String,
  last_5: {
    form: String,
    att: String,
    def: String,
    goals: {
      for: {
        total: Number,
        average: Number,
      },
      against: {
        total: Number,
        average: Number,
      },
    },
  },
  league: LeagueSchema,
});

const FootballPredictionSchema = new Schema({
  predictions: PredictionSchema,
  league: LeagueSchema,
  teams: {
    home: TeamSchema,
    away: TeamSchema,
  },
  comparison: Schema.Types.Mixed,
  h2h: Schema.Types.Mixed,
});

export const FootballPredictionModel = model<IFootballPredictionDocument>(
  "FootballPrediction",
  FootballPredictionSchema
);
