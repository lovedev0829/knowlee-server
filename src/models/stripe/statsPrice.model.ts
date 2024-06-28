import mongoose, { Schema, Document } from "mongoose";

export interface IStatsPrice extends Document {
    features: {
        tokens: {
            unitCost: number;
            perUnit: number;
        };
        localFileSource: {
            unitCost: number;
        };
        staticDataSource: {
            unitCost: number;
        };
        dynamicDataSource: {
            unitCost: number;
        };
        userAgent: {
            unitCost: number;
        };
        imageInterpretation: {
            unitCost: number;
        };
        textToImage: {
            unitCost: number;
        };
        textToVideo: {
            unitCost: number;
        };
        speechToText: {
            unitCost: number;
        };
    };
}

const StatsPriceSchema = new Schema<IStatsPrice>(
    {
        features: {
            tokens: {
                unitCost: {
                    type: Number,
                    default: 0,
                    required: true,
                },
                perUnit: {
                    type: Number,
                    default: 0,
                    required: true,
                },
            },
            LocalFileSource: {
                unitCost: {
                    type: Number,
                    default: 0,
                    required: true,
                },
            },
            staticDataSource: {
                unitCost: {
                    type: Number,
                    default: 0,
                    required: true,
                },
            },
            dynamicDataSource: {
                unitCost: {
                    type: Number,
                    default: 0,
                    required: true,
                },
            },
            userAgent: {
                unitCost: {
                    type: Number,
                    default: 0,
                    required: true,
                },
            },
            imageInterpretation: {
                unitCost: {
                    type: Number,
                    default: 0,
                    required: true,
                },
            },
            textToImage: {
                unitCost: {
                    type: Number,
                    default: 0,
                    required: true,
                },
            },
            textToVideo: {
                unitCost: {
                    type: Number,
                    default: 0,
                    required: true,
                },
            },
            speechToText: {
                unitCost: {
                    type: Number,
                    default: 0,
                    required: true,
                },
            },
        },
    },
    {
        strict: false,
        timestamps: true,
    }
);

const StatsPrice = mongoose.model<IStatsPrice>("StatsPrice", StatsPriceSchema);

export default StatsPrice;
