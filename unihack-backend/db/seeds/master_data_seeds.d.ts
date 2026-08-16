/**
 * Master Reference Data Seed Dataset
 * Supplies industrial manufacturers, brands, UOM mappings, and fraction conversion tables
 */
export declare const UOM_SEEDS: {
    raw_symbol: string;
    standard_uom: string;
    uom_category: string;
    conversion_factor: number;
}[];
export declare const FRACTION_SEEDS: {
    fraction_pattern: string;
    decimal_value: number;
}[];
export declare const MANUFACTURER_SEEDS: {
    name: string;
    slug: string;
    aliases: string;
    website_domain: string;
}[];
export declare const BRAND_SEEDS: {
    name: string;
    manufacturer_name: string;
    slug: string;
}[];
export declare const FIELD_DEFINITION_SEEDS: {
    field_key: string;
    label: string;
    field_type: string;
    field_group: string;
    editable: boolean;
    char_limit: number;
    required: boolean;
    help_text: string;
}[];
export declare const DEFAULT_CONFIG_SEEDS: {
    config_key: string;
    config_value: string;
    value_type: string;
}[];
//# sourceMappingURL=master_data_seeds.d.ts.map