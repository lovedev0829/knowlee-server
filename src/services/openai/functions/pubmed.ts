import { 
    entryPoints, 
    getRequest, 
    ApiKey 
} from '../../../lib/pubmed/pubmed.services';

import { 
    ESearchOptions ,
    EsearchOptionalArgsBuilder,
    ESummaryOptions,
    ESummaryOptionalArgsBuilder,
    EFetchOptions,
    EFetchOptionalArgsBuilder,
    ELinkOptions,
    ELinkOptionalArgsBuilder
} from '../../../lib/pubmed/searchOptions.services';

export async function pubMedEsearchGetFunction({
    db,
    term,
    ...params
}: {
    db: string,
    term: string,
    retMode: string
}&ESearchOptions){

    if(term == null || term == "") return "please provide term!";
    const encodedTerm = encodeURIComponent(term); // Encoding the term
    const datas = await getRequest(
        entryPoints.esearch,
        `db=${db}&term=${encodedTerm}&api_key=${ApiKey}${EsearchOptionalArgsBuilder(
        params,
        )}`,
    );
    return datas;
};


export async function pubMedESummaryGetFunction({
    db,
    id,
    ...params
}: {
    db: string,
    id: Array<string>,
}&ESummaryOptions){

    if(id.length == 0) return "please provide any Id!";
    
    const datas = await getRequest(
        entryPoints.esummary,
        `db=${db}&id=${id.join(",")}&api_key=${ApiKey}${ESummaryOptionalArgsBuilder(
            params,
        )}`,
      );
    return datas;
};

export async function pubMedEFetchGetFunction({
    db,
    id,
    ...params
}: {
    db: string,
    id: Array<string>,
}&EFetchOptions){

    if(id.length == 0) return "please provide any Id!";
    
    const datas = await getRequest(
        entryPoints.efetch,
        `db=${db}&id=${id.join(",")}&api_key=${ApiKey}${EFetchOptionalArgsBuilder(
            params,
        )}`,
      );
    return datas;
};


export async function pubMedELinkGetFunction({
    db,
    dbfrom,
    cmd,
    id,
    ...params
}: {
    db: string,
    dbfrom: string,
    cmd: string,
    id: Array<string>,
}&ELinkOptions){

    if(id.length == 0) return "please provide any Id!";
    
    const datas = await getRequest(
        entryPoints.elink,
        `db=${db}&dbfrom=${dbfrom}&cmd=${cmd}&id=${id.join(",")}&api_key=${ApiKey}${ELinkOptionalArgsBuilder(
            params,
        )}`,
      );
    return datas;
};