import {
  AnalyseBehaviorData,
  BodyLoginForAccessToken,
  CampaignCreateRequest,
  CampaignUpdateRequestData,
  CheckHealthData,
  CloakUrls,
  CloakedLinkCreate,
  CreateCampaignData,
  CreateCloakedLinkData,
  CreateFingerprintData,
  DecideCloakEndpointData,
  DecideCloakRequest,
  DecideRouteData,
  DeleteCampaignData,
  DeleteCloakedLinkData,
  DeleteSingleDomainConfigData,
  DomainConfigInput,
  FingerprintInput,
  GetAllDomainConfigsData,
  GetCloakUrlsData,
  GetCloakedLinkByIdData,
  GetCloakedLinksData,
  GetLinkFilterSettingsForLinkData,
  GetRouteDecisionData,
  HealthCheckStatusData,
  ListCampaignsForDomainData,
  LoginForAccessTokenData,
  ReadUsersMeData,
  RecordTelemetryData,
  RecordTelemetryV2Data,
  RouteRequest,
  SimulateCloakingRequestData,
  SimulationParams,
  TelemetryData,
  TelemetryInput,
  TurnstileValidationRequest,
  UpdateCampaignData,
  UpdateCloakUrlsData,
  UpdateCloakedLinkData,
  UpdateLinkFilterSettingsForLinkData,
  UpdateLinkFiltersRequest,
  UpdateSingleDomainConfigData,
  ValidateForWorkerData,
  ValidateTurnstileTokenData,
  ValidateUserDevModeData,
  WorkerValidationRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Endpoint to check the health of the service.
   * @tags dbtn/module:health
   * @name health_check_status
   * @summary Check Health
   * @request GET:/routes/health
   */
  export namespace health_check_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = HealthCheckStatusData;
  }

  /**
   * @description Analyzes passive behavioral data to provide a mocked risk score. In a real system, this would involve more sophisticated rules or a simple model.
   * @tags dbtn/module:behavior
   * @name analyse_behavior
   * @summary Analyse Behavior
   * @request GET:/routes/behavior
   */
  export namespace analyse_behavior {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyseBehaviorData;
  }

  /**
   * @description Receives fingerprint data from the client, generates a unique hash, caches it in Redis, and returns the hash.
   * @tags dbtn/module:fingerprint
   * @name create_fingerprint
   * @summary Create Fingerprint
   * @request POST:/routes/fingerprint
   */
  export namespace create_fingerprint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FingerprintInput;
    export type RequestHeaders = {};
    export type ResponseBody = CreateFingerprintData;
  }

  /**
   * @description Receives telemetry data from the client, logs it, and provides a hook for future ML model threshold adjustments or other analytics.
   * @tags dbtn/module:telemetry
   * @name record_telemetry
   * @summary Record Telemetry
   * @request POST:/routes/telemetry
   */
  export namespace record_telemetry {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TelemetryInput;
    export type RequestHeaders = {};
    export type ResponseBody = RecordTelemetryData;
  }

  /**
   * No description
   * @tags Admin Simulation, dbtn/module:admin_simulation
   * @name simulate_cloaking_request
   * @summary Simulate Cloaking Request
   * @request POST:/routes/admin/simulate_request
   */
  export namespace simulate_cloaking_request {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SimulationParams;
    export type RequestHeaders = {};
    export type ResponseBody = SimulateCloakingRequestData;
  }

  /**
   * @description Receives telemetry data from the client (e.g., frontend, workers) and logs it. This endpoint is crucial for monitoring system behavior, training ML models, and identifying potential issues or false positives.
   * @tags telemetry, dbtn/module:telemetry_api
   * @name record_telemetry_v2
   * @summary Record a telemetry event (v2)
   * @request POST:/routes/telemetry/record-v2
   */
  export namespace record_telemetry_v2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TelemetryData;
    export type RequestHeaders = {};
    export type ResponseBody = RecordTelemetryV2Data;
  }

  /**
   * @description Retrieve all cloaked link configurations. Protected by JWT.
   * @tags dbtn/module:links
   * @name get_cloaked_links
   * @summary Get Cloaked Links Endpoint
   * @request GET:/routes/links
   * @secure
   */
  export namespace get_cloaked_links {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCloakedLinksData;
  }

  /**
   * @description Create a new cloaked link configuration. Protected by JWT.
   * @tags dbtn/module:links
   * @name create_cloaked_link
   * @summary Create Cloaked Link Endpoint
   * @request POST:/routes/links
   * @secure
   */
  export namespace create_cloaked_link {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CloakedLinkCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCloakedLinkData;
  }

  /**
   * No description
   * @tags dbtn/module:links
   * @name get_cloaked_link_by_id
   * @summary Get Cloaked Link By Id Endpoint
   * @request GET:/routes/links/{link_id}
   * @secure
   */
  export namespace get_cloaked_link_by_id {
    export type RequestParams = {
      /** Link Id */
      linkId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCloakedLinkByIdData;
  }

  /**
   * No description
   * @tags dbtn/module:links
   * @name update_cloaked_link
   * @summary Update Cloaked Link Endpoint
   * @request PUT:/routes/links/{link_id}
   * @secure
   */
  export namespace update_cloaked_link {
    export type RequestParams = {
      /** Link Id */
      linkId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = CloakedLinkCreate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCloakedLinkData;
  }

  /**
   * No description
   * @tags dbtn/module:links
   * @name delete_cloaked_link
   * @summary Delete Cloaked Link Endpoint
   * @request DELETE:/routes/links/{link_id}
   * @secure
   */
  export namespace delete_cloaked_link {
    export type RequestParams = {
      /** Link Id */
      linkId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteCloakedLinkData;
  }

  /**
   * @description Mock endpoint for validating a user/request, simulating ML score and bot prediction. This endpoint is now protected and requires JWT authentication.
   * @tags dbtn/module:validation
   * @name validate_user_dev_mode
   * @summary Validate User Dev Mode Endpoint
   * @request GET:/routes/validation/validate-user
   * @secure
   */
  export namespace validate_user_dev_mode {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ValidateUserDevModeData;
  }

  /**
   * @description Provides a JWT access token upon successful authentication (username/password). Uses OAuth2PasswordRequestForm for input, meaning frontend should send form-encoded data. For Phantom Shield, initially, we might only have one admin user or a simple auth scheme.
   * @tags Authentication, dbtn/module:auth
   * @name login_for_access_token
   * @summary Login For Access Token
   * @request POST:/routes/auth/token
   */
  export namespace login_for_access_token {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BodyLoginForAccessToken;
    export type RequestHeaders = {};
    export type ResponseBody = LoginForAccessTokenData;
  }

  /**
   * @description Fetch details for the currently authenticated user.
   * @tags Authentication, dbtn/module:auth
   * @name read_users_me
   * @summary Read Users Me
   * @request GET:/routes/auth/users/me
   * @secure
   */
  export namespace read_users_me {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ReadUsersMeData;
  }

  /**
   * @description Updates the filter configuration for a specific cloaked link. Protected by JWT. Filter settings are stored in db.storage.json.
   * @tags Cloaking Filters, dbtn/module:link_filters
   * @name update_link_filter_settings_for_link
   * @summary Update Link Filter Settings Endpoint
   * @request PUT:/routes/links/{link_id}/filters
   * @secure
   */
  export namespace update_link_filter_settings_for_link {
    export type RequestParams = {
      /** Link Id */
      linkId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateLinkFiltersRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateLinkFilterSettingsForLinkData;
  }

  /**
   * @description Retrieves the filter configuration for a specific cloaked link. Protected by JWT. Returns default settings if no specific configuration is found.
   * @tags Cloaking Filters, dbtn/module:link_filters
   * @name get_link_filter_settings_for_link
   * @summary Get Link Filter Settings Endpoint
   * @request GET:/routes/links/{link_id}/filters
   * @secure
   */
  export namespace get_link_filter_settings_for_link {
    export type RequestParams = {
      /** Link Id */
      linkId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetLinkFilterSettingsForLinkData;
  }

  /**
   * No description
   * @tags Worker Logic, dbtn/module:worker_logic
   * @name validate_for_worker
   * @summary Validate For Worker
   * @request POST:/routes/worker-logic/validate-for-worker
   */
  export namespace validate_for_worker {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = WorkerValidationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ValidateForWorkerData;
  }

  /**
   * @description Determines whether to show the white page or black page based on Turnstile validation and configured URLs.
   * @tags Cloaking Decision, dbtn/module:route_decision
   * @name get_route_decision
   * @summary Get Route Decision Endpoint
   * @request POST:/routes/route_decision/route
   */
  export namespace get_route_decision {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RouteRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GetRouteDecisionData;
  }

  /**
   * @description Atualiza as URLs para as páginas white e black. TEMPORARIAMENTE PÚBLICO.
   * @tags Configuration, dbtn/module:config_api
   * @name update_cloak_urls
   * @summary Update Cloak Urls
   * @request POST:/routes/config/update_cloak_urls
   */
  export namespace update_cloak_urls {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CloakUrls;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCloakUrlsData;
  }

  /**
   * @description Retorna as URLs de cloaking atualmente configuradas. TEMPORARIAMENTE PÚBLICO.
   * @tags Configuration, dbtn/module:config_api
   * @name get_cloak_urls
   * @summary Get Cloak Urls
   * @request GET:/routes/config/get_cloak_urls
   */
  export namespace get_cloak_urls {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetCloakUrlsData;
  }

  /**
   * @description Validates a Cloudflare Turnstile token. Receives a token from the frontend, sends it to Cloudflare's siteverify endpoint, and returns the validation result.
   * @tags Turnstile, dbtn/module:turnstile_api, dbtn/hasAuth
   * @name validate_turnstile_token
   * @summary Validate Turnstile Token
   * @request POST:/routes/turnstile/validate
   */
  export namespace validate_turnstile_token {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TurnstileValidationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ValidateTurnstileTokenData;
  }

  /**
   * No description
   * @tags dbtn/module:cloaking_decision_api, dbtn/hasAuth
   * @name decide_route
   * @summary Decide Route
   * @request GET:/routes/decide-route
   */
  export namespace decide_route {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DecideRouteData;
  }

  /**
   * @description Adds or updates the configuration for a single domain. The user must be authenticated.
   * @tags dbtn/module:cloaking_decision_api, dbtn/hasAuth
   * @name update_single_domain_config
   * @summary Update or Add a Single Domain Configuration
   * @request POST:/routes/update-domain-config
   */
  export namespace update_single_domain_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DomainConfigInput;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateSingleDomainConfigData;
  }

  /**
   * @description Retrieves all current domain configurations. The user must be authenticated.
   * @tags dbtn/module:cloaking_decision_api, dbtn/hasAuth
   * @name get_all_domain_configs
   * @summary Get All Domain Configurations
   * @request GET:/routes/get-domain-configs
   */
  export namespace get_all_domain_configs {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAllDomainConfigsData;
  }

  /**
   * @description Deletes the configuration for a specific domain. The user must be authenticated.
   * @tags dbtn/module:cloaking_decision_api, dbtn/hasAuth
   * @name delete_single_domain_config
   * @summary Delete a Single Domain Configuration
   * @request DELETE:/routes/delete-domain-config/{domain_name}
   */
  export namespace delete_single_domain_config {
    export type RequestParams = {
      /** Domain Name */
      domainName: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteSingleDomainConfigData;
  }

  /**
   * No description
   * @tags Cloaking Orchestration, dbtn/module:cloaking_orchestration_api, dbtn/hasAuth
   * @name create_campaign
   * @summary Create Campaign
   * @request POST:/routes/api/v1/cloaking/campaigns
   */
  export namespace create_campaign {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CampaignCreateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateCampaignData;
  }

  /**
   * No description
   * @tags Cloaking Orchestration, dbtn/module:cloaking_orchestration_api, dbtn/hasAuth
   * @name list_campaigns_for_domain
   * @summary List Campaigns For Domain
   * @request GET:/routes/api/v1/cloaking/campaigns/{domain_name}
   */
  export namespace list_campaigns_for_domain {
    export type RequestParams = {
      /** Domain Name */
      domainName: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListCampaignsForDomainData;
  }

  /**
   * No description
   * @tags Cloaking Orchestration, dbtn/module:cloaking_orchestration_api, dbtn/hasAuth
   * @name update_campaign
   * @summary Update Campaign
   * @request PUT:/routes/api/v1/cloaking/campaigns/{domain_name}/{path}
   */
  export namespace update_campaign {
    export type RequestParams = {
      /** Domain Name */
      domainName: string;
      /** Path */
      path: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CampaignUpdateRequestData;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateCampaignData;
  }

  /**
   * No description
   * @tags Cloaking Orchestration, dbtn/module:cloaking_orchestration_api, dbtn/hasAuth
   * @name delete_campaign
   * @summary Delete Campaign
   * @request DELETE:/routes/api/v1/cloaking/campaigns/{domain_name}/{path}
   */
  export namespace delete_campaign {
    export type RequestParams = {
      /** Domain Name */
      domainName: string;
      /** Path */
      path: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteCampaignData;
  }

  /**
   * @description Main endpoint for cloaking decision. Called by the Cloudflare worker. Receives host, path, and headers, and returns the appropriate content (White or Black page).
   * @tags Cloaking Orchestration, dbtn/module:cloaking_orchestration_api, dbtn/hasAuth
   * @name decide_cloak_endpoint
   * @summary Decide Cloak Endpoint
   * @request POST:/routes/api/v1/cloaking/decide-cloak
   */
  export namespace decide_cloak_endpoint {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DecideCloakRequest;
    export type RequestHeaders = {};
    export type ResponseBody = DecideCloakEndpointData;
  }
}
