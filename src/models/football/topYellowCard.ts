import { model, Schema, Document } from "mongoose";
import { IFootballPlayerResponse } from "../../types/football";

export type IFootballTopYellowDocument = IFootballPlayerResponse & Document;

const PlayerSchema = new Schema({
  player: {
    id: Number,
    name: String,
    firstname: String,
    lastname: String,
    age: Number,
    birth: {
      date: String,
      place: String,
      country: String,
    },
    nationality: String,
    height: String,
    weight: String,
    injured: Boolean,
    photo: String,
  },
  statistics: [
    {
      team: {
        id: Number,
        name: String,
        logo: String,
      },
      league: {
        id: Number,
        name: String,
        country: String,
        logo: String,
        flag: String,
        season: Number,
      },
      games: Object,
      substitutes: Object,
      shots: Object,
      goals: Object,
      passes: Object,
      tackles: Object,
      duels: Object,
      dribbles: Object,
      fouls: Object,
      cards: Object,
      penalty: Object,
    },
  ],
});

export const FootballTopYellowCardModel = model<IFootballTopYellowDocument>(
  "FootballTopYellowCard",
  PlayerSchema
);
