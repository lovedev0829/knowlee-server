import axios, { AxiosError } from "axios";
import { IArtemisMetric } from "../../models/artemis/artemisMetric.model";
import { ArtemisMetric, ArtemisDataEndpointResponse } from "../../types/artemis.types";
import {
    ARTEMIS_DATE_NOT_SUPPORTED_TERMINAL_METRICS,
    ARTEMIS_DATE_SUPPORTED_TERMINAL_METRICS,
    ARTEMIS_LENDING_ARTEMISIDS,
    ARTEMIS_LENDING_METRICS,
    ARTEMIS_PERPETUALS_ARTEMISIDS,
    ARTEMIS_PERPETUALS_METRICS,
    ARTEMIS_TERMINAL_ARTEMISIDS,
} from "./artemis.data";

export function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

export const artemisBaseUrl = "https://api.artemisxyz.com";

export async function fetchArtemisAssetMetric(assets: string, metricDocument: ArtemisMetric) {
    try {


        const params: {
            startDate?: string,
            endDate?: string,
        } = {};

        const endDate = new Date();

        const yesterday = new Date(endDate);
        yesterday.setDate(endDate.getDate() - 1);


        if (metricDocument.supportsDate) {
            params.startDate = formatDate(yesterday);
            params.endDate = formatDate(endDate);
        }
        //console.log("----->", `${artemisBaseUrl}/asset/${assets}/metric/${metricDocument.metric}`);

        const res = await axios.get(
            `${artemisBaseUrl}/asset/${assets}/metric/${metricDocument.metric}`,
            {
                params: params,
            }
        );

        return res.data;
    } catch (error) {
        const errorResponse = (error as AxiosError<{ error: string }>)?.response?.data;
        if (errorResponse) {
            // throw new Error(errorResponse.error);
            console.error("ERROR: errorResponse.error")
        }
        throw new Error(error as string);
    }
}

export async function fetchArtemisData(metrics: string, params: any) {
    try {
        // //console.log("----->", `${artemisBaseUrl}/data/${metrics}`);
        const res = await axios.get<ArtemisDataEndpointResponse>(
            `${artemisBaseUrl}/data/${metrics}`,
            {
                params: params,
            }
        );

        return res.data;
    } catch (error) {
        const errorResponse = (error as AxiosError<{ error: string }>)?.response?.data;
        if (errorResponse) {
            // throw new Error(errorResponse.error);
            console.error(`ERROR: ${errorResponse.error}`)
        }
        throw new Error(error as string);
    }
}

export async function fetchDateSupportedArtemisTerminalData() {
    const metrics = ARTEMIS_DATE_SUPPORTED_TERMINAL_METRICS.join(",");
    const artemisIds = ARTEMIS_TERMINAL_ARTEMISIDS.join(",");

    const endDate = new Date();

    // will change this as needed
    const yesterday = new Date(endDate);
    yesterday.setDate(endDate.getDate() - 1);

    const weekAgo = new Date(endDate);
    weekAgo.setDate(endDate.getDate() - 30);

    const params = {
        artemisIds: artemisIds,
        endDate: formatDate(endDate),
        startDate: formatDate(weekAgo),
    };
    const response = await fetchArtemisData(metrics, params);
    return response.data;
}

export async function fetchDateNotSupportedArtemisTerminalData() {
    const metrics = ARTEMIS_DATE_NOT_SUPPORTED_TERMINAL_METRICS.join(",");
    const artemisIds = ARTEMIS_TERMINAL_ARTEMISIDS.join(",");
    const params = {
        artemisIds: artemisIds,
    };
    const response = await fetchArtemisData(metrics, params);
    return response.data;
}

export async function fetchArtemisPerpetualsData() {
    const metrics = ARTEMIS_PERPETUALS_METRICS.join(",");
    const artemisIds = ARTEMIS_PERPETUALS_ARTEMISIDS.join(",");

    const endDate = new Date();

    // will change this as needed
    const yesterday = new Date(endDate);
    yesterday.setDate(endDate.getDate() - 1);

    const weekAgo = new Date(endDate);
    weekAgo.setDate(endDate.getDate() - 30);

    const params = {
        artemisIds: artemisIds,
        endDate: formatDate(endDate),
        startDate: formatDate(weekAgo),
    };
    const response = await fetchArtemisData(metrics, params);
    return response.data;
}

export async function fetchArtemisLendingData() {
    const metrics = ARTEMIS_LENDING_METRICS.join(",");
    const artemisIds = ARTEMIS_LENDING_ARTEMISIDS.join(",");

    const endDate = new Date();

    // will change this as needed
    const yesterday = new Date(endDate);
    yesterday.setDate(endDate.getDate() - 1);

    const weekAgo = new Date(endDate);
    weekAgo.setDate(endDate.getDate() - 30);

    const params = {
        artemisIds: artemisIds,
        endDate: formatDate(endDate),
        startDate: formatDate(weekAgo),
    };
    const response = await fetchArtemisData(metrics, params);
    return response.data;
}
