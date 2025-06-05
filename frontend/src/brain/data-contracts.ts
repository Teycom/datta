/** BehaviorResponse */
export interface BehaviorResponse {
  /** Risk Score */
  risk_score: number;
  /** Analysis Notes */
  analysis_notes: string[];
}

/** Body_login_for_access_token */
export interface BodyLoginForAccessToken {
  /** Grant Type */
  grant_type?: string | null;
  /** Username */
  username: string;
  /** Password */
  password: string;
  /**
   * Scope
   * @default ""
   */
  scope?: string;
  /** Client Id */
  client_id?: string | null;
  /** Client Secret */
  client_secret?: string | null;
}

/** CampaignBriefResponse */
export interface CampaignBriefResponse {
  /** Path */
  path: string;
  /** White Content Snippet */
  white_content_snippet?: string | null;
  /** Black Content Snippet */
  black_content_snippet?: string | null;
  /** Filters Summary */
  filters_summary?: string | null;
  /** Created At */
  created_at?: string | null;
  /** Updated At */
  updated_at?: string | null;
  /** White Content */
  white_content: string;
  /** Black Content */
  black_content: string;
  filters: CampaignFiltersModel;
}

/** CampaignCreateRequest */
export interface CampaignCreateRequest {
  /** Domain Name */
  domain_name: string;
  /**
   * Path
   * Unique path/slug for the campaign under the domain. Ex: 'promo1', 'exclusive-offer'
   */
  path: string;
  /** White Content */
  white_content: string;
  /** Black Content */
  black_content: string;
  filters?: CampaignFiltersModel | null;
}

/** CampaignDeleteResponse */
export interface CampaignDeleteResponse {
  /** Message */
  message: string;
  /** Domain Name */
  domain_name: string;
  /** Path */
  path: string;
}

/** CampaignFiltersModel */
export interface CampaignFiltersModel {
  /**
   * User Agent Contains Block
   * List of User-Agent substrings to block (show White Page). Case-insensitive.
   */
  user_agent_contains_block?: string[];
  /**
   * Geo Country Block
   * List of 2-letter country codes (ISO 3166-1 alpha-2) to block. Case-insensitive (will be uppercased).
   */
  geo_country_block?: string[];
}

/** CampaignUpdateRequestData */
export interface CampaignUpdateRequestData {
  /** White Content */
  white_content?: string | null;
  /** Black Content */
  black_content?: string | null;
  filters?: CampaignFiltersModel | null;
}

/** CampaignsListResponse */
export interface CampaignsListResponse {
  /** Domain Name */
  domain_name: string;
  /** Campaigns */
  campaigns?: CampaignBriefResponse[];
}

/** CloakUrls */
export interface CloakUrls {
  /**
   * White Url
   * @format uri
   * @minLength 1
   * @maxLength 2083
   */
  white_url: string;
  /**
   * Black Url
   * @format uri
   * @minLength 1
   * @maxLength 2083
   */
  black_url: string;
}

/** CloakedLinkCreate */
export interface CloakedLinkCreate {
  /** Campaign Name */
  campaign_name: string;
  /** Black Page Url A */
  black_page_url_a: string;
  /** Black Page Url B */
  black_page_url_b?: string | null;
  /** White Page Url */
  white_page_url: string;
}

/** CloakedLinkResponse */
export interface CloakedLinkResponse {
  /** Campaign Name */
  campaign_name: string;
  /** Black Page Url A */
  black_page_url_a: string;
  /** Black Page Url B */
  black_page_url_b?: string | null;
  /** White Page Url */
  white_page_url: string;
  /** Id */
  id: number;
}

/** CloakingDecisionResponse */
export interface CloakingDecisionResponse {
  /**
   * Target Url
   * @format uri
   * @minLength 1
   * @maxLength 2083
   */
  target_url: string;
  /** Decision Reason */
  decision_reason: string;
}

/** CountryFilter */
export interface CountryFilter {
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Mode
   * 'allow' to only show to listed countries, 'block' to hide from listed countries.
   * @default "allow"
   */
  mode?: "allow" | "block";
  /**
   * Countries
   * List of ISO 3166-1 alpha-2 country codes.
   */
  countries?: string[];
}

/** DecideCloakRequest */
export interface DecideCloakRequest {
  /** Host */
  host: string;
  /** Path */
  path: string;
  /** Headers */
  headers: Record<string, any>;
}

/** DecideCloakResponse */
export interface DecideCloakResponse {
  /** Content */
  content: string;
  /**
   * Content Type
   * @default "text/html"
   */
  content_type?: string;
}

/** DeviceTypeFilter */
export interface DeviceTypeFilter {
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Targetdevice
   * Target device type for the black page.
   * @default "all"
   */
  targetDevice?: "all" | "mobile" | "desktop";
}

/** DomainConfigInput */
export interface DomainConfigInput {
  /** Domain Name */
  domain_name: string;
  /**
   * White Page Url
   * @format uri
   * @minLength 1
   * @maxLength 2083
   */
  white_page_url: string;
  /**
   * Black Page Url
   * @format uri
   * @minLength 1
   * @maxLength 2083
   */
  black_page_url: string;
  /**
   * Blocked Countries
   * @default []
   */
  blocked_countries?: string[] | null;
}

/** ExceptionsFilter */
export interface ExceptionsFilter {
  /**
   * Ips
   * Comma-separated IP addresses to exclude from certain checks or to always treat as human/bot.
   * @default ""
   */
  ips?: string;
  /**
   * Isps
   * Comma-separated ISP names to exclude.
   * @default ""
   */
  isps?: string;
  /**
   * Devices
   * Comma-separated device types or signatures to exclude.
   * @default ""
   */
  devices?: string;
}

/** FilterUpdateResponse */
export interface FilterUpdateResponse {
  /** Link Id */
  link_id: string;
  /** Message */
  message: string;
}

/** FingerprintData */
export interface FingerprintData {
  /** Canvas Hash */
  canvas_hash: string;
  /** Audio Hash */
  audio_hash: string;
  /** Hardware Concurrency */
  hardware_concurrency: number;
  /** Device Memory */
  device_memory: number;
  /** Timezone */
  timezone: string;
  /** User Agent */
  user_agent: string;
}

/** FingerprintInput */
export interface FingerprintInput {
  /**
   * Canvas Hash Frontend
   * Hash generated from canvas fingerprinting on the client-side
   */
  canvas_hash_frontend?: string | null;
  /**
   * Audio Hash Frontend
   * Hash generated from audio fingerprinting on the client-side
   */
  audio_hash_frontend?: string | null;
  /**
   * Hardware Concurrency
   * Number of logical processors
   */
  hardware_concurrency?: number | null;
  /**
   * Device Memory
   * Device memory in GB
   */
  device_memory?: number | null;
  /**
   * Timezone
   * User's timezone, e.g., America/New_York
   */
  timezone?: string | null;
  /**
   * User Agent
   * User-Agent string from the client
   */
  user_agent?: string | null;
}

/** FingerprintResponse */
export interface FingerprintResponse {
  /** Fingerprint Hash */
  fingerprint_hash: string;
  /** Is Cached */
  is_cached: boolean;
  /** Details Received */
  details_received: Record<string, any>;
}

/** FingerprintingFilter */
export interface FingerprintingFilter {
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
}

/** GeolocationFilter */
export interface GeolocationFilter {
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** IPRangesFilter */
export interface IPRangesFilter {
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Allowed
   * Comma-separated IP addresses or CIDR ranges that are explicitly allowed, bypassing other checks if matched.
   * @default ""
   */
  allowed?: string;
  /**
   * Blocked
   * Comma-separated IP addresses or CIDR ranges that are always blocked.
   * @default ""
   */
  blocked?: string;
}

/** LanguageFilter */
export interface LanguageFilter {
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
  /**
   * Mode
   * 'allow' to only show to listed languages, 'block' to hide from listed languages.
   * @default "allow"
   */
  mode?: "allow" | "block";
  /**
   * Languages
   * List of ISO 639-1 language codes.
   */
  languages?: string[];
}

/** LinkFilterSettings */
export interface LinkFilterSettings {
  geolocalization?: GeolocationFilter;
  fingerprinting?: FingerprintingFilter;
  ml?: MLFilter;
  ipRanges?: IPRangesFilter;
  sensitivity?: SensitivityFilter;
  exceptions?: ExceptionsFilter;
  deviceType?: DeviceTypeFilter;
  country?: CountryFilter;
  language?: LanguageFilter;
}

/** MLFilter */
export interface MLFilter {
  /**
   * Enabled
   * @default true
   */
  enabled?: boolean;
}

/** RouteRequest */
export interface RouteRequest {
  /** Turnstiletoken */
  turnstileToken?: string | null;
}

/** RouteResponse */
export interface RouteResponse {
  /** Decision */
  decision: string;
  /** Action */
  action: string;
  /** Url */
  url: string;
}

/** SensitivityFilter */
export interface SensitivityFilter {
  /**
   * Jsexecutiontimemin
   * Minimum JS execution time (ms) for human-like behavior.
   * @min 0
   * @default 500
   */
  jsExecutionTimeMin?: number;
  /**
   * Jsexecutiontimemax
   * Maximum JS execution time (ms) for human-like behavior.
   * @min 0
   * @default 2000
   */
  jsExecutionTimeMax?: number;
}

/** SimulationFilterBreakdown */
export interface SimulationFilterBreakdown {
  /** Geolocalization */
  geolocalization?: string | null;
  /** Fingerprinting */
  fingerprinting?: string | null;
  /** Ml Model */
  ml_model?: string | null;
  /** Ip Ranges */
  ip_ranges?: string | null;
}

/** SimulationParams */
export interface SimulationParams {
  /**
   * User Agent
   * @example "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
   */
  user_agent: string;
  /**
   * Ip Address
   * @example "8.8.8.8"
   */
  ip_address: string;
  /**
   * Country Code
   * @example "US"
   */
  country_code: string;
  /**
   * Device Type
   * @example "Mobile"
   */
  device_type: string;
  /**
   * Link Id
   * @default "campaign_default_filters"
   * @example "campaign_default_filters"
   */
  link_id?: string;
}

/** SimulationResult */
export interface SimulationResult {
  /**
   * Decision
   * @example "Show Black Page / Show White Page / Block"
   */
  decision: string;
  /**
   * Reason
   * @example "Passed all checks. Low ML score."
   */
  reason: string;
  /**
   * Ml Score
   * @example 0.1
   */
  ml_score?: number | null;
  applied_filters_summary: SimulationFilterBreakdown;
}

/** TelemetryData */
export interface TelemetryData {
  /**
   * Log Hash
   * Identifier hash for the event or session.
   */
  log_hash?: string | null;
  /**
   * Is False Positive
   * Flag indicating if a block was a false positive.
   */
  is_false_positive?: boolean | null;
  /**
   * Ml Score
   * Machine learning score associated with the event.
   */
  ml_score?: number | null;
  /**
   * Js Time
   * JavaScript execution time or similar client-side timing.
   */
  js_time?: number | null;
  /**
   * Event
   * The type of event being logged, e.g., 'page_view', 'bot_detection'.
   */
  event: string;
  /**
   * Reason
   * Reason for the event, e.g., 'ml_bot_score_high'.
   */
  reason?: string | null;
  /**
   * Score
   * General score if applicable, distinct from ml_score.
   */
  score?: number | null;
  /**
   * Campaign Id
   * Identifier for an ad campaign.
   */
  campaign_id?: number | null;
  /**
   * Fingerprint Hash
   * Hash of the user's browser fingerprint.
   */
  fingerprint_hash?: string | null;
  /**
   * Additional Data
   * Any other relevant data for the log entry.
   */
  additional_data?: Record<string, any> | null;
}

/** TelemetryInput */
export interface TelemetryInput {
  /** Hashed Identifier */
  hashed_identifier: string;
  /** Js Time Ms */
  js_time_ms?: number | null;
  /** Ml Score Reported */
  ml_score_reported?: number | null;
  /** Is False Positive */
  is_false_positive?: boolean | null;
  /** Is False Negative */
  is_false_negative?: boolean | null;
  /** Client Event */
  client_event?: string | null;
  /** Page Url */
  page_url?: string | null;
}

/** TelemetryResponse */
export interface TelemetryResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
}

/** Token */
export interface Token {
  /** Access Token */
  access_token: string;
  /** Token Type */
  token_type: string;
}

/** TurnstileValidationRequest */
export interface TurnstileValidationRequest {
  /**
   * Token
   * The token received from the Cloudflare Turnstile widget on the frontend.
   */
  token: string;
}

/** TurnstileValidationResponse */
export interface TurnstileValidationResponse {
  /**
   * Success
   * Whether the token was successfully validated.
   */
  success: boolean;
  /**
   * Challenge Ts
   * Timestamp of the challenge load (ISO_8601 format).
   */
  challenge_ts?: string | null;
  /**
   * Hostname
   * The hostname for which the challenge was served.
   */
  hostname?: string | null;
  /**
   * Error Codes
   * A list of error codes if validation failed.
   */
  error_codes?: string[] | null;
  /**
   * Action
   * The customer widget identifier passed to the widget on the client side. This is used to distinguish between different Turnstile widgets on the same site. (Not used by default)
   */
  action?: string | null;
  /**
   * Cdata
   * The customer data passed to the widget on the client side. (Not used by default)
   */
  cdata?: string | null;
}

/** UpdateLinkFiltersRequest */
export interface UpdateLinkFiltersRequest {
  filters: LinkFilterSettings;
}

/** UpdateResponse */
export interface UpdateResponse {
  /** Message */
  message: string;
  current_config?: CloakUrls | null;
}

/** User */
export interface User {
  /** Username */
  username: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** ValidationResponse */
export interface ValidationResponse {
  /** Ml Score */
  ml_score: number;
  /** Is Bot Prediction */
  is_bot_prediction: boolean;
  fingerprint: FingerprintData;
}

/** WorkerValidationRequest */
export interface WorkerValidationRequest {
  /** Fingerprint */
  fingerprint: string;
  /** Campaign Id */
  campaign_id: string;
}

/** WorkerValidationResponse */
export interface WorkerValidationResponse {
  /** Is Bot */
  is_bot: boolean;
  /** Target Url */
  target_url: string;
}

/** CheckEncryptionResponse */
export interface CheckEncryptionResponse {
  /** Message */
  message: string;
  /** Has Key */
  has_key: boolean;
}

/** CloudflareAccountAddRequest */
export interface CloudflareAccountAddRequest {
  /**
   * Account Identifier
   * A user-friendly name or email to identify this Cloudflare account configuration.
   */
  account_identifier: string;
  /**
   * Api Token Value
   * The actual Cloudflare API token value.
   */
  api_token_value: string;
}

/** CloudflareAccountAddResponse */
export interface CloudflareAccountAddResponse {
  /** Account Storage Key */
  account_storage_key: string;
  /** Identifier */
  identifier: string;
  /** Status */
  status: string;
  /** Message */
  message: string;
}

/** CloudflareAccountListItem */
export interface CloudflareAccountListItem {
  /** Account Storage Key */
  account_storage_key: string;
  /** Identifier */
  identifier: string;
  /** Status */
  status: string;
}

/** ConfigureDomainRequest */
export interface ConfigureDomainRequest {
  /** Cloudflare Account Db Id */
  cloudflare_account_db_id: string;
  /** Domain Name */
  domain_name: string;
}

/** ConfigureDomainResponse */
export interface ConfigureDomainResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Domain Name */
  domain_name?: string | null;
  /** Nameservers */
  nameservers?: string[] | null;
  /** Zone Id */
  zone_id?: string | null;
  /** Worker Script Name */
  worker_script_name?: string | null;
  /** Kv Namespace Id */
  kv_namespace_id?: string | null;
  /**
   * Cname Setup Status
   * @default "not_applicable"
   */
  cname_setup_status?: "success" | "failed" | "skipped" | "exists" | "not_applicable" | null;
  /**
   * Worker Deployed Status
   * @default "skipped"
   */
  worker_deployed_status?: "success" | "failed" | "skipped" | "exists" | null;
  /**
   * Worker Route Status
   * @default "skipped"
   */
  worker_route_status?: "success" | "failed" | "skipped" | "exists" | null;
  /** Txt Verification Hostname */
  txt_verification_hostname?: string | null;
  /** Txt Verification Token */
  txt_verification_token?: string | null;
  /**
   * Overall Status
   * @default "error"
   */
  overall_status?:
    | "pending_txt_verification"
    | "pending_nameserver_update"
    | "active"
    | "configuration_failed"
    | "error";
}

/** ConfirmDomainVerificationRequest */
export interface ConfirmDomainVerificationRequest {
  /**
   * Domain Name
   * The domain name to confirm TXT verification for.
   */
  domain_name: string;
  /** Cloudflare Account Db Id */
  cloudflare_account_db_id: string;
}

/** ConfirmDomainVerificationResponse */
export interface ConfirmDomainVerificationResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Domain Name */
  domain_name: string;
  /** Status */
  status:
    | "verified_and_configured"
    | "verified_configuration_pending"
    | "verification_failed"
    | "error"
    | "already_active"
    | "zone_not_found_in_cf"
    | "cf_account_error";
  /** Nameservers */
  nameservers?: string[] | null;
  /** Zone Id */
  zone_id?: string | null;
  /** Worker Script Name */
  worker_script_name?: string | null;
  /** Kv Namespace Id */
  kv_namespace_id?: string | null;
}

/** ListCloudflareAccountsResponse */
export interface ListCloudflareAccountsResponse {
  /** Accounts */
  accounts: CloudflareAccountListItem[];
}

/** RequestDomainVerificationRequest */
export interface RequestDomainVerificationRequest {
  /**
   * Domain Name
   * The domain name to request TXT verification for.
   */
  domain_name: string;
  /**
   * Cloudflare Account Db Id
   * The storage key of the Cloudflare account to use for this domain.
   */
  cloudflare_account_db_id: string;
}

/** RequestDomainVerificationResponse */
export interface RequestDomainVerificationResponse {
  /** Message */
  message: string;
  /** Domain Name */
  domain_name: string;
  /** Txt Verification Hostname */
  txt_verification_hostname?: string | null;
  /** Txt Verification Token */
  txt_verification_token?: string | null;
  /** Status */
  status: "pending_txt_verification" | "already_verified" | "error" | "zone_not_found_in_cf" | "cf_account_error";
}

export type CheckHealthData = HealthResponse;

export type HealthCheckStatusData = HealthResponse;

export interface AnalyseBehaviorParams {
  /**
   * Has Webrtc
   * Client supports WebRTC
   */
  has_webrtc?: boolean | null;
  /**
   * Has Sensors
   * Client reports sensor data (e.g., DeviceMotionEvent)
   */
  has_sensors?: boolean | null;
  /**
   * Accept Language
   * Accept-Language header from client
   */
  accept_language?: string | null;
  /**
   * User Agent
   * User-Agent header from client
   */
  user_agent?: string | null;
}

export type AnalyseBehaviorData = BehaviorResponse;

export type AnalyseBehaviorError = HTTPValidationError;

export type CreateFingerprintData = FingerprintResponse;

export type CreateFingerprintError = HTTPValidationError;

export type RecordTelemetryData = TelemetryResponse;

export type RecordTelemetryError = HTTPValidationError;

export type SimulateCloakingRequestData = SimulationResult;

export type SimulateCloakingRequestError = HTTPValidationError;

export type RecordTelemetryV2Data = any;

export type RecordTelemetryV2Error = HTTPValidationError;

/** Response Get Cloaked Links */
export type GetCloakedLinksData = CloakedLinkResponse[];

export type CreateCloakedLinkData = CloakedLinkResponse;

export type CreateCloakedLinkError = HTTPValidationError;

export interface GetCloakedLinkByIdParams {
  /** Link Id */
  linkId: number;
}

export type GetCloakedLinkByIdData = CloakedLinkResponse;

export type GetCloakedLinkByIdError = HTTPValidationError;

export interface UpdateCloakedLinkParams {
  /** Link Id */
  linkId: number;
}

export type UpdateCloakedLinkData = CloakedLinkResponse;

export type UpdateCloakedLinkError = HTTPValidationError;

export interface DeleteCloakedLinkParams {
  /** Link Id */
  linkId: number;
}

export type DeleteCloakedLinkData = any;

export type DeleteCloakedLinkError = HTTPValidationError;

export type ValidateUserDevModeData = ValidationResponse;

export type LoginForAccessTokenData = Token;

export type LoginForAccessTokenError = HTTPValidationError;

export type ReadUsersMeData = User;

export interface UpdateLinkFilterSettingsForLinkParams {
  /** Link Id */
  linkId: string;
}

export type UpdateLinkFilterSettingsForLinkData = FilterUpdateResponse;

export type UpdateLinkFilterSettingsForLinkError = HTTPValidationError;

export interface GetLinkFilterSettingsForLinkParams {
  /** Link Id */
  linkId: string;
}

export type GetLinkFilterSettingsForLinkData = LinkFilterSettings;

export type GetLinkFilterSettingsForLinkError = HTTPValidationError;

export type ValidateForWorkerData = WorkerValidationResponse;

export type ValidateForWorkerError = HTTPValidationError;

export type GetRouteDecisionData = RouteResponse;

export type GetRouteDecisionError = HTTPValidationError;

export type UpdateCloakUrlsData = UpdateResponse;

export type UpdateCloakUrlsError = HTTPValidationError;

/** Response Get Cloak Urls */
export type GetCloakUrlsData = CloakUrls | null;

export type ValidateTurnstileTokenData = TurnstileValidationResponse;

export type ValidateTurnstileTokenError = HTTPValidationError;

export type DecideRouteData = CloakingDecisionResponse;

export type UpdateSingleDomainConfigData = any;

export type UpdateSingleDomainConfigError = HTTPValidationError;

export type GetAllDomainConfigsData = any;

export interface DeleteSingleDomainConfigParams {
  /** Domain Name */
  domainName: string;
}

export type DeleteSingleDomainConfigData = any;

export type DeleteSingleDomainConfigError = HTTPValidationError;

export type CreateCampaignData = CampaignBriefResponse;

export type CreateCampaignError = HTTPValidationError;

export interface ListCampaignsForDomainParams {
  /** Domain Name */
  domainName: string;
}

export type ListCampaignsForDomainData = CampaignsListResponse;

export type ListCampaignsForDomainError = HTTPValidationError;

export interface UpdateCampaignParams {
  /** Domain Name */
  domainName: string;
  /** Path */
  path: string;
}

export type UpdateCampaignData = CampaignBriefResponse;

export type UpdateCampaignError = HTTPValidationError;

export interface DeleteCampaignParams {
  /** Domain Name */
  domainName: string;
  /** Path */
  path: string;
}

export type DeleteCampaignData = CampaignDeleteResponse;

export type DeleteCampaignError = HTTPValidationError;

export type DecideCloakEndpointData = DecideCloakResponse;

export type DecideCloakEndpointError = HTTPValidationError;
