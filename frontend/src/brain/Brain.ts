import {
  AnalyseBehaviorData,
  AnalyseBehaviorError,
  AnalyseBehaviorParams,
  BodyLoginForAccessToken,
  CampaignCreateRequest,
  CampaignUpdateRequestData,
  CheckHealthData,
  CloakUrls,
  CloakedLinkCreate,
  CreateCampaignData,
  CreateCampaignError,
  CreateCloakedLinkData,
  CreateCloakedLinkError,
  CreateFingerprintData,
  CreateFingerprintError,
  DecideCloakEndpointData,
  DecideCloakEndpointError,
  DecideCloakRequest,
  DecideRouteData,
  DeleteCampaignData,
  DeleteCampaignError,
  DeleteCampaignParams,
  DeleteCloakedLinkData,
  DeleteCloakedLinkError,
  DeleteCloakedLinkParams,
  DeleteSingleDomainConfigData,
  DeleteSingleDomainConfigError,
  DeleteSingleDomainConfigParams,
  DomainConfigInput,
  FingerprintInput,
  GetAllDomainConfigsData,
  GetCloakUrlsData,
  GetCloakedLinkByIdData,
  GetCloakedLinkByIdError,
  GetCloakedLinkByIdParams,
  GetCloakedLinksData,
  GetLinkFilterSettingsForLinkData,
  GetLinkFilterSettingsForLinkError,
  GetLinkFilterSettingsForLinkParams,
  GetRouteDecisionData,
  GetRouteDecisionError,
  HealthCheckStatusData,
  ListCampaignsForDomainData,
  ListCampaignsForDomainError,
  ListCampaignsForDomainParams,
  LoginForAccessTokenData,
  LoginForAccessTokenError,
  ReadUsersMeData,
  RecordTelemetryData,
  RecordTelemetryError,
  RecordTelemetryV2Data,
  RecordTelemetryV2Error,
  RouteRequest,
  SimulateCloakingRequestData,
  SimulateCloakingRequestError,
  SimulationParams,
  TelemetryData,
  TelemetryInput,
  TurnstileValidationRequest,
  UpdateCampaignData,
  UpdateCampaignError,
  UpdateCampaignParams,
  UpdateCloakUrlsData,
  UpdateCloakUrlsError,
  UpdateCloakedLinkData,
  UpdateCloakedLinkError,
  UpdateCloakedLinkParams,
  UpdateLinkFilterSettingsForLinkData,
  UpdateLinkFilterSettingsForLinkError,
  UpdateLinkFilterSettingsForLinkParams,
  UpdateLinkFiltersRequest,
  UpdateSingleDomainConfigData,
  UpdateSingleDomainConfigError,
  ValidateForWorkerData,
  ValidateForWorkerError,
  ValidateTurnstileTokenData,
  ValidateTurnstileTokenError,
  ValidateUserDevModeData,
  WorkerValidationRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Endpoint to check the health of the service.
   *
   * @tags dbtn/module:health
   * @name health_check_status
   * @summary Check Health
   * @request GET:/routes/health
   */
  health_check_status = (params: RequestParams = {}) =>
    this.request<HealthCheckStatusData, any>({
      path: `/routes/health`,
      method: "GET",
      ...params,
    });

  /**
   * @description Analyzes passive behavioral data to provide a mocked risk score. In a real system, this would involve more sophisticated rules or a simple model.
   *
   * @tags dbtn/module:behavior
   * @name analyse_behavior
   * @summary Analyse Behavior
   * @request GET:/routes/behavior
   */
  analyse_behavior = (query: AnalyseBehaviorParams, params: RequestParams = {}) =>
    this.request<AnalyseBehaviorData, AnalyseBehaviorError>({
      path: `/routes/behavior`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Receives fingerprint data from the client, generates a unique hash, caches it in Redis, and returns the hash.
   *
   * @tags dbtn/module:fingerprint
   * @name create_fingerprint
   * @summary Create Fingerprint
   * @request POST:/routes/fingerprint
   */
  create_fingerprint = (data: FingerprintInput, params: RequestParams = {}) =>
    this.request<CreateFingerprintData, CreateFingerprintError>({
      path: `/routes/fingerprint`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Receives telemetry data from the client, logs it, and provides a hook for future ML model threshold adjustments or other analytics.
   *
   * @tags dbtn/module:telemetry
   * @name record_telemetry
   * @summary Record Telemetry
   * @request POST:/routes/telemetry
   */
  record_telemetry = (data: TelemetryInput, params: RequestParams = {}) =>
    this.request<RecordTelemetryData, RecordTelemetryError>({
      path: `/routes/telemetry`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags Admin Simulation, dbtn/module:admin_simulation
   * @name simulate_cloaking_request
   * @summary Simulate Cloaking Request
   * @request POST:/routes/admin/simulate_request
   */
  simulate_cloaking_request = (data: SimulationParams, params: RequestParams = {}) =>
    this.request<SimulateCloakingRequestData, SimulateCloakingRequestError>({
      path: `/routes/admin/simulate_request`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Receives telemetry data from the client (e.g., frontend, workers) and logs it. This endpoint is crucial for monitoring system behavior, training ML models, and identifying potential issues or false positives.
   *
   * @tags telemetry, dbtn/module:telemetry_api
   * @name record_telemetry_v2
   * @summary Record a telemetry event (v2)
   * @request POST:/routes/telemetry/record-v2
   */
  record_telemetry_v2 = (data: TelemetryData, params: RequestParams = {}) =>
    this.request<RecordTelemetryV2Data, RecordTelemetryV2Error>({
      path: `/routes/telemetry/record-v2`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieve all cloaked link configurations. Protected by JWT.
   *
   * @tags dbtn/module:links
   * @name get_cloaked_links
   * @summary Get Cloaked Links Endpoint
   * @request GET:/routes/links
   * @secure
   */
  get_cloaked_links = (params: RequestParams = {}) =>
    this.request<GetCloakedLinksData, any>({
      path: `/routes/links`,
      method: "GET",
      secure: true,
      ...params,
    });

  /**
   * @description Create a new cloaked link configuration. Protected by JWT.
   *
   * @tags dbtn/module:links
   * @name create_cloaked_link
   * @summary Create Cloaked Link Endpoint
   * @request POST:/routes/links
   * @secure
   */
  create_cloaked_link = (data: CloakedLinkCreate, params: RequestParams = {}) =>
    this.request<CreateCloakedLinkData, CreateCloakedLinkError>({
      path: `/routes/links`,
      method: "POST",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:links
   * @name get_cloaked_link_by_id
   * @summary Get Cloaked Link By Id Endpoint
   * @request GET:/routes/links/{link_id}
   * @secure
   */
  get_cloaked_link_by_id = ({ linkId, ...query }: GetCloakedLinkByIdParams, params: RequestParams = {}) =>
    this.request<GetCloakedLinkByIdData, GetCloakedLinkByIdError>({
      path: `/routes/links/${linkId}`,
      method: "GET",
      secure: true,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:links
   * @name update_cloaked_link
   * @summary Update Cloaked Link Endpoint
   * @request PUT:/routes/links/{link_id}
   * @secure
   */
  update_cloaked_link = (
    { linkId, ...query }: UpdateCloakedLinkParams,
    data: CloakedLinkCreate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateCloakedLinkData, UpdateCloakedLinkError>({
      path: `/routes/links/${linkId}`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:links
   * @name delete_cloaked_link
   * @summary Delete Cloaked Link Endpoint
   * @request DELETE:/routes/links/{link_id}
   * @secure
   */
  delete_cloaked_link = ({ linkId, ...query }: DeleteCloakedLinkParams, params: RequestParams = {}) =>
    this.request<DeleteCloakedLinkData, DeleteCloakedLinkError>({
      path: `/routes/links/${linkId}`,
      method: "DELETE",
      secure: true,
      ...params,
    });

  /**
   * @description Mock endpoint for validating a user/request, simulating ML score and bot prediction. This endpoint is now protected and requires JWT authentication.
   *
   * @tags dbtn/module:validation
   * @name validate_user_dev_mode
   * @summary Validate User Dev Mode Endpoint
   * @request GET:/routes/validation/validate-user
   * @secure
   */
  validate_user_dev_mode = (params: RequestParams = {}) =>
    this.request<ValidateUserDevModeData, any>({
      path: `/routes/validation/validate-user`,
      method: "GET",
      secure: true,
      ...params,
    });

  /**
   * @description Provides a JWT access token upon successful authentication (username/password). Uses OAuth2PasswordRequestForm for input, meaning frontend should send form-encoded data. For Phantom Shield, initially, we might only have one admin user or a simple auth scheme.
   *
   * @tags Authentication, dbtn/module:auth
   * @name login_for_access_token
   * @summary Login For Access Token
   * @request POST:/routes/auth/token
   */
  login_for_access_token = (data: BodyLoginForAccessToken, params: RequestParams = {}) =>
    this.request<LoginForAccessTokenData, LoginForAccessTokenError>({
      path: `/routes/auth/token`,
      method: "POST",
      body: data,
      type: ContentType.UrlEncoded,
      ...params,
    });

  /**
   * @description Fetch details for the currently authenticated user.
   *
   * @tags Authentication, dbtn/module:auth
   * @name read_users_me
   * @summary Read Users Me
   * @request GET:/routes/auth/users/me
   * @secure
   */
  read_users_me = (params: RequestParams = {}) =>
    this.request<ReadUsersMeData, any>({
      path: `/routes/auth/users/me`,
      method: "GET",
      secure: true,
      ...params,
    });

  /**
   * @description Updates the filter configuration for a specific cloaked link. Protected by JWT. Filter settings are stored in db.storage.json.
   *
   * @tags Cloaking Filters, dbtn/module:link_filters
   * @name update_link_filter_settings_for_link
   * @summary Update Link Filter Settings Endpoint
   * @request PUT:/routes/links/{link_id}/filters
   * @secure
   */
  update_link_filter_settings_for_link = (
    { linkId, ...query }: UpdateLinkFilterSettingsForLinkParams,
    data: UpdateLinkFiltersRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateLinkFilterSettingsForLinkData, UpdateLinkFilterSettingsForLinkError>({
      path: `/routes/links/${linkId}/filters`,
      method: "PUT",
      body: data,
      secure: true,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieves the filter configuration for a specific cloaked link. Protected by JWT. Returns default settings if no specific configuration is found.
   *
   * @tags Cloaking Filters, dbtn/module:link_filters
   * @name get_link_filter_settings_for_link
   * @summary Get Link Filter Settings Endpoint
   * @request GET:/routes/links/{link_id}/filters
   * @secure
   */
  get_link_filter_settings_for_link = (
    { linkId, ...query }: GetLinkFilterSettingsForLinkParams,
    params: RequestParams = {},
  ) =>
    this.request<GetLinkFilterSettingsForLinkData, GetLinkFilterSettingsForLinkError>({
      path: `/routes/links/${linkId}/filters`,
      method: "GET",
      secure: true,
      ...params,
    });

  /**
   * No description
   *
   * @tags Worker Logic, dbtn/module:worker_logic
   * @name validate_for_worker
   * @summary Validate For Worker
   * @request POST:/routes/worker-logic/validate-for-worker
   */
  validate_for_worker = (data: WorkerValidationRequest, params: RequestParams = {}) =>
    this.request<ValidateForWorkerData, ValidateForWorkerError>({
      path: `/routes/worker-logic/validate-for-worker`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Determines whether to show the white page or black page based on Turnstile validation and configured URLs.
   *
   * @tags Cloaking Decision, dbtn/module:route_decision
   * @name get_route_decision
   * @summary Get Route Decision Endpoint
   * @request POST:/routes/route_decision/route
   */
  get_route_decision = (data: RouteRequest, params: RequestParams = {}) =>
    this.request<GetRouteDecisionData, GetRouteDecisionError>({
      path: `/routes/route_decision/route`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Atualiza as URLs para as páginas white e black. TEMPORARIAMENTE PÚBLICO.
   *
   * @tags Configuration, dbtn/module:config_api
   * @name update_cloak_urls
   * @summary Update Cloak Urls
   * @request POST:/routes/config/update_cloak_urls
   */
  update_cloak_urls = (data: CloakUrls, params: RequestParams = {}) =>
    this.request<UpdateCloakUrlsData, UpdateCloakUrlsError>({
      path: `/routes/config/update_cloak_urls`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retorna as URLs de cloaking atualmente configuradas. TEMPORARIAMENTE PÚBLICO.
   *
   * @tags Configuration, dbtn/module:config_api
   * @name get_cloak_urls
   * @summary Get Cloak Urls
   * @request GET:/routes/config/get_cloak_urls
   */
  get_cloak_urls = (params: RequestParams = {}) =>
    this.request<GetCloakUrlsData, any>({
      path: `/routes/config/get_cloak_urls`,
      method: "GET",
      ...params,
    });

  /**
   * @description Validates a Cloudflare Turnstile token. Receives a token from the frontend, sends it to Cloudflare's siteverify endpoint, and returns the validation result.
   *
   * @tags Turnstile, dbtn/module:turnstile_api, dbtn/hasAuth
   * @name validate_turnstile_token
   * @summary Validate Turnstile Token
   * @request POST:/routes/turnstile/validate
   */
  validate_turnstile_token = (data: TurnstileValidationRequest, params: RequestParams = {}) =>
    this.request<ValidateTurnstileTokenData, ValidateTurnstileTokenError>({
      path: `/routes/turnstile/validate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:cloaking_decision_api, dbtn/hasAuth
   * @name decide_route
   * @summary Decide Route
   * @request GET:/routes/decide-route
   */
  decide_route = (params: RequestParams = {}) =>
    this.request<DecideRouteData, any>({
      path: `/routes/decide-route`,
      method: "GET",
      ...params,
    });

  /**
   * @description Adds or updates the configuration for a single domain. The user must be authenticated.
   *
   * @tags dbtn/module:cloaking_decision_api, dbtn/hasAuth
   * @name update_single_domain_config
   * @summary Update or Add a Single Domain Configuration
   * @request POST:/routes/update-domain-config
   */
  update_single_domain_config = (data: DomainConfigInput, params: RequestParams = {}) =>
    this.request<UpdateSingleDomainConfigData, UpdateSingleDomainConfigError>({
      path: `/routes/update-domain-config`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieves all current domain configurations. The user must be authenticated.
   *
   * @tags dbtn/module:cloaking_decision_api, dbtn/hasAuth
   * @name get_all_domain_configs
   * @summary Get All Domain Configurations
   * @request GET:/routes/get-domain-configs
   */
  get_all_domain_configs = (params: RequestParams = {}) =>
    this.request<GetAllDomainConfigsData, any>({
      path: `/routes/get-domain-configs`,
      method: "GET",
      ...params,
    });

  /**
   * @description Deletes the configuration for a specific domain. The user must be authenticated.
   *
   * @tags dbtn/module:cloaking_decision_api, dbtn/hasAuth
   * @name delete_single_domain_config
   * @summary Delete a Single Domain Configuration
   * @request DELETE:/routes/delete-domain-config/{domain_name}
   */
  delete_single_domain_config = (
    { domainName, ...query }: DeleteSingleDomainConfigParams,
    params: RequestParams = {},
  ) =>
    this.request<DeleteSingleDomainConfigData, DeleteSingleDomainConfigError>({
      path: `/routes/delete-domain-config/${domainName}`,
      method: "DELETE",
      ...params,
    });

  /**
   * No description
   *
   * @tags Cloaking Orchestration, dbtn/module:cloaking_orchestration_api, dbtn/hasAuth
   * @name create_campaign
   * @summary Create Campaign
   * @request POST:/routes/api/v1/cloaking/campaigns
   */
  create_campaign = (data: CampaignCreateRequest, params: RequestParams = {}) =>
    this.request<CreateCampaignData, CreateCampaignError>({
      path: `/routes/api/v1/cloaking/campaigns`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags Cloaking Orchestration, dbtn/module:cloaking_orchestration_api, dbtn/hasAuth
   * @name list_campaigns_for_domain
   * @summary List Campaigns For Domain
   * @request GET:/routes/api/v1/cloaking/campaigns/{domain_name}
   */
  list_campaigns_for_domain = ({ domainName, ...query }: ListCampaignsForDomainParams, params: RequestParams = {}) =>
    this.request<ListCampaignsForDomainData, ListCampaignsForDomainError>({
      path: `/routes/api/v1/cloaking/campaigns/${domainName}`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags Cloaking Orchestration, dbtn/module:cloaking_orchestration_api, dbtn/hasAuth
   * @name update_campaign
   * @summary Update Campaign
   * @request PUT:/routes/api/v1/cloaking/campaigns/{domain_name}/{path}
   */
  update_campaign = (
    { domainName, path, ...query }: UpdateCampaignParams,
    data: CampaignUpdateRequestData,
    params: RequestParams = {},
  ) =>
    this.request<UpdateCampaignData, UpdateCampaignError>({
      path: `/routes/api/v1/cloaking/campaigns/${domainName}/${path}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags Cloaking Orchestration, dbtn/module:cloaking_orchestration_api, dbtn/hasAuth
   * @name delete_campaign
   * @summary Delete Campaign
   * @request DELETE:/routes/api/v1/cloaking/campaigns/{domain_name}/{path}
   */
  delete_campaign = ({ domainName, path, ...query }: DeleteCampaignParams, params: RequestParams = {}) =>
    this.request<DeleteCampaignData, DeleteCampaignError>({
      path: `/routes/api/v1/cloaking/campaigns/${domainName}/${path}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Main endpoint for cloaking decision. Called by the Cloudflare worker. Receives host, path, and headers, and returns the appropriate content (White or Black page).
   *
   * @tags Cloaking Orchestration, dbtn/module:cloaking_orchestration_api, dbtn/hasAuth
   * @name decide_cloak_endpoint
   * @summary Decide Cloak Endpoint
   * @request POST:/routes/api/v1/cloaking/decide-cloak
   */
  decide_cloak_endpoint = (data: DecideCloakRequest, params: RequestParams = {}) =>
    this.request<DecideCloakEndpointData, DecideCloakEndpointError>({
      path: `/routes/api/v1/cloaking/decide-cloak`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
