export type Emptyable<T> = null | '' | T;

export interface MetadataParam {
    [name: string]: string | number | null;
}

export interface CustomerCreateParams {
    balance?: number;
    coupon?: string;
    description?: string;
    email?: string;
    expand?: Array<string>;
    invoice_prefix?: string;
    metadata?: Emptyable<MetadataParam>;
    name?: string;
    next_invoice_sequence?: number;
    payment_method?: string;
    phone?: string;
    preferred_locales?: Array<string>;
    promotion_code?: string;
    source?: string;
    test_clock?: string;
    validate?: boolean;
}

interface BillingThresholds {
    usage_gte: number;
}

type ProrationBehavior = 'always_invoice' | 'create_prorations' | 'none';

export interface SubscriptionCreateItem {
    billing_thresholds?: Emptyable<BillingThresholds>;
    metadata?: MetadataParam;
    plan?: string;
    price?: string;
    quantity?: number;
    tax_rates?: Emptyable<Array<string>>;
}

interface SubscriptionUpdateBillingThresholds {
    amount_gte?: number;
    reset_billing_cycle_anchor?: boolean;
}

export interface SubscriptionUpdateItem {
    billing_thresholds?: Emptyable<BillingThresholds>;
    metadata?: MetadataParam;
    plan?: string;
    price?: string;
    quantity?: number;
    tax_rates?: Emptyable<Array<string>>;
    clear_usage?: boolean;
    deleted?: boolean;
    id?: string;
}

export interface SubscriptionCreateParams {
    customer: string;
    application_fee_percent?: number;
    backdate_start_date?: number;
    billing_cycle_anchor?: number;
    cancel_at?: number;
    cancel_at_period_end?: boolean;
    coupon?: string;
    currency?: string;
    days_until_due?: number;
    default_payment_method?: string;
    default_source?: string;
    description?: string;
    expand?: Array<string>;

    items?: Array<SubscriptionCreateItem>;
    metadata?: Emptyable<MetadataParam>;
    off_session?: boolean;
    promotion_code?: string;
    trial_end?: 'now' | number;
    trial_from_plan?: boolean;
    trial_period_days?: number;
}

export interface SubscriptionRetrieveParams {
    expand?: Array<string>;
}

export interface SubscriptionUpdateParams {
    application_fee_percent?: number;
    billing_thresholds?: Emptyable<SubscriptionUpdateBillingThresholds>;
    cancel_at?: Emptyable<number>;
    cancel_at_period_end?: boolean;
    coupon?: string;
    days_until_due?: number;
    default_payment_method?: string;
    default_source?: Emptyable<string>;
    default_tax_rates?: Emptyable<Array<string>>;
    description?: Emptyable<string>;
    expand?: Array<string>;
    items?: Array<SubscriptionUpdateItem>;
    metadata?: Emptyable<MetadataParam>;
    off_session?: boolean;
    on_behalf_of?: Emptyable<string>;
    promotion_code?: string;
    proration_behavior?: ProrationBehavior;
    proration_date?: number;
    trial_end?: 'now' | number;
    trial_from_plan?: boolean;
}

export interface CustomerRetrieveParams {
    expand?: Array<string>;
}
