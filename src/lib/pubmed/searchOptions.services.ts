export type ESearchOptions = {
    retmode?: string;
    mindate?: string;
    maxdate?: string;
    retstart?: string;
    retmax?: string;
    datetype?: string;
    relsate?: string;
    reldate?:string;
    usehistory?: boolean
  } | undefined;
  
  export type ESummaryOptions = {
    retmode ?: string;
    retstart ?: string;
    retmax ?: string;
    version ?: string;
  } | undefined;


  export type EFetchOptions = {
    retmode ?: string;
    retstart ?: string;
    retmax ?: string;
    version ?: string;
  } | undefined;

  export type ELinkOptions = {
    retmode?: string;
    mindate?: string;
    maxdate?: string;
    retstart?: string;
    retmax?: string;
    reldate?: string;
    datetype?: string;
    linkname?: string;
    term?:string;
    holding?: boolean
  } | undefined;

  export const EsearchOptionalArgsBuilder = (options: ESearchOptions): string => {
    if (options) {
        const { retmode, mindate, maxdate, retstart, retmax, datetype, reldate, usehistory } =
        options;
        const qretMode = retmode ? `&retMode=${retmode}` : '';
        const qMinDate = mindate ? `&mindate=${mindate}` : '';
        const qMaxDate = maxdate ? `&maxdate=${maxdate}` : '';
        const qRetstart = retstart ? `&retstart=${retstart}` : '';
        const qRetmax = retmax ? `&retmax=${retmax}` : '';
        const qDateType = datetype ? `&datetype=${datetype}` : '';
        const qRelDate = reldate ? `&reldate=${reldate}` : '';
        const qUseHistory = usehistory ? `&usehistory=y` : '';
        return `${qretMode}${qMinDate}${qMaxDate}${qRetstart}${qRetmax}${qDateType}${qRelDate}${qUseHistory}`;
    }
    return '';
};

export const ESummaryOptionalArgsBuilder = (options: ESummaryOptions): string => {
  if (options) {
    const { retmode, retstart, retmax, version } = options;
    const qretMode = retmode ? `&retMode=${retmode}` : '';
    const qRetstart = retstart ? `&retstart=${retstart}` : '';
    const qRetmax = retmax ? `&retmax=${retmax}` : '';
    const qVersion = version ? `&version=${version}` : '';
    return `${qretMode}${qRetstart}${qRetmax}${qVersion}`;
  }
  return '';
};

export const EFetchOptionalArgsBuilder = (options: EFetchOptions): string => {
  if (options) {
    const { retmode, retstart, retmax, version } = options;
    const qretMode = retmode ? `&retMode=${retmode}` : '';
    const qRetstart = retstart ? `&retstart=${retstart}` : '';
    const qRetmax = retmax ? `&retmax=${retmax}` : '';
    const qVersion = version ? `&version=${version}` : '';
    return `${qretMode}${qRetstart}${qRetmax}${qVersion}`;
  }
  return '';
};

export const ELinkOptionalArgsBuilder = (options: ELinkOptions): string => {
  if (options) {
      const { retmode, linkname, term, holding, mindate, maxdate, retstart, retmax, datetype, reldate } =
      options;
      const qretMode = retmode ? `&retMode=${retmode}` : '';
      const qLinkName = linkname ? `&linkname=${linkname}` : '';
      const qTerm = term ? `&term=${term}` : '';
      const qHolding= holding ? `&holding=${holding}` : '';
      const qMinDate = mindate ? `&mindate=${mindate}` : '';
      const qMaxDate = maxdate ? `&maxdate=${maxdate}` : '';
      const qRetstart = retstart ? `&retstart=${retstart}` : '';
      const qRetmax = retmax ? `&retmax=${retmax}` : '';
      const qDateType = datetype ? `&datetype=${datetype}` : '';
      const qRelDate = reldate ? `&reldate=${reldate}` : '';
      return `${qretMode}${qLinkName}${qTerm}${qHolding}${qMinDate}${qMaxDate}${qRetstart}${qRetmax}${qDateType}${qRelDate}`;
  }
  return '';
};