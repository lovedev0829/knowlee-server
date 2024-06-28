import mongoose from "mongoose";
import { Schema, Document } from "mongoose";

interface IBubblemapsLink {
  backward: number;
  forward: number;
  source: number;
  target: number;
}

interface IBubblemapsMetadata {
  max_amount: number;
  min_amount: number;
}

interface IBubblemapsNode {
  address: string;
  amount: number;
  is_contract: boolean;
  name: string;
  percentage: number;
  transaction_count: number;
  transfer_X721_count: number | null;
  transfer_count: number;
}

interface IBubblemapsTokenLink {
  address: string;
  decimals?: number;
  links: IBubblemapsLink[];
  name: string;
  symbol: string;
}

interface IBubblemapsData extends Document {
  entityId: string;
  url: string;

  chain: string;
  dt_update: string;
  full_name: string;
  id: string;
  is_X721: boolean;
  links: IBubblemapsLink[];
  metadata: IBubblemapsMetadata;
  nodes: IBubblemapsNode[];
  source_id: number;
  symbol: string;
  token_address: string;
  token_links: IBubblemapsTokenLink[];
  top_500: boolean;
  version: number;
}

const BubblemapsSchema = new Schema<IBubblemapsData>(
  {
    entityId: String,
    url: String,

    chain: String,
    dt_update: String,
    full_name: String,
    id: String,
    is_X721: Boolean,
    links: [
      { backward: Number, forward: Number, source: Number, target: Number },
    ],
    metadata: { max_amount: Number, min_amount: Number },
    nodes: [
      {
        address: String,
        amount: Number,
        is_contract: Boolean,
        name: String,
        percentage: Number,
        transaction_count: Number,
        transfer_X721_count: Number,
        transfer_count: Number,
      },
    ],
    source_id: Number,
    symbol: String,
    token_address: String,
    token_links: [
      {
        address: String,
        decimals: Number,
        links: [
          { backward: Number, forward: Number, source: Number, target: Number },
        ],
        name: String,
        symbol: String,
      },
    ],
    top_500: Boolean,
    version: Number,
  },
  {
    collection: "bubblemaps", // Set the collection name to 'bubblemaps'
    strict: false,
  }
);

// Create a Mongoose model for the Bubblemaps data using the schema
const BubblemapsModel = mongoose.model<IBubblemapsData>(
  "Bubblemaps",
  BubblemapsSchema
);

export default BubblemapsModel;
