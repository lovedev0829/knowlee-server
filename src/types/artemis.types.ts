export interface AssetValue {
    assetName: string;
}

export interface ArtemisMetric {
    description: string;
    metric: string;
    supportsDate: boolean;
    updateFrequency: string;
}

export interface ArtemisDataEndpointResponse {
    data: {
        artemis_ids: {
            [key: string]: {
                [key: string]: any
            }
        },
        symbols: {},
    }
}
