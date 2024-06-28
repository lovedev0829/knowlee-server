import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SOURCE_TYPES } from "../../types";

// THIS IS PDF LOCAL

const PageSchema = new Schema({
  index: { type: Number, required: true },
  content: { type: String, required: true },
});

// optional fields, not all docs contain an author, title, etc.
const MetadataSchema = new Schema({
  author: { type: String },
  title: { type: String },
  subject: { type: String  },
  keywords: { type: String  },
  producer: { type: String },
  createdDate: { type: Date, default: Date.now },
});

const PdfRecordSchema = new Schema({
  id: {
    type: String,
    default: uuidv4,
    required: true,
    unique: true,
  },
  entityId: { type: String, required: true },
  sourceType: { type: String, required: true, default: SOURCE_TYPES.PDF  },
  metadata: { type: MetadataSchema, required: true },
  pages: { type: [PageSchema], default: undefined },
  extractionDate: { type: Date, default: Date.now },
});


export const PdfRecordModel = model('PdfRecord', PdfRecordSchema);
