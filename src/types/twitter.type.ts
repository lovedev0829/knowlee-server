export interface GetTokenResponse {
    refresh_token?: string;
    access_token?: string;
    token_type?: string;
    expires_in?: number;
    scope?: string;
}

export interface Token extends Omit<GetTokenResponse, "expires_in"> {
    expires_at?: number;
}