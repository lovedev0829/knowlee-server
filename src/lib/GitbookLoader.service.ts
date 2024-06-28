import { GitbookLoader } from "langchain/document_loaders/web/gitbook";
import { GithubRepoLoader  } from "langchain/document_loaders/web/github";
import GitbookModel from "../models/scrap/Gitbook.model";
import GithubModel from "../models/scrap/Github.model";
import BubblemapsModel from "../models/scrap/Bubblemaps.model";

export const gitbookPost = async (entityValue: string) => {
    if (!entityValue) {
        throw new Error("EntityValue is required");
    }

    const loader = new GitbookLoader(entityValue);

    let docs = await loader.load();
    return docs;
};

export const githubRepo = async (entityValue: string) => {
    if (!entityValue) throw new Error("EntityValue is required");

    const loader = new GithubRepoLoader(entityValue);

    const docs = await loader.load();
    return docs;
};

export async function saveDataToMongoDB(
    {
        sourceType,
        subSetType,
    }: {
        sourceType: string;
        subSetType: string;
    },
    doc: any
) {
    switch (sourceType) {
        case "gitbook":
            if (subSetType === "url") {
                return await GitbookModel.insertMany(doc);
            }
        case "github":
            if (subSetType === "url") {
                return await GithubModel.insertMany(doc);
            }
        case "bubblemaps":
                return await BubblemapsModel.insertMany(doc);
        default:
            return [];
    }
}