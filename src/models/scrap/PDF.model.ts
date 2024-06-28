import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the PDF document
export interface IPDF extends Document {
    url: string;
    content: string[];
    entityId: string;
}

// Create a Mongoose schema for the PDF
const pdfSchema = new Schema<IPDF>({
    content: [{ type: String }],
    url: { type: String },
    entityId: {
        type: String,
        ref: "Entity",
        required: true,
    },
}, {
    collection: 'pdf', // Set the collection name to 'pdf'
    strict: false,
});

pdfSchema.virtual("entity", {
    ref: "Entity",
    localField: "entityId",
    foreignField: "id",
});

// Create a Mongoose model for the PDF using the schema
const PDFModel = mongoose.model<IPDF>('PDF', pdfSchema);

export default PDFModel;
