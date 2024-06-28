// models/football/playerStats.model.ts
import { model, Schema, Document } from "mongoose";
import { IFooballTeamStats } from "../../types/football";

export type IPlayerStatsDocument = IFooballTeamStats & Document;

const PlayerStatsSchema = new Schema({
  team: {
    id: Number,
    name: String,
    logo: String,
    update: Date,
  },
  players: [
    {
      player: {
        id: Number,
        name: String,
        photo: String,
      },
      statistics: [Schema.Types.Mixed],
    },
  ],
},{
  timestamps: true,
});

export const PlayerStatsModel = model<IPlayerStatsDocument>(
  "FootballPlayerStats",
  PlayerStatsSchema
);
