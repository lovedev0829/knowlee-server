// https://api.artemisxyz.com/data/PRICE,MC,24H_VOLUME,DAU,DAILY_TXNS,TWITTER_FOLLOWERS,WEEKLY_COMMITS_CORE,WEEKLY_COMMITS_SUB,WEEKLY_DEVS_CORE,WEEKLY_DEVS_SUB,WEEKLY_CONTRACTS_DEPLOYED,WEEKLY_UNIQUE_CONTRACT_DEPLOYERS/?artemisIds=zora,zksync,tron,linea,multiversx,near,optimism,osmosis,polygon,polygon_zk,solana,stacks,starknet,gnosis,fuse,flow,fantom,ethereum,cosmoshub,cardano,canto,bitcoin,bsc,base,axelar,avalanche,arbitrum,aptos,scroll,sui&startDate=2023-10-28&endDate=2023-11-03	

// https://api.artemisxyz.com/data/ATL_CHG_PCT,ATL_DATE,FDMC,CIRC_SUPPLY,TOT_SUPPLY,MAX_SUPPLY,30D_VOLUME,24H_PRICE_HIGH,24H_PRICE_LOW,24H_PRICE_CHG,24H_PRICE_CHG_PCT,7D_PRICE_CHG_PCT,30D_PRICE_CHG_PCT,24H_MC_CHG,24H_MC_CHG_PCT,ATH,ATH_CHG_PCT,ATH_DATE,ATL/?artemisIds=zora,zksync,tron,linea,multiversx,near,optimism,osmosis,polygon,polygon_zk,solana,stacks,starknet,gnosis,fuse,flow,fantom,ethereum,cosmoshub,cardano,canto,bitcoin,bsc,base,axelar,avalanche,arbitrum,aptos,scroll,sui		

// https://api.artemisxyz.com/data/TRADING_VOLUME,UNIQUE_TRADERS/?artemisIds=level-finance,dydx,vertex,hyperliquid,gains-network,gmx,perpetual-protocol,mux,rabbit-x,drift,synthetix&startDate=2023-10-28&endDate=2023-11-03		

// https://api.artemisxyz.com/data/DEPOSITS,BORROWS/?artemisIds=aave,compound,venus&startDate=2023-10-28&endDate=2023-11-03	



export const ARTEMIS_DATE_SUPPORTED_TERMINAL_METRICS = [
    "PRICE",
    "MC",
    "24H_VOLUME",
    "DAU",
    "DAILY_TXNS",
    "TWITTER_FOLLOWERS",
    //"WEEKLY_COMMITS_CORE",
    //"WEEKLY_COMMITS_SUB",
    //"WEEKLY_DEVS_CORE",
    //"WEEKLY_DEVS_SUB",
    "WEEKLY_CONTRACTS_DEPLOYED",
    "WEEKLY_UNIQUE_CONTRACT_DEPLOYERS",
    "STABLECOIN_GROWTH",
    "STABLECOIN_MC"
];

export const ARTEMIS_DATE_NOT_SUPPORTED_TERMINAL_METRICS = [
    "FDMC",
    "CIRC_SUPPLY",
    "TOT_SUPPLY",
    "MAX_SUPPLY",
    "30D_VOLUME",
    "24H_PRICE_HIGH",
    "24H_PRICE_LOW",
    "24H_PRICE_CHG",
    "24H_PRICE_CHG_PCT",
    "7D_PRICE_CHG_PCT",
    "30D_PRICE_CHG_PCT",
    "24H_MC_CHG",
    "24H_MC_CHG_PCT",
    "ATH",
    "ATH_CHG_PCT",
    "ATH_DATE",
    "ATL",
    "ATL_CHG_PCT",
    "ATL_DATE"
];

export const ARTEMIS_PERPETUALS_METRICS = ["TRADING_VOLUME", "UNIQUE_TRADERS"];

export const ARTEMIS_LENDING_METRICS = ["DEPOSITS", "BORROWS"];

export const ARTEMIS_TERMINAL_ARTEMISIDS = [
    //"zora",
    //"zksync",
    //"tron",
    //"linea",
    //"multiversx",
    //"near",
    //"optimism",
    //"osmosis",
    "polygon",
    //"polygon_zk",
    "solana",
    //"stacks",
    //"starknet",
    //"gnosis",
    //"fuse",
    //"flow",
    //"fantom",
    "ethereum",
    //"cosmoshub",
    //"cardano",
    //"canto",
    "bitcoin",
    //"bsc",
    //"base",
    //"axelar",
    //"avalanche",
    //"arbitrum",
    //"aptos",
    //"scroll",
    //"sui",
];

export const ARTEMIS_PERPETUALS_ARTEMISIDS = [
    "level-finance",
    "dydx",
    "vertex",
    "hyperliquid",
    "gains-network",
    "gmx",
    "perpetual-protocol",
    "mux",
    "rabbit-x",
    "drift",
    "synthetix",
];

export const ARTEMIS_LENDING_ARTEMISIDS = ["aave", "compound", "venus"];

export const USER_SELECTION_ARTEMISID_MAP: { [key: string]: string[] } = {
    bitcoin: ["bitcoin"],
    ethereum: ["ethereum"],
    perpetuals: [
        "level-finance",
        "dydx",
        "vertex",
        "hyperliquid",
        "gains-network",
        "gmx",
        "perpetual-protocol",
        "mux",
        "rabbit-x",
        "drift",
        "synthetix",
    ],
    lending: ["aave", "compound", "venus"],
    zkrollup: ["zksync", "starknet", "polygon_zk", "scroll", "linea"],
    interop: ["polkadot", "cosmoshub", "axelar", "osmosis"],
    toplayer1: ["tron", "solana", "cardano", "bsc"],
    majorlayer1: ["near", "multiversx", "avalanche", "aptos"],
    minorlayer1: ["gnosis", "fuse", "flow", "fantom", "canto", "sui"],
    layer2: ["optimism", "polygon", "base", "arbitrum", "zora"],
    stablecoin: ["stablecoin"],
};
