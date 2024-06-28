import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the Gitbook document
export interface IGitbook extends Document {
    id: string;
    entityId: string;
    createdAt: Date;
    scrapedAt: Date;
    url:string;
    content: [
        {
            pageContent: string;
            metadata: {
                source: string;
                title: string;
            };
        }
    ];
}

export interface IGitbookContentSchema extends Document {
    _id:false,
    pageContent: string;
    metadata: {
        source: string;
        title: string;
    };
}

// Create a Mongoose schema for the Gitbook data
const gitbookContentSchema = new Schema<IGitbookContentSchema>({
    _id:false,
    pageContent: { type: String },
    metadata: {
        source: { type: String },
        title: { type: String },
    },
});

const gitbookSchema = new Schema<IGitbook>({
    id: { type: String },
    url: { type: String, required: true},
    entityId: {
        type: String,
        ref: "Entity",
        required: true,
    },
    content: [gitbookContentSchema],
    createdAt: { type: Date, required: true, default: Date.now },
    scrapedAt: { type: Date, required: true, default: Date.now },
}, {
    collection: 'gitbook', // Set the collection name to 'gitbook'
    strict: false,
});

// Create a Mongoose model for the Gitbook data using the schema
const GitbookModel = mongoose.model<IGitbook>('Gitbook', gitbookSchema);

export default GitbookModel;