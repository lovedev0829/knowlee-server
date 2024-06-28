import { FilterQuery, ProjectionType, QueryOptions } from "mongoose";
import ArtemisDataModel, { IArtemisData } from "../../models/artemis/artemisData.model";
import {
    ARTEMIS_DATE_NOT_SUPPORTED_TERMINAL_METRICS,
    ARTEMIS_DATE_SUPPORTED_TERMINAL_METRICS,
    ARTEMIS_LENDING_ARTEMISIDS,
    ARTEMIS_LENDING_METRICS,
    ARTEMIS_PERPETUALS_ARTEMISIDS,
    ARTEMIS_PERPETUALS_METRICS,
    ARTEMIS_TERMINAL_ARTEMISIDS,
} from "./artemis.data";

export async function findArtemisDataDocuments(
    filter: FilterQuery<IArtemisData>,
    projection?: ProjectionType<IArtemisData>,
    options?: QueryOptions<IArtemisData>
) {
    return await ArtemisDataModel.find(filter, projection, options);
}

export const findOneArtemisDataDocument = async (
    filter?: FilterQuery<IArtemisData>,
    projection?: ProjectionType<IArtemisData>,
    options?: QueryOptions<IArtemisData>
) => {
    return await ArtemisDataModel.findOne(filter, projection, options);
};

export function formatArtemisDataResponse(
    artemisIdList: string[],
    metricList: string[],
    data: any,
) {
    const formattedData = [];
    for (const artemisId of artemisIdList) {
        const artemisIdData = data?.[artemisId];
        if (!artemisIdData) {
            console.error(
                `No data found for ${artemisId} in artemis data response`
            );
            continue;
        }
        for (const metric of metricList) {
            const artemisIdMetricData = artemisIdData?.[metric];
            formattedData.push({
                artemisId: artemisId,
                metric: metric,
                data: artemisIdMetricData,
            });
        }
    }
    return formattedData;
}

export async function storeDateSupportedArtemisTerminalData(data: any) {
    const formattedData = formatArtemisDataResponse(
        ARTEMIS_TERMINAL_ARTEMISIDS,
        ARTEMIS_DATE_SUPPORTED_TERMINAL_METRICS,
        data,
    );
    await ArtemisDataModel.insertMany(formattedData);
    return formattedData;
}

export async function storeDateNotSupportedArtemisTerminalData(data: any) {
    const formattedData = formatArtemisDataResponse(
        ARTEMIS_TERMINAL_ARTEMISIDS,
        ARTEMIS_DATE_NOT_SUPPORTED_TERMINAL_METRICS,
        data,
    );
    await ArtemisDataModel.insertMany(formattedData);
    return formattedData;
}

export async function storeArtemisPerpetualsData(data: any) {
    const formattedData = formatArtemisDataResponse(
        ARTEMIS_PERPETUALS_ARTEMISIDS,
        ARTEMIS_PERPETUALS_METRICS,
        data,
    );
    await ArtemisDataModel.insertMany(formattedData);
    return formattedData;
}

export async function storeArtemisLendingData(data: any) {
    const formattedData = formatArtemisDataResponse(
        ARTEMIS_LENDING_ARTEMISIDS,
        ARTEMIS_LENDING_METRICS,
        data,
    );
    await ArtemisDataModel.insertMany(formattedData);
    return formattedData;
}
