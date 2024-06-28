import Agenda, { Job, JobAttributes, DefineOptions, JobAttributesData, JobOptions, Processor } from "agenda";
import { Filter } from "mongodb";
import { performance } from "perf_hooks";
import {
    ICreateDashboardSummary,
    IDeleteOldAgendaJobHistory,
    IFetchArtemisDataEndpoint,
    IFixScrapingAndUpserting,
    IFixUpserting,
    IGetArtemisAssetMetric,
    IProcessDoubleStepEntities,
    IProcessMultipleEntities,
    IPushUserStatsToBrevo,
    IResetUserUsageStatAndLog,
    IRunApifyActorAgenda,
    IRunUserProcess,
    IScheduleContentPost,
    IScheduleRecurringUserProcess,
} from "../types/agenda";
import {
    createDashboardSummaryProcessor,
    scheduleContentPostProcessor,
    deleteOldAgendaJobHistoryProcessor,
    doubleStepEntitiesProcessor,
    fetchArtemisDataEndpointProcessor,
    fixOnlyUpsertingProcessor,
    fixScrapingAndUpsertingProcessor,
    getArtemisAssetMetricProcessor,
    multipleEntitiesProcessor,
    resetUserUsageStatAndLogProcessor,
    runApifyActorAndGetResultsProcessor,
    runUserProcessProcessor,
    scheduleRecurringUserProcessProcessor,
    pushUserStatsToBrevoProcessor,
} from "./agendaProcessor";
import { createOneAgendaJobHistory } from "../services/agenda/agendaJobHistory.services";

const MONGODB_URI = process.env.MONGODB_URI as string;
const APIFY_CONCURRENT_ACTOR_RUN = Number(process.env.APIFY_CONCURRENT_ACTOR_RUN || 32);

export const agenda = new Agenda({
    db: { address: MONGODB_URI },
    processEvery: "5 minutes",
});

agenda.on("ready", async () => {
    if (process.env.DEPLOY_ENV !== "development") {
        await agenda.purge();
    }
    // Comment out this line to pause agenda
    await agenda.start();
    setupJobs();
    scheduleJobs();
});

agenda.on("error", (error) => {
    console.error(`Agenda error: ${error}`);
});

agenda.on("start", (job: Job) => {
    (job as any).startTime = performance.now();
    console.log(`Job ${job.attrs.name} starting`);
});

agenda.on("complete", (job: Job) => {
    const endTime = performance.now();
    const duration = endTime - (job as any).startTime;
    console.log(`Job ${job.attrs.name} finished in ${duration.toFixed(2)}ms`);
});

agenda.on("fail", async (error, job: Job) => {
    const endTime = performance.now();
    const duration = endTime - (job as any).startTime;
    console.error(`Job ${job.attrs.name} failed after ${duration.toFixed(2)}ms with error: ${error.message}`);
    try {
        await createOneAgendaJobHistory({
            error: error.message,
            job: { ...job.toJSON(), _id: undefined },
        });
    } catch (err) {
        console.error("Error logging failed job:", err);
    }
});

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

async function gracefulShutdown() {
    await agenda.stop();
    process.exit(0);
}

// Define job names as constants
export const PROCESS_MULTIPLE_ENTITIES = "PROCESS_MULTIPLE_ENTITIES";
export const PROCESS_DOUBLE_STEP_ENTITIES = "PROCESS_DOUBLE_STEP_ENTITIES";
export const RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA = "RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA";
export const CREATE_DASHBOARD_SUMMARY = "CREATE_DASHBOARD_SUMMARY";
export const GET_ARTEMIS_ASSET_METRIC = "GET_ARTEMIS_ASSET_METRIC";
export const FETCH_ARTEMIS_DATA_ENDPOINT = "FETCH_ARTEMIS_DATA_ENDPOINT";
export const FIX_UPSERTING = "FIX_UPSERTING";
export const FIX_SCRAPING_AND_UPSERTING = "FIX_SCRAPING_AND_UPSERTING";
export const RESET_USER_USAGE_STAT_AND_LOG = "RESET_USER_USAGE_STAT_AND_LOG";
export const DELETE_OLD_AGENDA_JOB_HISTORY = "DELETE_OLD_AGENDA_JOB_HISTORY";
export const SCHEDULE_CONTENT_POST = "SCHEDULE_CONTENT_POST";
export const RUN_USER_PROCESS = "RUN_USER_PROCESS";
export const SCHEDULE_RECURRING_USER_PROCESS = "SCHEDULE_RECURRING_USER_PROCESS";
export const PUSH_USER_STATS_TO_BREVO = "PUSH_USER_STATS_TO_BREVO";

const setupJobs = () => {
    agenda.define<IProcessMultipleEntities>(
        PROCESS_MULTIPLE_ENTITIES,
        { shouldSaveResult: true, concurrency: APIFY_CONCURRENT_ACTOR_RUN },
        multipleEntitiesProcessor
    );

    agenda.define<IProcessDoubleStepEntities>(
        PROCESS_DOUBLE_STEP_ENTITIES,
        { shouldSaveResult: true, concurrency: APIFY_CONCURRENT_ACTOR_RUN },
        doubleStepEntitiesProcessor
    );

    agenda.define<IRunApifyActorAgenda>(
        RUN_APIFY_ACTOR_AND_GET_DATA_AGENDA,
        { shouldSaveResult: true, concurrency: APIFY_CONCURRENT_ACTOR_RUN },
        runApifyActorAndGetResultsProcessor
    );

    agenda.define<ICreateDashboardSummary>(
        CREATE_DASHBOARD_SUMMARY,
        { shouldSaveResult: true },
        createDashboardSummaryProcessor
    );

    agenda.define<IGetArtemisAssetMetric>(
        GET_ARTEMIS_ASSET_METRIC,
        { shouldSaveResult: true },
        getArtemisAssetMetricProcessor
    );

    agenda.define<IFetchArtemisDataEndpoint>(
        FETCH_ARTEMIS_DATA_ENDPOINT,
        { shouldSaveResult: true },
        fetchArtemisDataEndpointProcessor
    );

    agenda.define<IFixUpserting>(
        FIX_UPSERTING,
        { shouldSaveResult: true },
        fixOnlyUpsertingProcessor
    );

    agenda.define<IFixScrapingAndUpserting>(
        FIX_SCRAPING_AND_UPSERTING,
        { shouldSaveResult: true },
        fixScrapingAndUpsertingProcessor
    );

    agenda.define<IResetUserUsageStatAndLog>(
        RESET_USER_USAGE_STAT_AND_LOG,
        { shouldSaveResult: true },
        resetUserUsageStatAndLogProcessor
    );

    agenda.define<IDeleteOldAgendaJobHistory>(
        DELETE_OLD_AGENDA_JOB_HISTORY,
        { shouldSaveResult: true },
        deleteOldAgendaJobHistoryProcessor
    );

    agenda.define<IPushUserStatsToBrevo>(
        PUSH_USER_STATS_TO_BREVO,
        { shouldSaveResult: true },
        pushUserStatsToBrevoProcessor
    );

    agenda.define<IScheduleContentPost>(
        SCHEDULE_CONTENT_POST,
        { shouldSaveResult: true },
        scheduleContentPostProcessor
    );

    agenda.define<IRunUserProcess>(
        RUN_USER_PROCESS,
        { shouldSaveResult: true },
        runUserProcessProcessor
    );

    agenda.define<IScheduleRecurringUserProcess>(
        SCHEDULE_RECURRING_USER_PROCESS,
        { shouldSaveResult: true },
        scheduleRecurringUserProcessProcessor
    );
};

const scheduleJobs = () => {
    agenda.every("1 day", PROCESS_DOUBLE_STEP_ENTITIES, {}, { skipImmediate: true });

    agenda.every("0 1 * * *", RESET_USER_USAGE_STAT_AND_LOG, {}, { skipImmediate: true, timezone: "UTC" });

    agenda.every("0 0 * * *", DELETE_OLD_AGENDA_JOB_HISTORY, {}, { skipImmediate: true, timezone: "UTC" });

    agenda.every("0 2 * * *", PUSH_USER_STATS_TO_BREVO, {}, { skipImmediate: true, timezone: "UTC" });
};

export async function agendaCancel(query: Filter<JobAttributes>) {
    return await agenda.cancel(query);
}

export async function agendaSchedule<T extends JobAttributesData>(
    when: string | Date,
    names: string,
    data: T
) {
    return await agenda.schedule(when, names, data);
}

export async function agendaDefine<T>(
    name: string,
    options: DefineOptions | Processor<T>,
    processor?: Processor<T>
) {
    return agenda.define<T>(name, options, processor);
}

export async function agendaEvery(
    interval: string,
    names: string | string[],
    data?: JobAttributesData,
    options?: JobOptions
) {
    return await agenda.every(interval, names, data, options);
}
