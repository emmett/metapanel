import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core';
import Oas from 'oas';
import APICore from 'api/dist/core';
declare class SDK {
    spec: Oas;
    core: APICore;
    constructor();
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    config(config: ConfigOptions): void;
    /**
     * If the API you're using requires authentication you can supply the required credentials
     * through this method and the library will magically determine how they should be used
     * within your API request.
     *
     * With the exception of OpenID and MutualTLS, it supports all forms of authentication
     * supported by the OpenAPI specification.
     *
     * @example <caption>HTTP Basic auth</caption>
     * sdk.auth('username', 'password');
     *
     * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
     * sdk.auth('myBearerToken');
     *
     * @example <caption>API Keys</caption>
     * sdk.auth('myApiKey');
     *
     * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
     * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
     * @param values Your auth credentials for the API; can specify up to two strings or numbers.
     */
    auth(...values: string[] | number[]): this;
    /**
     * If the API you're using offers alternate server URLs, and server variables, you can tell
     * the SDK which one to use with this method. To use it you can supply either one of the
     * server URLs that are contained within the OpenAPI definition (along with any server
     * variables), or you can pass it a fully qualified URL to use (that may or may not exist
     * within the OpenAPI definition).
     *
     * @example <caption>Server URL with server variables</caption>
     * sdk.server('https://{region}.api.example.com/{basePath}', {
     *   name: 'eu',
     *   basePath: 'v14',
     * });
     *
     * @example <caption>Fully qualified server URL</caption>
     * sdk.server('https://eu.api.example.com/v14');
     *
     * @param url Server URL
     * @param variables An object of variables to replace into the server URL.
     */
    server(url: string, variables?: {}): void;
    /**
     * Send batches of events from your servers to Mixpanel.
     * ***
     * [block:api-header]
     * {
     *   "title": "Request Format"
     * }
     * [/block]
     * Each request ingests a batch of events into Mixpanel. We accept up to 2000 events and
     * 2MB uncompressed per request. Events are part of the request body. We support
     * Content-Type `application/json` or `application/x-ndjson`:
     * [block:code]
     * {
     *   "codes": [
     *     {
     *       "code": "[\n  {\"event\": \"Signup\", \"properties\": {\"time\":
     * 1618716477000,\"distinct_id\": \"91304156-cafc-4673-a237-623d1129c801\",\"$insert_id\":
     * \"29fc2962-6d9c-455d-95ad-95b84f09b9e4\",\"Referred by\": \"Friend\",\"URL\":
     * \"mixpanel.com/signup\"}},\n  {\"event\": \"Purchase\", \"properties\": {\"time\":
     * 1618716477000,\"distinct_id\": \"91304156-cafc-4673-a237-623d1129c801\",\"$insert_id\":
     * \"935d87b1-00cd-41b7-be34-b9d98dd08b42\",\"Item\": \"Coffee\", \"Amount\": 5.0}}\n]",
     *       "language": "json",
     *       "name": "JSON"
     *     },
     *     {
     *       "code": "{\"event\": \"Signup\", \"properties\": {\"time\":
     * 1618716477000,\"distinct_id\": \"91304156-cafc-4673-a237-623d1129c801\",\"$insert_id\":
     * \"29fc2962-6d9c-455d-95ad-95b84f09b9e4\",\"Referred by\": \"Friend\",\"URL\":
     * \"mixpanel.com/signup\"}}\n{\"event\": \"Purchase\", \"properties\": {\"time\":
     * 1618716477000,\"distinct_id\": \"91304156-cafc-4673-a237-623d1129c801\",\"$insert_id\":
     * \"935d87b1-00cd-41b7-be34-b9d98dd08b42\",\"Item\": \"Coffee\", \"Amount\": 5.0}}\n",
     *       "language": "json",
     *       "name": "ndJSON"
     *     }
     *   ]
     * }
     * [/block]
     * We also support `Content-Encoding: gzip` to reduce network egress.
     * [block:api-header]
     * {
     *   "title": "Authentication"
     * }
     * [/block]
     * /import requires an Owner or Admin [Service Account](ref:service-accounts). project_id,
     * service account username and service account password are required to authenticate a
     * request.
     *
     * /import also supports [Project Token](ref:project-token) as an authentication method.
     * You can provide your token as the basic auth username value with an empty password. If
     * project_id is not specified, the request will be authenticated using the provided token.
     * [block:api-header]
     * {
     *   "title": "Validation"
     * }
     * [/block]
     * If you provide the strict=1 parameter (recommended), /import will validate the supplied
     * events and returns a 400 status code if _any_ of the events fail validation with details
     * of the error. If some events pass validation and others fail, Mixpanel will ingest the
     * events that pass validation. When you encounter a 400 error in production, simply log
     * the JSON response, as it will contain the `$insert_id`s of the invalid events, which can
     * be used to debug.
     *
     * ### High-level requirements
     *
     * - Each event must be properly formatted JSON.
     * - Each event must contain an event name, time, distinct_id, and $insert_id. These are
     * used to deduplicate events, so that this endpoint can be safely retried.
     * - Each event must be smaller than 1MB of uncompressed JSON.
     * - Each event must have fewer than 255 properties.
     * - All nested object properties must have fewer than 255 keys and max nesting depth is 3.
     * - All array properties must have fewer than 255 elements.
     *
     * ### Example of an event
     * [block:code]
     * {
     *   "codes": [
     *     {
     *       "code": "{\n  \"event\": \"Signed up\",\n  \"properties\": {\n    \"time\":
     * 1618716477000,\n    \"distinct_id\": \"91304156-cafc-4673-a237-623d1129c801\",\n
     * \"$insert_id\": \"29fc2962-6d9c-455d-95ad-95b84f09b9e4\",\n    \"ip\":
     * \"136.24.0.114\",\n    \"Referred by\": \"Friend\",\n    \"URL\":
     * \"mixpanel.com/signup\",\n  }\n}",
     *       "language": "json"
     *     }
     *   ]
     * }
     * [/block]
     *
     * ### event
     *
     * This is the name of the event. If you're loading data from a data warehouse, we
     * recommend using the name of the table as the name of the event.
     *
     * We recommend keeping the number of unique event names relatively small and using
     * properties for any variable context attached to the event. For example, instead of
     * tracking events with names "Paid Signup" and "Free Signup", we would recommend tracking
     * an event called "Signup" and having a property "Account Type" with value "paid" or
     * "free".
     *
     * ### **properties**
     *
     * This is a JSON object representing all the properties about the event. If you're loading
     * data from a data warehouse, we recommend using column names as the names of properties.
     *
     * ### properties.time
     *
     * The time at which the event occurred, in seconds or milliseconds since epoch. We require
     * a value for time. We will reject events with time values that are before 1971-01-01 or
     * more than 1 hour in the future as measured on our servers.
     *
     * ### properties.distinct_id
     *
     * distinct_id identifies the user who performed the event. distinct_id must be specified
     * on every event, as it is crucial for Mixpanel to perform behavioral analysis (unique
     * users, funnels, retention, cohorts) correctly and efficiently.
     *
     * If the event is not associated with any user, set distinct_id to the empty string.
     * Events with an empty distinct_id will be excluded from all behavioral analysis.
     *
     * To prevent accidental implementation mistakes, we disallow the following values for
     * distinct_id:
     * [block:code]
     * {
     *   "codes": [
     *     {
     *       "code": "- 00000000-0000-0000-0000-000000000000\n- anon\n- anonymous\n- nil\n-
     * none\n- null\n- n/a\n- na\n- undefined\n- unknown\n- <nil>\n- 0\n- -1\n- true\n-
     * false\n- []\n- {}\n",
     *       "language": "text"
     *     }
     *   ]
     * }
     * [/block]
     *
     * ### properties.$insert_id
     *
     * We require that $insert_id be specified on every event. $insert_id provides a unique
     * identifier for the event, which we use for deduplication. Events with identical values
     * for (event, time, distinct_id, $insert_id) are considered duplicates and only one of
     * them will be surfaced in queries.
     *
     * $insert_ids must be ≤ 36 bytes and contain only alphanumeric characters or "-". We also
     * disallow any value for $insert_id from the list of invalid IDs provided for distinct_id
     * above.
     *
     * ### Example of a validation error
     * [block:code]
     * {
     *   "codes": [
     *     {
     *       "code": "{\n  \"code\": 400,\n  \"error\": \"some data points in the request
     * failed validation\",\n  \"failed_records\": [\n    {\n      \"index\": 0,\n
     * \"$insert_id\": \"8a66058c-a56d-4ef6-8123-28b7c9f7e82f\",\n      \"field\":
     * \"properties.time\",\n      \"message\": \"properties.time' is invalid: must be
     * specified as seconds since epoch\"\n    },\n    {\n      \"index\": 3,\n
     * \"$insert_id\": \"29fc2962-6d9c-455d-95ad-95b84f09b9e4\",\n      \"field\":
     * \"properties.utm_source\",\n      \"message\": \"properties.utm_source is invalid:
     * string should be valid utf8\"\n    },\n  ],\n  \"num_records_imported\": 23,\n
     * \"status\": \"Bad Request\"\n}",
     *       "language": "json"
     *     }
     *   ]
     * }
     * [/block]
     * When any single event in the batch does not pass validation, we return a 400 status code
     * and a response that looks like the above.
     *
     * `failed_records` includes one row for each of the failed events, with details about the
     * error we found. If some of the rows passed validation, we will ingest them and return
     * their count in `num_records_imported`.
     * [block:api-header]
     * {
     *   "title": "GeoIP Enrichment"
     * }
     * [/block]
     * If you supply a property `ip` with an IP address, Mixpanel will automatically do a GeoIP
     * lookup and replace the `ip` property with geographic properties (City, Country, Region).
     * These properties can be used in our UI to segment events geographically.
     *
     * This is an example of an event before and after enrichment:
     * [block:code]
     * {
     *   "codes": [
     *     {
     *       "code": "{\n  \"event\": \"Signed up\",\n  \"properties\": {\n    \"time\":
     * 1618716477000,\n    \"distinct_id\": \"91304156-cafc-4673-a237-623d1129c801\",\n
     * \"$insert_id\": \"29fc2962-6d9c-455d-95ad-95b84f09b9e4\",\n    \"ip\":
     * \"136.24.0.114\",\n    \"Referred by\": \"Friend\",\n    \"URL\":
     * \"mixpanel.com/signup\",\n  }\n}",
     *       "language": "json",
     *       "name": "Pre-Enrichment"
     *     },
     *     {
     *       "code": "{\n  \"event\": \"Signed up\",\n  \"properties\": {\n    \"time\":
     * 1618716477000,\n    \"distinct_id\": \"91304156-cafc-4673-a237-623d1129c801\",\n
     * \"$insert_id\": \"29fc2962-6d9c-455d-95ad-95b84f09b9e4\",\n    \"Referred by\":
     * \"Friend\",\n    \"URL\": \"mixpanel.com/signup\",\n    \"$city\": \"San Francisco\",\n
     *   \"$region\": \"California\",\n    \"mp_country_code\": \"US\"\n  }\n}",
     *       "language": "json",
     *       "name": "Post-Enrichment"
     *     }
     *   ]
     * }
     * [/block]
     *
     * [block:api-header]
     * {
     *   "title": "Rate Limits"
     * }
     * [/block]
     * To ensure real-time ingestion and quality-of-service, we have a rate limit of 2GB of
     * uncompressed JSON/minute or ~30k events per second, measured on a rolling 1 minute
     * basis.
     *
     * We recommend the following when it comes to sending data to our API at scale:
     *
     * * Send data as quickly as possible with concurrent clients until the server returns 429.
     * We see the best results with 10-20 concurrent clients sending 2K events per batch.
     * * When you see 429s, employ an [exponential backoff with
     * jitter](https://docs.aws.amazon.com/general/latest/gr/api-retries.html) strategy. We
     * recommend starting with a backoff of 2s and doubling backoff until 60s, with 1-5s of
     * jitter.
     * * We recommend gzip compression and using `Content-Encoding: gzip` to reduce network
     * egress and transfer time.
     * * In the rare event that our API returns a 502 or 503 status code, we recommend
     * employing the same exponential backoff strategy as with 429s.
     * * Please do not retry validation errors (400 status code), as they will consistently
     * fail and count toward the rate limit.
     *
     * *If you are an enterprise customer and require a higher limit for a 1-time backfill,
     * please reach out to your sales representative with your project_id and use-case.*
     * [block:api-header]
     * {
     *   "title": "Common Issues"
     * }
     * [/block]
     * $insert_id is required on all events. This makes it safe to retry /import requests. If
     * your events don't already have a unique ID (eg: a UUID/GUID), we recommend computing a
     * hash of some set of properties that make the event semantically unique (eg: distinct_id
     * + timestamp + some other property) and using the first 36 characters of that hash as the
     * $insert_id.
     *
     * We truncate all strings down to 255 characters. Here's what we recommend for the various
     * cases in which this typically happens:
     *
     * - URLs: We recommend parsing the URL and tracking its individual components (host, path,
     * url params) as properties. This is more useful in analysis, as you can segment events by
     * hostname or a particular URL parameter.
     * - JSON encoded strings: Sometimes a long string may be a JSON object encoded as a
     * string. We recommend parsing the JSON and flattening it into properties to send with the
     * event. This is similarly much more useful in analysis, as you can filter or breakdown by
     * any key within the JSON.
     * - Free text / user generated content: Some long fields may include full-text (eg: a
     * search term or a comment). If this property isn't useful for analysis, we recommend
     * excluding it from tracking to Mixpanel to avoid accidentally sending over any PII.
     * [block:api-header]
     * {
     *   "title": "Guides"
     * }
     * [/block]
     * See our Cloud Ingestion guides for example usage of this API to integrate with  [Google
     * Pub/Sub](https://docs.mixpanel.com/docs/tracking-methods/integrations/google-pubsub),
     * [Amazon S3](https://docs.mixpanel.com/docs/tracking-methods/integrations/amazon-s3), or
     * [Google Cloud
     * Storage](https://docs.mixpanel.com/docs/tracking-methods/integrations/google-cloud-storage).
     *
     *
     * @summary Import Events
     * @throws FetchError<400, types.ImportEventsResponse400> A 400 response indicates that some records failed validation.
     * @throws FetchError<401, types.ImportEventsResponse401> A 401 response indicates invalid credentials.
     * @throws FetchError<413, types.ImportEventsResponse413> A 413 response indicates that the payload is too large.
     * @throws FetchError<429, types.ImportEventsResponse429> A 429 response indicates rate limits have been exceeded.
     */
    importEvents(body: types.ImportEventsBodyParam, metadata: types.ImportEventsMetadataParam): Promise<FetchResponse<200, types.ImportEventsResponse200>>;
    /**
     * Track events to Mixpanel from client devices. We recommend using one of our client-side
     * SDKs instead of using /track directly, as our SDKs provide queueing, retrying, batching,
     * and more.
     * ***
     * [block:api-header]
     * {
     *   "title": "When to use /track vs /import"
     * }
     * [/block]
     * Typically, we recommend using /import for server-side integrations as it is more
     * scalable and supports ingesting historical data. We only recommend /track for
     * client-side tracking in an environment for which we don't have SDK support or if you're
     * sending data via some other untrusted environment (eg: third-party webhooks that send
     * data to Mixpanel).
     * [block:parameters]
     * {
     *   "data": {
     *     "h-0": "",
     *     "h-1": "/track",
     *     "h-2": "/import",
     *     "0-0": "Events per request",
     *     "0-1": "2000",
     *     "0-2": "2000",
     *     "1-0": "Authentication",
     *     "1-1": "Project Token, intended for untrusted clients.",
     *     "1-2": "Project Secret, intended for server-side integration.",
     *     "2-0": "Compression",
     *     "2-1": "Gzip allowed",
     *     "2-2": "Gzip allowed",
     *     "3-0": "Content-Type",
     *     "3-1": "application/x-www-form-urlencoded",
     *     "3-2": "application/json or application/x-ndjson",
     *     "4-0": "Ingesting historical events",
     *     "4-1": "Last 5 days only.",
     *     "4-2": "Any time after 1971-01-01."
     *   },
     *   "cols": 3,
     *   "rows": 5
     * }
     * [/block]
     *
     * [block:api-header]
     * {
     *   "title": "Limits"
     * }
     * [/block]
     * The limits for track are the same as /import, [see
     * here](https://developer.mixpanel.com/reference/import-events#rate-limits).
     *
     *
     * @summary Track Events
     * @throws FetchError<401, types.TrackEventResponse401> Unauthorized
     * @throws FetchError<403, types.TrackEventResponse403> Forbidden
     */
    trackEvent(body?: types.TrackEventBodyParam, metadata?: types.TrackEventMetadataParam): Promise<FetchResponse<200, types.TrackEventResponse200>>;
    /**
     * Takes a JSON object containing names and values of profile properties. If the profile
     * does not exist, it creates it with these properties. If it does exist, it sets the
     * properties to these values, overwriting existing values.
     *
     * @summary Set Property
     * @throws FetchError<401, types.ProfileSetResponse401> Unauthorized
     * @throws FetchError<403, types.ProfileSetResponse403> Forbidden
     */
    profileSet(body: types.ProfileSetBodyParam, metadata?: types.ProfileSetMetadataParam): Promise<FetchResponse<200, types.ProfileSetResponse200>>;
    /**
     * Works just like "$set", except it will not overwrite existing property values. This is
     * useful for properties like "First login date".
     *
     * @summary Set Property Once
     * @throws FetchError<401, types.ProfileSetPropertyOnceResponse401> Unauthorized
     * @throws FetchError<403, types.ProfileSetPropertyOnceResponse403> Forbidden
     */
    profileSetPropertyOnce(body: types.ProfileSetPropertyOnceBodyParam, metadata?: types.ProfileSetPropertyOnceMetadataParam): Promise<FetchResponse<200, types.ProfileSetPropertyOnceResponse200>>;
    /**
     * Takes a JSON object containing keys and numerical values. $add will increment the value
     * of a user profile property. When processed, the property values are added to the
     * existing values of the properties on the profile. If the property is not present on the
     * profile, the value will be added to 0. It is possible to decrement by calling "$add"
     * with negative values. This is useful for maintaining the values of properties like
     * "Number of Logins" or "Files Uploaded".
     *
     * @summary Increment Numerical Property
     * @throws FetchError<401, types.ProfileNumericalAddResponse401> Unauthorized
     * @throws FetchError<403, types.ProfileNumericalAddResponse403> Forbidden
     */
    profileNumericalAdd(body: types.ProfileNumericalAddBodyParam, metadata?: types.ProfileNumericalAddMetadataParam): Promise<FetchResponse<200, types.ProfileNumericalAddResponse200>>;
    /**
     * Adds the specified values to a list property on a user profile and ensures that those
     * values only appear once. The profile is created if it does not exist.
     *
     * @summary Union To List Property
     * @throws FetchError<401, types.UserProfileUnionResponse401> Unauthorized
     * @throws FetchError<403, types.UserProfileUnionResponse403> Forbidden
     */
    userProfileUnion(body: types.UserProfileUnionBodyParam, metadata?: types.UserProfileUnionMetadataParam): Promise<FetchResponse<200, types.UserProfileUnionResponse200>>;
    /**
     * Takes a JSON object containing keys and values, and appends each to a list associated
     * with the corresponding property name. Appending to a property that doesn't exist will
     * result in assigning a list with one element to that property.
     *
     * @summary Append to List Property
     * @throws FetchError<401, types.ProfileAppendToListPropertyResponse401> Unauthorized
     * @throws FetchError<403, types.ProfileAppendToListPropertyResponse403> Forbidden
     */
    profileAppendToListProperty(body: types.ProfileAppendToListPropertyBodyParam, metadata?: types.ProfileAppendToListPropertyMetadataParam): Promise<FetchResponse<200, types.ProfileAppendToListPropertyResponse200>>;
    /**
     * Takes a JSON object containing keys and values. The value in the request is removed from
     * the existing list on the user profile. If it does not exist, no updates are made.
     *
     * @summary Remove from List Property
     * @throws FetchError<401, types.ProfileRemoveFromListPropertyResponse401> Unauthorized
     * @throws FetchError<403, types.ProfileRemoveFromListPropertyResponse403> Forbidden
     */
    profileRemoveFromListProperty(body: types.ProfileRemoveFromListPropertyBodyParam, metadata?: types.ProfileRemoveFromListPropertyMetadataParam): Promise<FetchResponse<200, types.ProfileRemoveFromListPropertyResponse200>>;
    /**
     * Takes a JSON list of string property names, and permanently removes the properties and
     * their values from a profile.
     *
     * @summary Delete Property
     * @throws FetchError<401, types.ProfileDeletePropertyResponse401> Unauthorized
     * @throws FetchError<403, types.ProfileDeletePropertyResponse403> Forbidden
     */
    profileDeleteProperty(body: types.ProfileDeletePropertyBodyParam, metadata?: types.ProfileDeletePropertyMetadataParam): Promise<FetchResponse<200, types.ProfileDeletePropertyResponse200>>;
    /**
     * Send a batch of profile updates. Instead of sending a single JSON object as the data
     * query parameter, send a JSON list of objects as the data parameter of an
     * application/json POST or GET request body.
     *
     * Refer to the respective user profile update commands ($set, $set_once, $add, $union,
     * $append, $remove, $unset, and $delete) on syntax for their parameters.
     *
     * @summary Update Multiple Profiles
     * @throws FetchError<401, types.ProfileBatchUpdateResponse401> Unauthorized
     * @throws FetchError<403, types.ProfileBatchUpdateResponse403> Forbidden
     */
    profileBatchUpdate(body: types.ProfileBatchUpdateBodyParam, metadata?: types.ProfileBatchUpdateMetadataParam): Promise<FetchResponse<200, types.ProfileBatchUpdateResponse200>>;
    /**
     * Permanently delete the profile from Mixpanel, along with all of its properties. The
     * $delete object value is ignored - the profile is determined by the $distinct_id from the
     * request itself.
     *
     * If you have duplicate profiles, use property $ignore_alias set to true so that you don't
     * delete the original profile when trying to delete the duplicate (as they pass in the
     * alias as the distinct_id).
     *
     *
     * @summary Delete Profile
     * @throws FetchError<401, types.DeleteProfileResponse401> Unauthorized
     * @throws FetchError<403, types.DeleteProfileResponse403> Forbidden
     */
    deleteProfile(body: types.DeleteProfileBodyParam, metadata?: types.DeleteProfileMetadataParam): Promise<FetchResponse<200, types.DeleteProfileResponse200>>;
    /**
     * Updates or adds properties to a group profile. The profile is created if it does not
     * exist.
     *
     * @summary Update Property
     * @throws FetchError<401, types.GroupSetPropertyResponse401> Unauthorized
     * @throws FetchError<403, types.GroupSetPropertyResponse403> Forbidden
     */
    groupSetProperty(body: types.GroupSetPropertyBodyParam, metadata?: types.GroupSetPropertyMetadataParam): Promise<FetchResponse<200, types.GroupSetPropertyResponse200>>;
    /**
     * Adds properties to a group only if the property is not already set. The profile is
     * created if it does not exist.
     *
     * @summary Set Property Once
     * @throws FetchError<401, types.GroupSetPropertyOnceResponse401> Unauthorized
     * @throws FetchError<403, types.GroupSetPropertyOnceResponse403> Forbidden
     */
    groupSetPropertyOnce(body: types.GroupSetPropertyOnceBodyParam, metadata?: types.GroupSetPropertyOnceMetadataParam): Promise<FetchResponse<200, types.GroupSetPropertyOnceResponse200>>;
    /**
     * Unsets specific properties on the group profile.
     *
     * @summary Delete Property
     * @throws FetchError<401, types.GroupDeletePropertyResponse401> Unauthorized
     * @throws FetchError<403, types.GroupDeletePropertyResponse403> Forbidden
     */
    groupDeleteProperty(body: types.GroupDeletePropertyBodyParam, metadata?: types.GroupDeletePropertyMetadataParam): Promise<FetchResponse<200, types.GroupDeletePropertyResponse200>>;
    /**
     * Removes a specific value in a list property.
     *
     * @summary Remove from List Property
     * @throws FetchError<401, types.GroupRemoveFromListPropertyResponse401> Unauthorized
     * @throws FetchError<403, types.GroupRemoveFromListPropertyResponse403> Forbidden
     */
    groupRemoveFromListProperty(body: types.GroupRemoveFromListPropertyBodyParam, metadata?: types.GroupRemoveFromListPropertyMetadataParam): Promise<FetchResponse<200, types.GroupRemoveFromListPropertyResponse200>>;
    /**
     * Adds the specified values to a list property on a group profile and ensures that those
     * values only appear once. The profile is created if it does not exist.
     *
     * @summary Union To List Property
     * @throws FetchError<401, types.GroupUnionResponse401> Unauthorized
     * @throws FetchError<403, types.GroupUnionResponse403> Forbidden
     */
    groupUnion(body: types.GroupUnionBodyParam, metadata?: types.GroupUnionMetadataParam): Promise<FetchResponse<200, types.GroupUnionResponse200>>;
    /**
     * Send a batch of group profile updates. Instead of sending a single JSON object as the
     * data query parameter, send a JSON list of objects as the data parameter of an
     * application/x-www-form-urlencoded POST or GET request body.
     *
     * Refer to the respective group profile update commands ($set, $set_once, $add, $union,
     * $remove, $unset, and $delete) on syntax for their parameters.
     *
     * @summary Batch Update Group Profiles
     * @throws FetchError<401, types.GroupBatchUpdateResponse401> Unauthorized
     * @throws FetchError<403, types.GroupBatchUpdateResponse403> Forbidden
     */
    groupBatchUpdate(body: types.GroupBatchUpdateBodyParam, metadata?: types.GroupBatchUpdateMetadataParam): Promise<FetchResponse<200, types.GroupBatchUpdateResponse200>>;
    /**
     * Deletes a group profile from Mixpanel.
     *
     * @summary Delete Group
     * @throws FetchError<401, types.DeleteGroupResponse401> Unauthorized
     * @throws FetchError<403, types.DeleteGroupResponse403> Forbidden
     */
    deleteGroup(body: types.DeleteGroupBodyParam, metadata?: types.DeleteGroupMetadataParam): Promise<FetchResponse<200, types.DeleteGroupResponse200>>;
    /**
     * Get a list of Lookup Tables defined in the project.
     *
     * @summary List Lookup Tables
     * @throws FetchError<401, types.ListLookupTablesResponse401> A 401 response indicates invalid credentials.
     */
    listLookupTables(metadata: types.ListLookupTablesMetadataParam): Promise<FetchResponse<200, types.ListLookupTablesResponse200>>;
    /**
     * Replace a Lookup Table
     *
     * @throws FetchError<400, types.ReplaceLookupTableResponse400> A 400 response indicates that some records failed validation.
     * @throws FetchError<401, types.ReplaceLookupTableResponse401> A 401 response indicates invalid credentials.
     * @throws FetchError<404, types.ReplaceLookupTableResponse404> A 404 response indicates that the entity to replace was not found.
     * @throws FetchError<413, types.ReplaceLookupTableResponse413> A 413 response indicates that the payload is too large.
     * @throws FetchError<429, types.ReplaceLookupTableResponse429> A 429 response indicates rate limits have been exceeded.
     */
    replaceLookupTable(body: types.ReplaceLookupTableBodyParam, metadata: types.ReplaceLookupTableMetadataParam): Promise<FetchResponse<200, types.ReplaceLookupTableResponse200>>;
    replaceLookupTable(metadata: types.ReplaceLookupTableMetadataParam): Promise<FetchResponse<200, types.ReplaceLookupTableResponse200>>;
}
declare const createSDK: SDK;
export = createSDK;
