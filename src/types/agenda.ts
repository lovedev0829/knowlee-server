import { JobAttributesData } from "agenda";
import { IEntity } from "../models/entity.model";
import { IContentDocument } from "../models/content-creation/Content.model";

export interface IProcessMultipleEntities extends JobAttributesData {
    entities: IEntity[];
    userIdList: string[];
}

export interface IProcessDoubleStepEntities extends JobAttributesData {
    entities?: IEntity[];
}

export interface IRunApifyActorAgenda extends JobAttributesData {
    id: string;
    input: unknown;
}

export interface ICreateDashboardSummary extends JobAttributesData { }

export interface IGetArtemisAssetMetric extends JobAttributesData { }

export interface IFetchArtemisDataEndpoint extends JobAttributesData { }

export interface IFixUpserting extends JobAttributesData { }

export interface IFixScrapingAndUpserting extends JobAttributesData { }

export interface IResetUserUsageStatAndLog extends JobAttributesData { }

export interface IDeleteOldAgendaJobHistory extends JobAttributesData { }

export interface IScheduleContentPost extends JobAttributesData {
    content: IContentDocument;
}

export interface IRunUserProcess extends JobAttributesData {
    userProcessId: string;
}

export interface IScheduleRecurringUserProcess extends JobAttributesData {
    interval: string;
    jobName: string;
    userProcessId: string;
}

export interface IPushUserStatsToBrevo extends JobAttributesData { }
