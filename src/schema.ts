export interface paths {
    "/agents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List agents
         * @description Return all agents available under the current app.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List agents */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            agents: {
                                id: string;
                                app_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and runner are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "runner";
                                is_default: boolean;
                                description?: string | null;
                                system_prompt?: string | null;
                                developer_prompt?: string | null;
                                config: {
                                    [key: string]: unknown;
                                };
                                metadata: {
                                    [key: string]: unknown;
                                };
                                /** @enum {string} */
                                status: "active" | "disabled" | "deleted";
                                created_at: string;
                                updated_at?: string;
                            }[];
                        };
                    };
                };
            };
        };
        put?: never;
        /**
         * Create agent
         * @description Create a new agent definition with business fields and prompts. If the new agent is the only agent under the app, it will still become the default agent. Optionally provide `skills` to mount multiple existing skills during creation.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description Agent display name. */
                        name: string;
                        /**
                         * @description Agent type. Defaults to custom when omitted.
                         * @default custom
                         * @enum {string}
                         */
                        type?: "system" | "custom" | "runner";
                        /**
                         * @description Whether to set this agent as the default agent. Defaults to false. If this is the only agent under the app, it will still become the default agent.
                         * @default false
                         */
                        is_default?: boolean;
                        /** @description Optional business description. */
                        description?: string | null;
                        /** @description Optional system prompt. */
                        system_prompt?: string | null;
                        /** @description Optional developer prompt. */
                        developer_prompt?: string | null;
                        /**
                         * @description Optional context window target for the selected runtime. Leave null to use the runtime default.
                         * @example 256000
                         */
                        context_length?: number | null;
                        /**
                         * Format: uuid
                         * @description Coding agent profile in this application. Omit to select the application's default profile. Requires an administrator token.
                         */
                        runner_profile_id?: string;
                        /** @description Optional skill_id list to mount during agent creation. */
                        skills?: string[];
                    };
                };
            };
            responses: {
                /** @description Create agent */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            agent: {
                                id: string;
                                app_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and runner are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "runner";
                                is_default: boolean;
                                description?: string | null;
                                system_prompt?: string | null;
                                developer_prompt?: string | null;
                                config: {
                                    [key: string]: unknown;
                                };
                                metadata: {
                                    [key: string]: unknown;
                                };
                                /** @enum {string} */
                                status: "active" | "disabled" | "deleted";
                                created_at: string;
                                updated_at?: string;
                            };
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description An application administrator token is required to manage coding agents */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agents/{agent_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get agent
         * @description Get a single agent by id.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Get agent */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            agent: {
                                id: string;
                                app_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and runner are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "runner";
                                is_default: boolean;
                                description?: string | null;
                                system_prompt?: string | null;
                                developer_prompt?: string | null;
                                config: {
                                    [key: string]: unknown;
                                };
                                metadata: {
                                    [key: string]: unknown;
                                };
                                /** @enum {string} */
                                status: "active" | "disabled" | "deleted";
                                created_at: string;
                                updated_at?: string;
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        /**
         * Update agent
         * @description Update an existing agent by id.
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description Agent display name. */
                        name?: string;
                        /**
                         * @description Agent type.
                         * @enum {string}
                         */
                        type?: "system" | "custom" | "runner";
                        /** @description Whether this agent should become the default agent. */
                        is_default?: boolean;
                        /** @description Optional business description. */
                        description?: string | null;
                        /** @description Optional system prompt. */
                        system_prompt?: string | null;
                        /** @description Optional developer prompt. */
                        developer_prompt?: string | null;
                        /**
                         * @description Optional context window target for the selected runtime. Leave null to use the runtime default.
                         * @example 256000
                         */
                        context_length?: number | null;
                        /**
                         * Format: uuid
                         * @description Rebind a coding agent to an application profile. Existing sessions keep their original instance.
                         */
                        runner_profile_id?: string;
                    };
                };
            };
            responses: {
                /** @description Update agent */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            agent: {
                                id: string;
                                app_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and runner are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "runner";
                                is_default: boolean;
                                description?: string | null;
                                system_prompt?: string | null;
                                developer_prompt?: string | null;
                                config: {
                                    [key: string]: unknown;
                                };
                                metadata: {
                                    [key: string]: unknown;
                                };
                                /** @enum {string} */
                                status: "active" | "disabled" | "deleted";
                                created_at: string;
                                updated_at?: string;
                            };
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description An application administrator token is required to manage coding agents */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        post?: never;
        /**
         * Delete agent
         * @description Delete an agent. If needed, provide a replacement default agent id in the request body.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        new_default_id?: string;
                    };
                };
            };
            responses: {
                /** @description Delete agent */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            deleted: {
                                id: string;
                                app_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and runner are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "runner";
                                is_default: boolean;
                                description?: string | null;
                                system_prompt?: string | null;
                                developer_prompt?: string | null;
                                config: {
                                    [key: string]: unknown;
                                };
                                metadata: {
                                    [key: string]: unknown;
                                };
                                /** @enum {string} */
                                status: "active" | "disabled" | "deleted";
                                created_at: string;
                                updated_at?: string;
                            };
                            newDefault: {
                                id: string;
                                app_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and runner are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "runner";
                                is_default: boolean;
                                description?: string | null;
                                system_prompt?: string | null;
                                developer_prompt?: string | null;
                                config: {
                                    [key: string]: unknown;
                                };
                                metadata: {
                                    [key: string]: unknown;
                                };
                                /** @enum {string} */
                                status: "active" | "disabled" | "deleted";
                                created_at: string;
                                updated_at?: string;
                            } | null;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description An application administrator token is required to manage coding agents */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agents/{agent_id}/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List sessions
         * @description List sessions that belong to the specified agent for the current external user, optionally filtered by category or model.
         */
        get: {
            parameters: {
                query?: {
                    category?: string;
                    agent_id?: string;
                    model?: string;
                    page?: number;
                    page_size?: number;
                };
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List sessions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Sessions returned for the current page. */
                            sessions: {
                                id: string;
                                app_id: string;
                                agent_id: string;
                                external_user_id: string;
                                title: string;
                                settings: {
                                    [key: string]: unknown;
                                };
                                reference_settings?: unknown;
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data?: unknown;
                                /** @description Session-level skill_id selection. Null means the session inherits all skills mounted on its agent. */
                                skill_ids?: string[] | null;
                                category?: string;
                                /** @enum {string} */
                                status: "active" | "archived" | "deleted" | "suspended";
                                created_at: string;
                                updated_at: string;
                                /**
                                 * Format: uuid
                                 * @description Latest message at the current agent context boundary.
                                 */
                                context_reset_message_id?: string | null;
                                agent?: unknown;
                            }[];
                            /**
                             * @description Current page number.
                             * @example 1
                             */
                            page: number;
                            /**
                             * @description Requested page size.
                             * @example 20
                             */
                            page_size: number;
                            /**
                             * @description Total number of matching sessions across all pages.
                             * @example 137
                             */
                            total: number;
                            /**
                             * @description Whether another page exists after the current one.
                             * @example true
                             */
                            has_more: boolean;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        /**
         * Create session
         * @description Create a new conversation session under the specified agent. The optional `skills` field is a session-level skill_id selection: omit it or set it to null to inherit all skills mounted on the agent; set it to [] to explicitly disable all skills for this session; set it to [skill_id...] to use exactly those active skills for this session. Session-selected skills may include any active skill under the app and do not need to be mounted on the agent.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description Optional user-facing session title. When omitted, Dathor creates a default title. */
                        title?: string | null;
                        /** @description Runner agents only: bind the session to a development workspace by its uuid id (workspaces.id). The workspace must belong to this agent and be visible to the current user, otherwise the request is rejected. The binding is persisted as custom_data.workspace_id and all subsequent turns run inside that workspace. When omitted, the session falls back to the (agent, user) default workspace (lazily created). PI custom agents ignore this field (they do not participate in coding). */
                        workspace_id?: string;
                        /** @description Optional model id for this session. It overrides the app default chat model and is persisted as the session model. */
                        model?: string;
                        /** @description Optional session-level system prompt persisted as settings.prompt. It is appended after the agent system_prompt and developer_prompt when building the runtime system prompt. Set null to use no session-level prompt. */
                        prompt?: string | null;
                        /** @description Optional retrieval settings for this session. Use reference_settings.memories.collections to pass memory collection_id values. */
                        reference_settings?: {
                            /** @description Memory retrieval settings for this session. */
                            memories?: {
                                /** @description Memory collection_id list enabled for retrieval in this session. Leave empty or omit it to disable memory retrieval. */
                                collections?: string[];
                                /** @description Optional metadata filter applied when searching memory contents, such as product, locale, or business category constraints. */
                                content_filter?: {
                                    [key: string]: unknown;
                                };
                                /**
                                 * @description Minimum similarity score required for a memory chunk to be used. Higher values make retrieval stricter.
                                 * @example 0.5
                                 */
                                min_similarity?: number;
                                /**
                                 * @description Maximum number of memory chunks returned for each retrieval step.
                                 * @example 5
                                 */
                                limit?: number;
                                /** @description Optional fallback message used when memory retrieval has no match. Use null to let the agent continue without a fallback message. */
                                unmatch_message?: string | null;
                            };
                        };
                        /** @description Optional session-scoped business metadata stored and returned with the session. Dathor only gives special meaning to documented keys, such as custom_data.repository_id for the default repository used by future turns. */
                        custom_data?: {
                            [key: string]: unknown;
                        };
                        /** @description Optional session-level skill_id list. Omit or set null to inherit all skills mounted on the agent. Set [] to disable all skills for this session. Set [skill_id...] to use exactly those active skills, which may include any active skill under the app. */
                        skills?: string[] | null;
                        /** @description Optional session category used for list filtering and business grouping. Defaults to chat when omitted. */
                        category?: string;
                    };
                };
            };
            responses: {
                /** @description Create session */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            session: {
                                id: string;
                                app_id: string;
                                agent_id: string;
                                external_user_id: string;
                                title: string;
                                settings: {
                                    [key: string]: unknown;
                                };
                                reference_settings?: unknown;
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data?: unknown;
                                /** @description Session-level skill_id selection. Null means the session inherits all skills mounted on its agent. */
                                skill_ids?: string[] | null;
                                category?: string;
                                /** @enum {string} */
                                status: "active" | "archived" | "deleted" | "suspended";
                                created_at: string;
                                updated_at: string;
                                /**
                                 * Format: uuid
                                 * @description Latest message at the current agent context boundary.
                                 */
                                context_reset_message_id?: string | null;
                                agent?: unknown;
                            };
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agents/{agent_id}/skills": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List agent skills
         * @description List all skills mounted on the specified agent.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List mounted skills */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            skills: {
                                mount: {
                                    id: string;
                                    app_id: string;
                                    agent_id: string;
                                    skill_id: string;
                                    pinned_revision_id?: string | null;
                                    /**
                                     * @description Version policy for mounted skills. `pinned` locks to pinned_revision_id, `latest_active` always follows the latest active revision.
                                     * @enum {string}
                                     */
                                    version_policy: "pinned" | "latest_active";
                                    enabled: boolean;
                                    priority: number;
                                    mount_config: {
                                        [key: string]: unknown;
                                    };
                                    metadata: {
                                        [key: string]: unknown;
                                    };
                                    created_at: string;
                                    updated_at: string;
                                };
                                skill?: unknown;
                                resolved_revision?: unknown;
                            }[];
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        /**
         * Mount skill
         * @description Mount a skill to an agent. Request defaults: enabled=true and priority=100.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        skill_id: string;
                        pinned_revision_id?: string | null;
                        /**
                         * @description Version policy for mounted skills. `pinned` locks to pinned_revision_id, `latest_active` always follows the latest active revision.
                         * @enum {string}
                         */
                        version_policy?: "pinned" | "latest_active";
                        /** @default true */
                        enabled?: boolean;
                        /** @default 100 */
                        priority?: number;
                    };
                };
            };
            responses: {
                /** @description Create mount */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            skill: {
                                id: string;
                                app_id: string;
                                agent_id: string;
                                skill_id: string;
                                pinned_revision_id?: string | null;
                                /**
                                 * @description Version policy for mounted skills. `pinned` locks to pinned_revision_id, `latest_active` always follows the latest active revision.
                                 * @enum {string}
                                 */
                                version_policy: "pinned" | "latest_active";
                                enabled: boolean;
                                priority: number;
                                mount_config: {
                                    [key: string]: unknown;
                                };
                                metadata: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                                updated_at: string;
                            };
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agents/{agent_id}/skills/{skill_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Unmount skill
         * @description Remove a skill mount from an agent.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                    skill_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Delete mount */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            deleted: boolean;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /**
         * Update mounted skill
         * @description Update the mount configuration for a skill already attached to an agent.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                    skill_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        pinned_revision_id?: string | null;
                        /**
                         * @description Version policy for mounted skills. `pinned` locks to pinned_revision_id, `latest_active` always follows the latest active revision.
                         * @enum {string}
                         */
                        version_policy?: "pinned" | "latest_active";
                        enabled?: boolean;
                        priority?: number;
                    };
                };
            };
            responses: {
                /** @description Update mount */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            skill: {
                                id: string;
                                app_id: string;
                                agent_id: string;
                                skill_id: string;
                                pinned_revision_id?: string | null;
                                /**
                                 * @description Version policy for mounted skills. `pinned` locks to pinned_revision_id, `latest_active` always follows the latest active revision.
                                 * @enum {string}
                                 */
                                version_policy: "pinned" | "latest_active";
                                enabled: boolean;
                                priority: number;
                                mount_config: {
                                    [key: string]: unknown;
                                };
                                metadata: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                                updated_at: string;
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/coding/agents/{agent_id}/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create a coding session
         * @description Ensure the current user's instance and freeze its profile, instance ID and revision. Caller runner/provider overrides are rejected. Creation is allowed while the instance starts.
         */
        post: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description Codex-only independent planning switch; defaults to false. */
                        plan_mode?: boolean;
                        /** @description Provider-native execution mode. Omitted or null initializes a saved platform default: codex auto, claude default, opencode build; pi has no mode. */
                        mode?: string | null;
                        /** @description Additional session instructions, immutable after creation; blank means none. */
                        system_prompt?: string | null;
                        primary_repo_key?: string | null;
                        auto_title?: boolean;
                        workspace_id: string;
                        model?: string | null;
                        title?: string | null;
                    };
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            plan_mode: boolean;
                            mode: string | null;
                            system_prompt: string | null;
                            primary_repo_key: string | null;
                            id: string;
                            agent_id: string;
                            workspace_id: string;
                            runner_profile_id: string;
                            runner_instance_id: string;
                            runner_profile_version: number;
                            provider: string;
                            model: string | null;
                            title: string | null;
                            status: string;
                            paseo_agent_id: string | null;
                            provider_session_id: string | null;
                            last_event_seq: number;
                            custom_data?: {
                                [key: string]: unknown;
                            };
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List coding sessions
         * @description List coding sessions of the current user, optionally filtered by agent, workspace and status.
         */
        get: {
            parameters: {
                query?: {
                    agent_id?: string;
                    workspace_id?: string;
                    status?: string;
                    page?: string;
                    page_size?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Coding sessions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            sessions: {
                                plan_mode: boolean;
                                mode: string | null;
                                system_prompt: string | null;
                                primary_repo_key: string | null;
                                id: string;
                                agent_id: string;
                                workspace_id: string;
                                runner_profile_id: string;
                                runner_instance_id: string;
                                runner_profile_version: number;
                                provider: string;
                                model: string | null;
                                title: string | null;
                                status: string;
                                paseo_agent_id: string | null;
                                provider_session_id: string | null;
                                last_event_seq: number;
                                custom_data?: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                                updated_at: string;
                            }[];
                            page: number;
                            page_size: number;
                            total: number;
                            has_more: boolean;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a coding session */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Coding session */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            plan_mode: boolean;
                            mode: string | null;
                            system_prompt: string | null;
                            primary_repo_key: string | null;
                            id: string;
                            agent_id: string;
                            workspace_id: string;
                            runner_profile_id: string;
                            runner_instance_id: string;
                            runner_profile_version: number;
                            provider: string;
                            model: string | null;
                            title: string | null;
                            status: string;
                            paseo_agent_id: string | null;
                            provider_session_id: string | null;
                            last_event_seq: number;
                            custom_data?: {
                                [key: string]: unknown;
                            };
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        /**
         * Update session title, model, execution mode or primary repository
         * @description Update session settings atomically. Title-only changes are allowed during a turn. Model, mode, plan_mode and primary repository changes require an idle session (otherwise 409). Mode is a provider-native Paseo mode ID; null restores inherited defaults.
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        plan_mode?: boolean;
                        mode?: string | null;
                        primary_repo_key?: string | null;
                        model?: string | null;
                        title?: string;
                    };
                };
            };
            responses: {
                /** @description Updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            plan_mode: boolean;
                            mode: string | null;
                            system_prompt: string | null;
                            primary_repo_key: string | null;
                            id: string;
                            agent_id: string;
                            workspace_id: string;
                            runner_profile_id: string;
                            runner_instance_id: string;
                            runner_profile_version: number;
                            provider: string;
                            model: string | null;
                            title: string | null;
                            status: string;
                            paseo_agent_id: string | null;
                            provider_session_id: string | null;
                            last_event_seq: number;
                            custom_data?: {
                                [key: string]: unknown;
                            };
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        post?: never;
        /**
         * Archive a coding session
         * @description Archive the session and ask the runner to archive its paseo agent. Events and turns are kept.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Archived */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            plan_mode: boolean;
                            mode: string | null;
                            system_prompt: string | null;
                            primary_repo_key: string | null;
                            id: string;
                            agent_id: string;
                            workspace_id: string;
                            runner_profile_id: string;
                            runner_instance_id: string;
                            runner_profile_version: number;
                            provider: string;
                            model: string | null;
                            title: string | null;
                            status: string;
                            paseo_agent_id: string | null;
                            provider_session_id: string | null;
                            last_event_seq: number;
                            custom_data?: {
                                [key: string]: unknown;
                            };
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/generate-title": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate a coding session title
         * @description Generate and save a title using the session model and up to 20 initial turns. Does not start a runner. Explicit invocation incurs model usage. Returns 409 if the title changed during generation.
         */
        post: {
            parameters: {
                query?: {
                    automatic?: "true" | "false";
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Generated title */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            title: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/tools": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the effective custom tool set of a session
         * @description Returns the agent-level tools and built-in zai_publish_asset and zai_register_repository tools in the same shape sent to the runner: mode=zai tools carry no binding/secret.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Effective tool set */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            tools?: unknown;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/turns": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Start a turn
         * @description Queue a turn for the coding session. The turn runs asynchronously; subscribe to the session stream for events.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description Image and file delivery: reference (default) emits asset://ID; client_proxy substitutes an HTTPS url_template containing exactly one {asset_id} in the path or query. Images use ![alt](URL); other files use [filename](URL). The caller implements and authenticates the proxy; ZAI does not fetch or upload to it. Fixed for the turn, including streaming, replay and history. */
                        asset_delivery?: {
                            /** @enum {string} */
                            mode: "reference";
                        } | {
                            /** @enum {string} */
                            mode: "client_proxy";
                            url_template: string;
                        };
                        content: string;
                        attachment_ids?: string[];
                        /** @description Optional model override for this turn only. Must be authorized for the application and compatible with the fixed engine. The selected model is snapshotted for execution, routing and billing; it does not create a new instance. */
                        model?: string | null;
                        /** @description 设置会话主仓库，通过每轮提示词聚焦该仓库；不传沿用会话设置，null 清除。CLI 始终从工作区根目录启动。 */
                        repo_key?: string | null;
                        client_turn_id?: string;
                        /** @description 本轮生效的自定义工具集（MCP）。turn 级同名工具覆盖 agent.config.tools；不传则只用 agent 级配置。 */
                        tools?: {
                            /** @enum {string} */
                            type: "function";
                            function: {
                                name: string;
                                description?: string;
                                parameters: {
                                    [key: string]: unknown;
                                };
                            };
                        }[] | {
                            /** @enum {number} */
                            version: 1;
                            serverName?: string;
                            /** @default [] */
                            tools?: {
                                name: string;
                                /** @default  */
                                description?: string;
                                /**
                                 * @default {
                                 *       "type": "object",
                                 *       "properties": {}
                                 *     }
                                 */
                                parameters?: {
                                    [key: string]: unknown;
                                };
                                /**
                                 * @default zai
                                 * @enum {string}
                                 */
                                mode?: "zai" | "runner" | "interaction" | "client" | "schema-only";
                                binding?: {
                                    /** @enum {string} */
                                    type: "http";
                                    /** Format: uri */
                                    url: string;
                                    /** @enum {string} */
                                    method?: "POST" | "PUT" | "PATCH";
                                    headers?: {
                                        [key: string]: string;
                                    };
                                    timeout_ms?: number;
                                    max_response_bytes?: number;
                                };
                                /**
                                 * @default never
                                 * @enum {string}
                                 */
                                approval?: "never" | "always";
                            }[];
                            /** @default {} */
                            servers?: {
                                [key: string]: {
                                    /** @enum {string} */
                                    type: "http" | "sse";
                                    /** Format: uri */
                                    url: string;
                                    headers?: {
                                        [key: string]: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
            responses: {
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            session_id: string;
                            status: string;
                            user_content: string;
                            attachments?: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                size: number;
                            }[];
                            assistant_content: string;
                            asset_delivery?: {
                                /** @enum {string} */
                                mode: "reference";
                            } | {
                                /** @enum {string} */
                                mode: "client_proxy";
                                url_template: string;
                            };
                            finish_reason: string | null;
                            model: string | null;
                            repo_key: string | null;
                            provider_session_id: string | null;
                            usage: {
                                [key: string]: unknown;
                            } | null;
                            summary: {
                                [key: string]: unknown;
                            } | null;
                            error: {
                                [key: string]: unknown;
                            } | null;
                            created_at: string;
                            started_at: string | null;
                            finished_at: string | null;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/turns/{turn_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a turn */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                    turn_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Turn */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            session_id: string;
                            status: string;
                            user_content: string;
                            attachments?: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                size: number;
                            }[];
                            assistant_content: string;
                            asset_delivery?: {
                                /** @enum {string} */
                                mode: "reference";
                            } | {
                                /** @enum {string} */
                                mode: "client_proxy";
                                url_template: string;
                            };
                            finish_reason: string | null;
                            model: string | null;
                            repo_key: string | null;
                            provider_session_id: string | null;
                            usage: {
                                [key: string]: unknown;
                            } | null;
                            summary: {
                                [key: string]: unknown;
                            } | null;
                            error: {
                                [key: string]: unknown;
                            } | null;
                            created_at: string;
                            started_at: string | null;
                            finished_at: string | null;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/turns/{turn_id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cancel a turn
         * @description Cancel a queued or running turn. The runner interrupts the provider run and emits turn.canceled.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                    turn_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Canceled */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            session_id: string;
                            status: string;
                            user_content: string;
                            attachments?: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                size: number;
                            }[];
                            assistant_content: string;
                            asset_delivery?: {
                                /** @enum {string} */
                                mode: "reference";
                            } | {
                                /** @enum {string} */
                                mode: "client_proxy";
                                url_template: string;
                            };
                            finish_reason: string | null;
                            model: string | null;
                            repo_key: string | null;
                            provider_session_id: string | null;
                            usage: {
                                [key: string]: unknown;
                            } | null;
                            summary: {
                                [key: string]: unknown;
                            } | null;
                            error: {
                                [key: string]: unknown;
                            } | null;
                            created_at: string;
                            started_at: string | null;
                            finished_at: string | null;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/turns/{turn_id}/steer": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Steer the running turn
         * @description 把追加指令发给正在跑这一轮的 agent（paseo steer），不新开 turn。只对 running 的 turn 有效；steer 文本会作为 `steer.accepted` 事件进入会话时间线。
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                    turn_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        content: string;
                    };
                };
            };
            responses: {
                /** @description Steering accepted */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            session_id: string;
                            status: string;
                            user_content: string;
                            attachments?: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                size: number;
                            }[];
                            assistant_content: string;
                            asset_delivery?: {
                                /** @enum {string} */
                                mode: "reference";
                            } | {
                                /** @enum {string} */
                                mode: "client_proxy";
                                url_template: string;
                            };
                            finish_reason: string | null;
                            model: string | null;
                            repo_key: string | null;
                            provider_session_id: string | null;
                            usage: {
                                [key: string]: unknown;
                            } | null;
                            summary: {
                                [key: string]: unknown;
                            } | null;
                            error: {
                                [key: string]: unknown;
                            } | null;
                            created_at: string;
                            started_at: string | null;
                            finished_at: string | null;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List session events
         * @description Replay persisted events after a given seq. Used for history browsing and gap recovery.
         */
        get: {
            parameters: {
                query?: {
                    after_seq?: string;
                    limit?: string;
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Events */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            events: {
                                seq: number;
                                type: string;
                                turn_id: string | null;
                                payload: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                            }[];
                            last_seq: number;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the session workspace directory */
        get: {
            parameters: {
                query?: {
                    path?: string;
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Directory entries */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            entries: {
                                name: string;
                                path: string;
                                /** @enum {string} */
                                type: "file" | "directory";
                                size?: number;
                            }[];
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        /**
         * Upload a file to the session workspace
         * @description Stream a binary file (up to 50 MiB) to the session workspace. Filename is supplied in the name query parameter. Returns a stable file ID; send it in attachment_ids when creating a turn. Unreferenced uploads expire after 24 hours.
         */
        post: {
            parameters: {
                query: {
                    name: string;
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/octet-stream": string;
                };
            };
            responses: {
                /** @description Uploaded file */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            size: number;
                            /** @enum {string} */
                            status: "ready";
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/files/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Preview a session workspace file (up to 128 KiB) */
        get: {
            parameters: {
                query: {
                    path: string;
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Bounded file content */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            path: string;
                            content: string;
                            /** @enum {string} */
                            encoding: "utf-8" | "base64";
                            size: number;
                            truncated?: boolean;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/files/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download a workspace file or an immutable attachment as a binary stream
         * @description Use file_id (the ID in asset://ID) to download a stored original without starting the Runner. Use path for a workspace file. Exactly one is required.
         */
        get: {
            parameters: {
                query?: {
                    file_id?: string;
                    path?: string;
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Complete file, up to 50 MiB */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/octet-stream": string;
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/files/download-link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Prepare a single-use browser download */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** Format: uuid */
                        file_id: string;
                    } | {
                        path: string;
                    };
                };
            };
            responses: {
                /** @description Download link valid for up to ten minutes, usable once */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            url: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/tool-calls/{tool_call_id}/result": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Resolve a client function call */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                    tool_call_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        output?: unknown;
                    } | {
                        error: {
                            code: string;
                            message: string;
                        };
                    };
                };
            };
            responses: {
                /** @description Result persisted, including identical retries */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            status: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Result exceeds 1 MiB */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/interactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List interactions
         * @description List pending (or historical) interactions of a coding session. Payload mirrors the paseo permission request.
         */
        get: {
            parameters: {
                query?: {
                    status?: string;
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Interactions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            interactions: {
                                id: string;
                                session_id: string;
                                turn_id: string | null;
                                request_id: string;
                                kind: string;
                                status: string;
                                payload: {
                                    [key: string]: unknown;
                                };
                                resolution: {
                                    [key: string]: unknown;
                                } | null;
                                expires_at: string;
                                created_at: string;
                            }[];
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/interactions/{interaction_id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Resolve an interaction
         * @description Answer a pending interaction. The body is the paseo permission response: { behavior: allow | deny, selectedActionId?, updatedInput?, message? }.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                    interaction_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        behavior: "allow" | "deny";
                        selectedActionId?: string;
                        updatedInput?: {
                            [key: string]: unknown;
                        };
                        updatedPermissions?: {
                            [key: string]: unknown;
                        }[];
                        message?: string;
                        interrupt?: boolean;
                    };
                };
            };
            responses: {
                /** @description Resolved */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            session_id: string;
                            turn_id: string | null;
                            request_id: string;
                            kind: string;
                            status: string;
                            payload: {
                                [key: string]: unknown;
                            };
                            resolution: {
                                [key: string]: unknown;
                            } | null;
                            expires_at: string;
                            created_at: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/workspaces": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List workspaces
         * @description Read development workspaces of the current user without creating a workspace or runner instance.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Workspaces */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            workspaces: {
                                id: string;
                                agent_id: string;
                                name: string;
                                description: string | null;
                                is_default: boolean;
                                status: string;
                                custom_data?: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                                updated_at: string;
                                /** Format: uuid */
                                runner_instance_id?: string;
                                /** @enum {string} */
                                runner_status?: "ready" | "starting";
                            }[];
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Agent not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        /** Create a workspace */
        post: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        name: string;
                        description?: string | null;
                        is_default?: boolean;
                        custom_data?: {
                            [key: string]: unknown;
                        };
                        repositories?: {
                            repo_key?: string;
                            name?: string;
                            url?: string;
                            default_branch?: string;
                            is_default?: boolean;
                        }[];
                    };
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            agent_id: string;
                            name: string;
                            description: string | null;
                            is_default: boolean;
                            status: string;
                            custom_data?: {
                                [key: string]: unknown;
                            };
                            created_at: string;
                            updated_at: string;
                            /** Format: uuid */
                            runner_instance_id?: string;
                            /** @enum {string} */
                            runner_status?: "ready" | "starting";
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Agent not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/workspaces/{workspace_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a workspace */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                    workspace_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Workspace */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            agent_id: string;
                            name: string;
                            description: string | null;
                            is_default: boolean;
                            status: string;
                            custom_data?: {
                                [key: string]: unknown;
                            };
                            created_at: string;
                            updated_at: string;
                            /** Format: uuid */
                            runner_instance_id?: string;
                            /** @enum {string} */
                            runner_status?: "ready" | "starting";
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        /** Update a workspace */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                    workspace_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        name?: string;
                        description?: string | null;
                        custom_data?: {
                            [key: string]: unknown;
                        } | null;
                    };
                };
            };
            responses: {
                /** @description Updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            agent_id: string;
                            name: string;
                            description: string | null;
                            is_default: boolean;
                            status: string;
                            custom_data?: {
                                [key: string]: unknown;
                            };
                            created_at: string;
                            updated_at: string;
                            /** Format: uuid */
                            runner_instance_id?: string;
                            /** @enum {string} */
                            runner_status?: "ready" | "starting";
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        post?: never;
        /** Delete a workspace */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                    workspace_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Deleted */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            agent_id: string;
                            name: string;
                            description: string | null;
                            is_default: boolean;
                            status: string;
                            custom_data?: {
                                [key: string]: unknown;
                            };
                            created_at: string;
                            updated_at: string;
                            /** Format: uuid */
                            runner_instance_id?: string;
                            /** @enum {string} */
                            runner_status?: "ready" | "starting";
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/workspaces/{workspace_id}/repos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List repositories */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                    workspace_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Repositories */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            repositories: {
                                id: string;
                                workspace_id: string | null;
                                repo_key: string;
                                name: string;
                                description: string | null;
                                default_branch: string;
                                source_type: string;
                                status: string;
                                is_default: boolean;
                                url?: string | null;
                                created_at: string;
                                updated_at: string;
                            }[];
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        /**
         * Add a repository
         * @description Add a repository to the workspace. `url` empty means a platform-managed empty repository materialized by the runner.
         */
        post: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path: {
                    agent_id: string;
                    workspace_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        repo_key?: string;
                        name?: string;
                        description?: string | null;
                        url?: string | null;
                        default_branch?: string;
                        is_default?: boolean;
                        custom_data?: {
                            [key: string]: unknown;
                        };
                    };
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            repository: {
                                id: string;
                                workspace_id: string | null;
                                repo_key: string;
                                name: string;
                                description: string | null;
                                default_branch: string;
                                source_type: string;
                                status: string;
                                is_default: boolean;
                                url?: string | null;
                                created_at: string;
                                updated_at: string;
                            };
                            /** @enum {string} */
                            runner_status?: "materialization_pending";
                        };
                    };
                };
                /** @description Materialization pending */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            repository: {
                                id: string;
                                workspace_id: string | null;
                                repo_key: string;
                                name: string;
                                description: string | null;
                                default_branch: string;
                                source_type: string;
                                status: string;
                                is_default: boolean;
                                url?: string | null;
                                created_at: string;
                                updated_at: string;
                            };
                            runner_status: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a repository */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                    workspace_id: string;
                    repository_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Repository */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            repository: {
                                id: string;
                                workspace_id: string | null;
                                repo_key: string;
                                name: string;
                                description: string | null;
                                default_branch: string;
                                source_type: string;
                                status: string;
                                is_default: boolean;
                                url?: string | null;
                                created_at: string;
                                updated_at: string;
                            };
                            /** @enum {string} */
                            runner_status?: "materialization_pending";
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        /** Update a repository */
        put: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path: {
                    agent_id: string;
                    workspace_id: string;
                    repository_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        name?: string;
                        description?: string | null;
                        default_branch?: string;
                        is_default?: boolean;
                        custom_data?: {
                            [key: string]: unknown;
                        } | null;
                    };
                };
            };
            responses: {
                /** @description Metadata updated; materialization pending */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            repository: {
                                id: string;
                                workspace_id: string | null;
                                repo_key: string;
                                name: string;
                                description: string | null;
                                default_branch: string;
                                source_type: string;
                                status: string;
                                is_default: boolean;
                                url?: string | null;
                                created_at: string;
                                updated_at: string;
                            };
                            /** @enum {string} */
                            runner_status?: "materialization_pending";
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        post?: never;
        /** Delete a repository */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                    workspace_id: string;
                    repository_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Deleted */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            deleted: boolean;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List repository files
         * @description List files and directories inside the repository as materialized on the runner.
         */
        get: {
            parameters: {
                query?: {
                    path?: string;
                };
                header?: never;
                path: {
                    agent_id: string;
                    workspace_id: string;
                    repository_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Entries */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            entries: {
                                name: string;
                                path: string;
                                /** @enum {string} */
                                type: "file" | "directory";
                                size?: number;
                            }[];
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}/files/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read a repository file */
        get: {
            parameters: {
                query: {
                    path: string;
                };
                header?: never;
                path: {
                    agent_id: string;
                    workspace_id: string;
                    repository_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description File content */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            path: string;
                            content: string;
                            /** @enum {string} */
                            encoding: "utf-8" | "base64";
                            size: number;
                            truncated?: boolean;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/workspaces/{workspace_id}/AGENTS.md": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read workspace AGENTS.md
         * @description Returns the workspace-level AGENTS.md, or null when it has not been written yet.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                    workspace_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description AGENTS.md */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            content: string | null;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        /**
         * Write workspace AGENTS.md
         * @description Store AGENTS.md for new sessions and push it to the runner when it is online.
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                    workspace_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        content: string;
                    };
                };
            };
            responses: {
                /** @description Updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            content: string | null;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/runners": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List application runner profiles */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            runners: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                /** @enum {string} */
                                runner_adapter: "codex" | "pi" | "opencode" | "claude";
                                model: string;
                                image_policy_id: string;
                                idle_stop_seconds: number;
                                is_default: boolean;
                                enabled: boolean;
                                version: number;
                                created_at: string;
                                updated_at: string;
                            }[];
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            runners: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                /** @enum {string} */
                                runner_adapter: "codex" | "pi" | "opencode" | "claude";
                                model: string;
                                image_policy_id: string;
                                idle_stop_seconds: number;
                                is_default: boolean;
                                enabled: boolean;
                                version: number;
                                created_at: string;
                                updated_at: string;
                            }[];
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            runners: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                /** @enum {string} */
                                runner_adapter: "codex" | "pi" | "opencode" | "claude";
                                model: string;
                                image_policy_id: string;
                                idle_stop_seconds: number;
                                is_default: boolean;
                                enabled: boolean;
                                version: number;
                                created_at: string;
                                updated_at: string;
                            }[];
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        /** Create an application runner profile */
        post: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        /** @enum {string} */
                        runner_adapter: "codex" | "pi" | "opencode" | "claude";
                        model: string;
                        image_policy_id: string;
                        is_default?: boolean;
                    };
                };
            };
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** @enum {string} */
                            runner_adapter: "codex" | "pi" | "opencode" | "claude";
                            model: string;
                            image_policy_id: string;
                            idle_stop_seconds: number;
                            is_default: boolean;
                            enabled: boolean;
                            version: number;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** @enum {string} */
                            runner_adapter: "codex" | "pi" | "opencode" | "claude";
                            model: string;
                            image_policy_id: string;
                            idle_stop_seconds: number;
                            is_default: boolean;
                            enabled: boolean;
                            version: number;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** @enum {string} */
                            runner_adapter: "codex" | "pi" | "opencode" | "claude";
                            model: string;
                            image_policy_id: string;
                            idle_stop_seconds: number;
                            is_default: boolean;
                            enabled: boolean;
                            version: number;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/runner-image-policies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List allowed runner image policies */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            policies: {
                                id: string;
                                runner_adapter: string;
                            }[];
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            policies: {
                                id: string;
                                runner_adapter: string;
                            }[];
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            policies: {
                                id: string;
                                runner_adapter: string;
                            }[];
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/runners/{profile_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get an application runner profile */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    profile_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** @enum {string} */
                            runner_adapter: "codex" | "pi" | "opencode" | "claude";
                            model: string;
                            image_policy_id: string;
                            idle_stop_seconds: number;
                            is_default: boolean;
                            enabled: boolean;
                            version: number;
                            created_at: string;
                            updated_at: string;
                            instances: {
                                [key: string]: number;
                            };
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** @enum {string} */
                            runner_adapter: "codex" | "pi" | "opencode" | "claude";
                            model: string;
                            image_policy_id: string;
                            idle_stop_seconds: number;
                            is_default: boolean;
                            enabled: boolean;
                            version: number;
                            created_at: string;
                            updated_at: string;
                            instances: {
                                [key: string]: number;
                            };
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** @enum {string} */
                            runner_adapter: "codex" | "pi" | "opencode" | "claude";
                            model: string;
                            image_policy_id: string;
                            idle_stop_seconds: number;
                            is_default: boolean;
                            enabled: boolean;
                            version: number;
                            created_at: string;
                            updated_at: string;
                            instances: {
                                [key: string]: number;
                            };
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /** Delete an unused runner profile */
        delete: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path: {
                    profile_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            deleted: boolean;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            deleted: boolean;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            deleted: boolean;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /** Update an application runner profile */
        patch: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path: {
                    profile_id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name?: string;
                        model?: string;
                        image_policy_id?: string;
                        is_default?: boolean;
                        enabled?: boolean;
                        idle_stop_seconds?: number;
                    };
                };
            };
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** @enum {string} */
                            runner_adapter: "codex" | "pi" | "opencode" | "claude";
                            model: string;
                            image_policy_id: string;
                            idle_stop_seconds: number;
                            is_default: boolean;
                            enabled: boolean;
                            version: number;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** @enum {string} */
                            runner_adapter: "codex" | "pi" | "opencode" | "claude";
                            model: string;
                            image_policy_id: string;
                            idle_stop_seconds: number;
                            is_default: boolean;
                            enabled: boolean;
                            version: number;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** @enum {string} */
                            runner_adapter: "codex" | "pi" | "opencode" | "claude";
                            model: string;
                            image_policy_id: string;
                            idle_stop_seconds: number;
                            is_default: boolean;
                            enabled: boolean;
                            version: number;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/coding/runners/{profile_id}/instances": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List user runner instances */
        get: {
            parameters: {
                query?: {
                    page?: number;
                    page_size?: number;
                    status?: string;
                };
                header?: never;
                path: {
                    profile_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            instances: {
                                /** Format: uuid */
                                id: string;
                                /** Format: uuid */
                                runner_profile_id: string;
                                /** Format: uuid */
                                agent_id: string | null;
                                external_user_id: string;
                                enabled: boolean;
                                /** @enum {string} */
                                desired_state: "running" | "stopped";
                                status: string;
                                created_at: string;
                                updated_at: string;
                            }[];
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            instances: {
                                /** Format: uuid */
                                id: string;
                                /** Format: uuid */
                                runner_profile_id: string;
                                /** Format: uuid */
                                agent_id: string | null;
                                external_user_id: string;
                                enabled: boolean;
                                /** @enum {string} */
                                desired_state: "running" | "stopped";
                                status: string;
                                created_at: string;
                                updated_at: string;
                            }[];
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            instances: {
                                /** Format: uuid */
                                id: string;
                                /** Format: uuid */
                                runner_profile_id: string;
                                /** Format: uuid */
                                agent_id: string | null;
                                external_user_id: string;
                                enabled: boolean;
                                /** @enum {string} */
                                desired_state: "running" | "stopped";
                                status: string;
                                created_at: string;
                                updated_at: string;
                            }[];
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        /** Create an instance for an application user */
        post: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path: {
                    profile_id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        external_user_id: string;
                        /** Format: uuid */
                        agent_id?: string;
                    };
                };
            };
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/runners/{profile_id}/instances/{instance_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get user runner instance */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    profile_id: string;
                    instance_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /** Soft delete an instance and retain its volume */
        delete: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path: {
                    profile_id: string;
                    instance_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /** Start, stop or reprovision an instance */
        patch: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path: {
                    profile_id: string;
                    instance_id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {string} */
                        operation: "start" | "stop" | "reprovision";
                        enabled?: boolean;
                    };
                };
            };
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/coding/agents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List coding agents */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            agents: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                /** Format: uuid */
                                runner_profile_id: string;
                                /** @enum {string} */
                                status: "active" | "disabled" | "deleted";
                                created_at: string;
                                updated_at?: string;
                            }[];
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            agents: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                /** Format: uuid */
                                runner_profile_id: string;
                                /** @enum {string} */
                                status: "active" | "disabled" | "deleted";
                                created_at: string;
                                updated_at?: string;
                            }[];
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            agents: {
                                /** Format: uuid */
                                id: string;
                                name: string;
                                /** Format: uuid */
                                runner_profile_id: string;
                                /** @enum {string} */
                                status: "active" | "disabled" | "deleted";
                                created_at: string;
                                updated_at?: string;
                            }[];
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        /** Create a coding agent */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        /** Format: uuid */
                        runner_profile_id?: string;
                    };
                };
            };
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** @enum {string} */
                            status: "active" | "disabled" | "deleted";
                            created_at: string;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** @enum {string} */
                            status: "active" | "disabled" | "deleted";
                            created_at: string;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** @enum {string} */
                            status: "active" | "disabled" | "deleted";
                            created_at: string;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a coding agent */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** @enum {string} */
                            status: "active" | "disabled" | "deleted";
                            created_at: string;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** @enum {string} */
                            status: "active" | "disabled" | "deleted";
                            created_at: string;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** @enum {string} */
                            status: "active" | "disabled" | "deleted";
                            created_at: string;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /** Soft delete an unused coding agent */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            deleted: boolean;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            deleted: boolean;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            deleted: boolean;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /** Update or rebind a coding agent */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name?: string;
                        /** Format: uuid */
                        runner_profile_id?: string;
                        /** @enum {string} */
                        status?: "active" | "disabled";
                    };
                };
            };
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** @enum {string} */
                            status: "active" | "disabled" | "deleted";
                            created_at: string;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** @enum {string} */
                            status: "active" | "disabled" | "deleted";
                            created_at: string;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            name: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** @enum {string} */
                            status: "active" | "disabled" | "deleted";
                            created_at: string;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/coding/agents/{agent_id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the current user runner availability */
        get: {
            parameters: {
                query?: {
                    external_user_id?: string;
                    session_id?: string;
                };
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            agent_id: string;
                            /** @enum {string} */
                            status: "ready" | "starting" | "unavailable";
                            reason: string | null;
                            updated_at: string | null;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            agent_id: string;
                            /** @enum {string} */
                            status: "ready" | "starting" | "unavailable";
                            reason: string | null;
                            updated_at: string | null;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            agent_id: string;
                            /** @enum {string} */
                            status: "ready" | "starting" | "unavailable";
                            reason: string | null;
                            updated_at: string | null;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/runner-instance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Ensure the authenticated user runner instance */
        post: {
            parameters: {
                query?: never;
                header: {
                    "idempotency-key": string;
                };
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": Record<string, unknown>;
                };
            };
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: uuid */
                            id: string;
                            /** Format: uuid */
                            runner_profile_id: string;
                            /** Format: uuid */
                            agent_id: string | null;
                            external_user_id: string;
                            enabled: boolean;
                            /** @enum {string} */
                            desired_state: "running" | "stopped";
                            status: string;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Administrator token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Not found in this application */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Deployment unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/status/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Stream the current user runner availability */
        get: {
            parameters: {
                query?: {
                    external_user_id?: string;
                    session_id?: string;
                };
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description SSE runner.status snapshots; reconnect after the stream closes */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/event-stream": string;
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description User scope not allowed */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Agent not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
                /** @description Service unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/diff": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the uncommitted diff
         * @description Read-only query; never provisions repositories. Returns ready, no_repository or not_ready. Offline runners return 409; timeouts return 503 with Retry-After; Git command failures return 400 git_diff_failed.
         */
        get: {
            parameters: {
                query?: {
                    repo_key?: string;
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Diff */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /**
                             * @description not_ready means the diff may be incomplete because a local repository is not materialized.
                             * @enum {string}
                             */
                            status: "ready" | "no_repository" | "not_ready";
                            diffs: {
                                repo_key?: string | null;
                                path: string;
                                /** @enum {string} */
                                status: "added" | "modified" | "deleted" | "renamed";
                                diff: string;
                            }[];
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/commit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Commit coding session changes
         * @description Commit uncommitted changes in the session workspace. `message` defaults to the turn/session identifier.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        message?: string;
                        title?: string;
                        repo_key?: string;
                        branch?: string;
                    };
                };
            };
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            ok: boolean;
                            message: string;
                            commit_sha?: string | null;
                            repo_key?: string;
                            branch?: string;
                            pull_request_url?: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/push": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Push coding session changes
         * @description Push committed changes to the remote repository using the user's deploy key.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        message?: string;
                        title?: string;
                        repo_key?: string;
                        branch?: string;
                    };
                };
            };
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            ok: boolean;
                            message: string;
                            commit_sha?: string | null;
                            repo_key?: string;
                            branch?: string;
                            pull_request_url?: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/pull-request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create a pull request
         * @description Push changes and open a pull request (requires git provider integration on the runner).
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        message?: string;
                        title?: string;
                        repo_key?: string;
                        branch?: string;
                    };
                };
            };
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            ok: boolean;
                            message: string;
                            commit_sha?: string | null;
                            repo_key?: string;
                            branch?: string;
                            pull_request_url?: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/git/identity": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the current user's Git commit identity
         * @description User token required. Stored per application and user. Does not start an instance. Applied on the next task or Git operation.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Git identity */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            name: string;
                            /** Format: email */
                            email: string;
                        };
                    };
                };
                /** @description Invalid identity */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description User token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Agent not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        /**
         * Set the current user's Git commit identity
         * @description User token required. Stored per application and user. Does not start an instance. Applied on the next task or Git operation.
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        name: string;
                        /** Format: email */
                        email: string;
                    };
                };
            };
            responses: {
                /** @description Git identity */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            name: string;
                            /** Format: email */
                            email: string;
                        };
                    };
                };
                /** @description Invalid identity */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description User token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Agent not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/keys/public": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read the user's SSH public key without creating it
         * @description User token required. Credentials are scoped to application and external user. Updates persist before container synchronization; failed synchronization is retried automatically. New SSH-dependent commands wait until synchronization succeeds. Private keys are never returned.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Public key */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            key_type: string;
                            public_key: string;
                            fingerprint: string;
                            key_generated_at: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description User token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Agent or key not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Key fingerprint changed */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Credential storage unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ensure the user's SSH key without creating a Runner
         * @description User token required. Credentials are scoped to application and external user. Updates persist before container synchronization; failed synchronization is retried automatically. New SSH-dependent commands wait until synchronization succeeds. Private keys are never returned.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": Record<string, unknown>;
                };
            };
            responses: {
                /** @description Public key */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            key_type: string;
                            public_key: string;
                            fingerprint: string;
                            key_generated_at: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description User token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Agent or key not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Key fingerprint changed */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Credential storage unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/agents/{agent_id}/keys/rotate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rotate the user's SSH key using its current fingerprint
         * @description User token required. Credentials are scoped to application and external user. Updates persist before container synchronization; failed synchronization is retried automatically. New SSH-dependent commands wait until synchronization succeeds. Private keys are never returned.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    agent_id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        fingerprint: string;
                    };
                };
            };
            responses: {
                /** @description Public key */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            key_type: string;
                            public_key: string;
                            fingerprint: string;
                            key_generated_at: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description User token required */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Agent or key not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Key fingerprint changed */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Credential storage unavailable */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/modes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List cached provider execution modes
         * @description Returns the latest persisted catalog for the provider, or the built-in catalog before discovery. Works offline without creating, starting, or querying a runner. default_mode is the platform initial choice.
         */
        get: {
            parameters: {
                query: {
                    agent_id: string;
                    session_id?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Execution modes */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            provider: string;
                            default_mode: string | null;
                            supports_plan_mode: boolean;
                            /** @enum {string} */
                            source: "snapshot" | "builtin";
                            updated_at: string | null;
                            stale: boolean;
                            modes: {
                                id: string;
                                label: string;
                                description?: string;
                            }[];
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/models": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List models available on the runner
         * @description List application-authorized models compatible with the agent engine, without creating or starting an instance. Models can change per turn; provider switching is not supported.
         */
        get: {
            parameters: {
                query: {
                    provider?: string;
                    agent_id: string;
                    refresh?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Model catalog */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            provider: string;
                            runner_id: string;
                            default_model: string | null;
                            cached: boolean;
                            models: {
                                id: string;
                                label: string;
                                provider: string;
                                is_default: boolean;
                                context_window_max_tokens?: number | null;
                                default_thinking_option_id?: string | null;
                                description?: string | null;
                                thinking_options?: {
                                    id: string;
                                    label: string;
                                    is_default?: boolean;
                                    description?: string | null;
                                }[];
                            }[];
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
                /** @description Runner offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Additive diagnostics; the legacy error field keeps its original type and code. */
                            error_info?: {
                                code: string;
                                message: string;
                                reason_code: string;
                                user_message: string;
                                retryable?: boolean;
                                details: {
                                    [key: string]: unknown;
                                };
                            };
                            error: string | {
                                code: string;
                                message: string;
                                retryable?: boolean;
                                details?: {
                                    [key: string]: unknown;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{session_id}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List messages
         * @description List all messages stored in a session.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List messages */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            messages: {
                                id: string;
                                app_id: string;
                                session_id: string;
                                external_user_id: string;
                                /** @enum {string} */
                                role: "user" | "assistant" | "system" | "tool";
                                content?: string | null;
                                content_type?: string;
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data: {
                                    [key: string]: unknown;
                                };
                                execution_summary?: {
                                    /** @enum {string} */
                                    runtime?: "pi_coding_agent" | "runner";
                                    /** @enum {string} */
                                    status?: "completed" | "failed";
                                    provider?: string;
                                    adapter?: string;
                                    workspace_id?: string;
                                    runtime_session_id?: string;
                                    turn_id?: string;
                                    files_changed?: string[];
                                    git_operations?: string[];
                                    tools_used?: string[];
                                    tool_audit?: {
                                        tool: string;
                                        /** @enum {string} */
                                        status: "running" | "completed" | "failed";
                                        call_id?: string;
                                        input?: {
                                            [key: string]: unknown;
                                        };
                                        file_paths?: string[];
                                        skill_ids?: string[];
                                        result?: {
                                            content_preview?: string;
                                            content_length?: number;
                                        };
                                        error?: string;
                                    }[];
                                    skills_loaded?: {
                                        skill_id: string;
                                        key: string;
                                        revision_id: string;
                                        version: number;
                                    }[];
                                    skills_invoked?: {
                                        skill_key: string;
                                        backend: string;
                                        /** @enum {string} */
                                        status: "succeeded" | "failed" | "timeout";
                                        duration_ms: number;
                                    }[];
                                    references_used?: {
                                        qa_matches_count: number;
                                        memory_chunks_count: number;
                                    };
                                    timing_ms?: number;
                                } | null;
                                content_parts?: ({
                                    /** @enum {string} */
                                    type: "input_text";
                                    text: string;
                                } | {
                                    /** @enum {string} */
                                    type: "input_image";
                                    path?: string;
                                    /** Format: uuid */
                                    file_id?: string;
                                    mime_type?: string;
                                    name?: string;
                                } | {
                                    /** @enum {string} */
                                    type: "input_file";
                                    path?: string;
                                    /** Format: uuid */
                                    file_id?: string;
                                    mime_type?: string;
                                    name?: string;
                                })[];
                                attachments: unknown[];
                                ai_response?: unknown;
                                /** @enum {string} */
                                status: "pending" | "sending" | "sent" | "failed" | "deleted" | "moderated";
                                created_at: string;
                                updated_at: string;
                            }[];
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        /**
         * Send message
         * @description Send a new message in an existing session and execute one agent turn. When `stream=true` or omitted, the response is streamed as OpenAI-style SSE chunks. When `stream=false`, the response is a compact JSON object containing `content`, `model`, `finish_reason`, optional `tool_calls`, and `usage`.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        content?: ({
                            /** @enum {string} */
                            type: "input_text";
                            text: string;
                        } | ({
                            /** @enum {string} */
                            type: "input_image";
                            /** @description Legacy session-relative file path. */
                            path?: string;
                            /**
                             * Format: uuid
                             * @description Uploaded attachment ID.
                             */
                            file_id: string;
                            mime_type?: string;
                            name?: string;
                        } | {
                            /** @enum {string} */
                            type: "input_image";
                            /** @description Legacy session-relative file path. */
                            path: string;
                            /**
                             * Format: uuid
                             * @description Uploaded attachment ID.
                             */
                            file_id?: string;
                            mime_type?: string;
                            name?: string;
                        }) | ({
                            /** @enum {string} */
                            type: "input_file";
                            /** @description Legacy session-relative file path. */
                            path?: string;
                            /**
                             * Format: uuid
                             * @description Uploaded attachment ID.
                             */
                            file_id: string;
                            mime_type?: string;
                            name?: string;
                        } | {
                            /** @enum {string} */
                            type: "input_file";
                            /** @description Legacy session-relative file path. */
                            path: string;
                            /**
                             * Format: uuid
                             * @description Uploaded attachment ID.
                             */
                            file_id?: string;
                            mime_type?: string;
                            name?: string;
                        }))[];
                        /** @description Whether to stream the response. Defaults to true. When false, the response is a single JSON object. */
                        stream?: boolean;
                        /** @description Optional mounted skill id to explicitly target for this turn. */
                        skill_id?: string;
                        tools?: unknown[];
                        tool_bindings?: {
                            [key: string]: {
                                /** @enum {string} */
                                type: "http";
                                /** Format: uri */
                                url: string;
                                /** @enum {string} */
                                method?: "POST" | "PUT" | "PATCH";
                                headers?: {
                                    [key: string]: string;
                                };
                            };
                        };
                        /** @enum {string} */
                        tool_execution_mode?: "runtime-execute" | "schema-only" | "runtime-orchestrate";
                        messages?: unknown[];
                        /** @description Optional message-scoped metadata. Set custom_data.repository_id to force this turn to run inside a specific repository. */
                        custom_data?: {
                            [key: string]: unknown;
                        };
                    };
                };
            };
            responses: {
                /** @description Create message */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            content?: string | null;
                            model?: string;
                            finish_reason?: string | null;
                            tool_calls?: {
                                id: string;
                                type: string;
                                function: {
                                    name: string;
                                    arguments: string;
                                };
                            }[];
                            usage?: unknown;
                            execution_summary?: {
                                /** @enum {string} */
                                runtime?: "pi_coding_agent" | "runner";
                                /** @enum {string} */
                                status?: "completed" | "failed";
                                provider?: string;
                                adapter?: string;
                                workspace_id?: string;
                                runtime_session_id?: string;
                                turn_id?: string;
                                files_changed?: string[];
                                git_operations?: string[];
                                tools_used?: string[];
                                tool_audit?: {
                                    tool: string;
                                    /** @enum {string} */
                                    status: "running" | "completed" | "failed";
                                    call_id?: string;
                                    input?: {
                                        [key: string]: unknown;
                                    };
                                    file_paths?: string[];
                                    skill_ids?: string[];
                                    result?: {
                                        content_preview?: string;
                                        content_length?: number;
                                    };
                                    error?: string;
                                }[];
                                skills_loaded?: {
                                    skill_id: string;
                                    key: string;
                                    revision_id: string;
                                    version: number;
                                }[];
                                skills_invoked?: {
                                    skill_key: string;
                                    backend: string;
                                    /** @enum {string} */
                                    status: "succeeded" | "failed" | "timeout";
                                    duration_ms: number;
                                }[];
                                references_used?: {
                                    qa_matches_count: number;
                                    memory_chunks_count: number;
                                };
                                timing_ms?: number;
                            } | null;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        /**
         * Delete all messages
         * @description Delete all messages in a session while keeping the session record.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Delete messages */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/messages/{message_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get message
         * @description Get one message by id.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    message_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Get message */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: {
                                id: string;
                                app_id: string;
                                session_id: string;
                                external_user_id: string;
                                /** @enum {string} */
                                role: "user" | "assistant" | "system" | "tool";
                                content?: string | null;
                                content_type?: string;
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data: {
                                    [key: string]: unknown;
                                };
                                execution_summary?: {
                                    /** @enum {string} */
                                    runtime?: "pi_coding_agent" | "runner";
                                    /** @enum {string} */
                                    status?: "completed" | "failed";
                                    provider?: string;
                                    adapter?: string;
                                    workspace_id?: string;
                                    runtime_session_id?: string;
                                    turn_id?: string;
                                    files_changed?: string[];
                                    git_operations?: string[];
                                    tools_used?: string[];
                                    tool_audit?: {
                                        tool: string;
                                        /** @enum {string} */
                                        status: "running" | "completed" | "failed";
                                        call_id?: string;
                                        input?: {
                                            [key: string]: unknown;
                                        };
                                        file_paths?: string[];
                                        skill_ids?: string[];
                                        result?: {
                                            content_preview?: string;
                                            content_length?: number;
                                        };
                                        error?: string;
                                    }[];
                                    skills_loaded?: {
                                        skill_id: string;
                                        key: string;
                                        revision_id: string;
                                        version: number;
                                    }[];
                                    skills_invoked?: {
                                        skill_key: string;
                                        backend: string;
                                        /** @enum {string} */
                                        status: "succeeded" | "failed" | "timeout";
                                        duration_ms: number;
                                    }[];
                                    references_used?: {
                                        qa_matches_count: number;
                                        memory_chunks_count: number;
                                    };
                                    timing_ms?: number;
                                } | null;
                                content_parts?: ({
                                    /** @enum {string} */
                                    type: "input_text";
                                    text: string;
                                } | {
                                    /** @enum {string} */
                                    type: "input_image";
                                    path?: string;
                                    /** Format: uuid */
                                    file_id?: string;
                                    mime_type?: string;
                                    name?: string;
                                } | {
                                    /** @enum {string} */
                                    type: "input_file";
                                    path?: string;
                                    /** Format: uuid */
                                    file_id?: string;
                                    mime_type?: string;
                                    name?: string;
                                })[];
                                attachments: unknown[];
                                ai_response?: unknown;
                                /** @enum {string} */
                                status: "pending" | "sending" | "sent" | "failed" | "deleted" | "moderated";
                                created_at: string;
                                updated_at: string;
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /**
         * Delete message
         * @description Delete one message by id.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    message_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Delete message */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List sessions
         * @description List all sessions for the current external user, optionally filtered by agent, category, or model.
         */
        get: {
            parameters: {
                query?: {
                    category?: string;
                    agent_id?: string;
                    model?: string;
                    page?: number;
                    page_size?: number;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List sessions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Sessions returned for the current page. */
                            sessions: {
                                id: string;
                                app_id: string;
                                agent_id: string;
                                external_user_id: string;
                                title: string;
                                settings: {
                                    [key: string]: unknown;
                                };
                                reference_settings?: unknown;
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data?: unknown;
                                /** @description Session-level skill_id selection. Null means the session inherits all skills mounted on its agent. */
                                skill_ids?: string[] | null;
                                category?: string;
                                /** @enum {string} */
                                status: "active" | "archived" | "deleted" | "suspended";
                                created_at: string;
                                updated_at: string;
                                /**
                                 * Format: uuid
                                 * @description Latest message at the current agent context boundary.
                                 */
                                context_reset_message_id?: string | null;
                                agent?: unknown;
                            }[];
                            /**
                             * @description Current page number.
                             * @example 1
                             */
                            page: number;
                            /**
                             * @description Requested page size.
                             * @example 20
                             */
                            page_size: number;
                            /**
                             * @description Total number of matching sessions across all pages.
                             * @example 137
                             */
                            total: number;
                            /**
                             * @description Whether another page exists after the current one.
                             * @example true
                             */
                            has_more: boolean;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get session
         * @description Get one session by id.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Get session */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            session: {
                                id: string;
                                app_id: string;
                                agent_id: string;
                                external_user_id: string;
                                title: string;
                                settings: {
                                    [key: string]: unknown;
                                };
                                reference_settings?: unknown;
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data?: unknown;
                                /** @description Session-level skill_id selection. Null means the session inherits all skills mounted on its agent. */
                                skill_ids?: string[] | null;
                                category?: string;
                                /** @enum {string} */
                                status: "active" | "archived" | "deleted" | "suspended";
                                created_at: string;
                                updated_at: string;
                                /**
                                 * Format: uuid
                                 * @description Latest message at the current agent context boundary.
                                 */
                                context_reset_message_id?: string | null;
                                agent?: unknown;
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        /**
         * Update session
         * @description Update mutable session fields such as title, custom data, model, and session-level skills. When `skills` is omitted, the current session skill selection is unchanged. Set `skills` to null to inherit all skills mounted on the agent, set it to [] to explicitly disable all skills for this session, or set it to [skill_id...] to use exactly those active skills for this session.
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description Optional session title. */
                        title?: string | null;
                        /** @description Optional model id override. Persisted as settings.model. */
                        model?: string;
                        /** @description Optional session-level system prompt override. Omit to keep the current prompt unchanged; set null to clear settings.prompt. */
                        prompt?: string | null;
                        /** @description Optional session-scoped business metadata. Set custom_data.repository_id to make future turns use a specific repository by default. */
                        custom_data?: unknown;
                        /** @description Optional session-level skill_id list. Omit to keep the current selection unchanged. Set null to inherit all skills mounted on the agent. Set [] to disable all skills for this session. Set [skill_id...] to use exactly those active skills, which may include any active skill under the app. */
                        skills?: string[] | null;
                    };
                };
            };
            responses: {
                /** @description Update session */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        post?: never;
        /**
         * Delete session
         * @description Delete a session and its related conversation data.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Delete session */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{session_id}/context/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reset session context
         * @description Reset the agent context boundary without deleting stored session messages.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Reset session context */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description Reset operation result. */
                            message: string;
                            /**
                             * Format: uuid
                             * @description Message ID marking the new context boundary, or null for an empty session.
                             */
                            context_reset_message_id: string | null;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{session_id}/generate-title": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate session title
         * @description Generate a title from the session history and save it back to the session.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Generate title */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            title: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{session_id}/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List session files
         * @description List all files and directories inside the session working directory recursively. This endpoint takes no query parameters.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Session file tree */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            root: {
                                path: string;
                                name: string;
                                /** @enum {string} */
                                type: "file" | "directory";
                                size?: number;
                                mime_type?: string;
                                updated_at?: string;
                                children?: unknown[];
                            };
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{session_id}/files/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read session file
         * @description Read a text file from the session working directory.
         */
        get: {
            parameters: {
                query?: {
                    path?: string;
                    file_id?: string;
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Session file content */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            path: string;
                            name: string;
                            mime_type: string;
                            size: number;
                            /** @enum {string} */
                            encoding: "utf-8";
                            content: string;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{session_id}/files/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download session file
         * @description Download a file from the session working directory.
         */
        get: {
            parameters: {
                query?: {
                    path?: string;
                    file_id?: string;
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Session file download */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/octet-stream": string;
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{session_id}/files/upload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload session file
         * @description Upload an immutable attachment (omit path), or write a workspace file using a legacy relative target path.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "multipart/form-data": {
                        /**
                         * Format: binary
                         * @description File to upload into the session working directory.
                         */
                        file: string;
                        /** @description Optional legacy workspace target path. Omit to upload an immutable attachment and receive a file ID. */
                        path?: string;
                    };
                };
            };
            responses: {
                /** @description Session file uploaded */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            path?: string;
                            /** Format: uuid */
                            id?: string;
                            /** @enum {string} */
                            status?: "ready";
                            name: string;
                            mime_type: string;
                            size: number;
                            updated_at?: string;
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{session_id}/images/generations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Generate session images
         * @description Generate images with an image model and store the generated files inside the current session working directory under output/images/.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description Image generation model id. */
                        model: string;
                        /** @description Text prompt used to generate images. */
                        prompt: string;
                        /** @description Requested image size, for example 1024x1024. */
                        size?: string;
                        /** @description Number of images to generate. */
                        n?: number;
                        background?: string;
                        quality?: string;
                        /** @description Preferred output format such as png, webp, or jpeg. */
                        output_format?: string;
                    };
                };
            };
            responses: {
                /** @description Generated session images */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            created: number;
                            session_id: string;
                            data: {
                                path: string;
                                name: string;
                                mime_type: string;
                                size: number;
                                download_url: string;
                                updated_at?: string;
                            }[];
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skills": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List skills
         * @description List all skills under the current app.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List skills */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            app_id: string;
                            key: string;
                            name: string;
                            description?: string | null;
                            entry_path: string;
                            /** @enum {string} */
                            status: "draft" | "active" | "disabled" | "deleted";
                            created_by?: number | null;
                            created_at: string;
                            updated_at: string;
                        }[];
                    };
                };
            };
        };
        put?: never;
        /**
         * Create skill
         * @description Create a skill record under the current app.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description Unique skill key. Lowercase letters, numbers, underscore and dash only. */
                        key: string;
                        /** @description Skill display name. */
                        name: string;
                        description?: string | null;
                        /**
                         * @default draft
                         * @enum {string}
                         */
                        status?: "draft" | "active" | "disabled" | "deleted";
                    };
                };
            };
            responses: {
                /** @description Created skill */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            skill: {
                                id: string;
                                app_id: string;
                                key: string;
                                name: string;
                                description?: string | null;
                                entry_path: string;
                                /** @enum {string} */
                                status: "draft" | "active" | "disabled" | "deleted";
                                created_by?: number | null;
                                created_at: string;
                                updated_at: string;
                            };
                        };
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skills/validate-bundle": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Validate skill bundle
         * @description Validate a skill bundle before publishing. Choose application/json to submit text files directly in the files array, or multipart/form-data to upload a ZIP archive. Both formats produce the same normalized bundle validation result.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        files: {
                            /**
                             * @description Relative file path inside the skill bundle. Exactly one file must be named SKILL.md.
                             * @example SKILL.md
                             */
                            path: string;
                            /**
                             * @description MIME type of the file. Use text/* for direct JSON content uploads.
                             * @example text/markdown
                             */
                            media_type?: string;
                            /**
                             * @description Text content of the file. Direct JSON uploads support text files; use ZIP for binary files.
                             * @example # Refund Helper
                             *
                             *     Handle refund workflows.
                             */
                            content?: string;
                        }[];
                    };
                    "multipart/form-data": {
                        /**
                         * Format: binary
                         * @description ZIP archive containing the complete skill bundle, including exactly one SKILL.md file. Use this format for binary files.
                         */
                        bundle: string;
                        /** @description Description of the changes included in this revision. */
                        changelog?: string | null;
                    };
                };
            };
            responses: {
                /** @description Validation result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            ok: boolean;
                            errors: {
                                code: string;
                                message: string;
                            }[];
                            warnings: {
                                code: string;
                                message: string;
                            }[];
                            summary: {
                                entry_path: string;
                                files: number;
                                size_bytes: number;
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skills/{skill_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get skill
         * @description Get one skill by id.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    skill_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Skill */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            app_id: string;
                            key: string;
                            name: string;
                            description?: string | null;
                            entry_path: string;
                            /** @enum {string} */
                            status: "draft" | "active" | "disabled" | "deleted";
                            created_by?: number | null;
                            created_at: string;
                            updated_at: string;
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /**
         * Delete skill
         * @description Soft delete a skill.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    skill_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Deleted skill */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            skill: {
                                id: string;
                                app_id: string;
                                key: string;
                                name: string;
                                description?: string | null;
                                entry_path: string;
                                /** @enum {string} */
                                status: "draft" | "active" | "disabled" | "deleted";
                                created_by?: number | null;
                                created_at: string;
                                updated_at: string;
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /**
         * Update skill
         * @description Update mutable skill metadata and status.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    skill_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        name?: string;
                        description?: string | null;
                        /** @enum {string} */
                        status?: "draft" | "active" | "disabled" | "deleted";
                    };
                };
            };
            responses: {
                /** @description Updated skill */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            skill: {
                                id: string;
                                app_id: string;
                                key: string;
                                name: string;
                                description?: string | null;
                                entry_path: string;
                                /** @enum {string} */
                                status: "draft" | "active" | "disabled" | "deleted";
                                created_by?: number | null;
                                created_at: string;
                                updated_at: string;
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/skills/{skill_id}/undelete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Restore skill
         * @description Restore a soft-deleted skill.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    skill_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Restored skill */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            skill: {
                                id: string;
                                app_id: string;
                                key: string;
                                name: string;
                                description?: string | null;
                                entry_path: string;
                                /** @enum {string} */
                                status: "draft" | "active" | "disabled" | "deleted";
                                created_by?: number | null;
                                created_at: string;
                                updated_at: string;
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skills/{skill_id}/revisions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List revisions
         * @description List all revisions for a skill.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    skill_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description List revisions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            skill_id: string;
                            version: number;
                            checksum?: string | null;
                            changelog?: string | null;
                            /** @enum {string} */
                            status: "active" | "archived";
                            created_by?: number | null;
                            created_at: string;
                        }[];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        /**
         * Publish revision
         * @description Publish a new skill revision. Use application/json for direct text file content in the files array. Use multipart/form-data with the bundle field for a ZIP archive, especially when the skill contains binary files.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    skill_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        files: {
                            /**
                             * @description Relative file path inside the skill bundle. Exactly one file must be named SKILL.md.
                             * @example SKILL.md
                             */
                            path: string;
                            /**
                             * @description MIME type of the file. Use text/* for direct JSON content uploads.
                             * @example text/markdown
                             */
                            media_type?: string;
                            /**
                             * @description Text content of the file. Direct JSON uploads support text files; use ZIP for binary files.
                             * @example # Refund Helper
                             *
                             *     Handle refund workflows.
                             */
                            content?: string;
                        }[];
                        /**
                         * @description Description of the changes included in this revision.
                         * @example Improve refund handling.
                         */
                        changelog?: string | null;
                    };
                    "multipart/form-data": {
                        /**
                         * Format: binary
                         * @description ZIP archive containing the complete skill bundle, including exactly one SKILL.md file. Use this format for binary files.
                         */
                        bundle: string;
                        /** @description Description of the changes included in this revision. */
                        changelog?: string | null;
                    };
                };
            };
            responses: {
                /** @description Published revision */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            skill: {
                                key: string;
                            };
                            revision: {
                                id: string;
                                skill_id: string;
                                version: number;
                                checksum?: string | null;
                                changelog?: string | null;
                                /** @enum {string} */
                                status: "active" | "archived";
                                created_by?: number | null;
                                created_at: string;
                            };
                            summary: {
                                entry_path: string;
                                files: number;
                                size_bytes: number;
                            };
                        };
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/skills/{skill_id}/revisions/{version}/contents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List revision contents
         * @description List all files stored in a published revision.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    skill_id: string;
                    version: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Revision contents */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            revision_id: string;
                            path: string;
                            media_type: string;
                            text_content?: string | null;
                            binary_content?: unknown;
                            size_bytes: number;
                            sha256?: string | null;
                            metadata: {
                                [key: string]: unknown;
                            };
                            created_at: string;
                            updated_at: string;
                        }[];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                code: string;
                                message: string;
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List memory collections */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Memory collections */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryCollection"][];
                    };
                };
            };
        };
        put?: never;
        /** Create a memory collection (admin only) */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["MemoryCollectionCreateRequest"];
                };
            };
            responses: {
                /** @description Created collection */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryCollection"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a memory collection
         * @description Includes model availability and content synchronization counts. Use GET /memories/{id}/failures for failed content IDs and redacted Worker reasons.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Memory collection and current model/content synchronization status */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryCollectionDetails"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Memory collection not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        /** Update a memory collection (admin only) */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["MemoryCollectionUpdateRequest"];
                };
            };
            responses: {
                /** @description Updated collection */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryCollection"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        post?: never;
        /** Delete a memory collection (admin only) */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Deleted collection */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryCollection"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}/rebuild": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rebuild memory collection embeddings (admin only)
         * @description Atomically clears only this collection's old embedding jobs and vectors/chunks, preserves source contents, and queues new jobs. Allows rebuilding with the same model. Poll GET /memories/{id} for completion; embedding calls may incur charges. Send {} to keep the current model.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["MemoryCollectionRebuildRequest"];
                };
            };
            responses: {
                /** @description Rebuild accepted and queued */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryCollectionRebuildResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Memory collection not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Rebuild failed; transaction rolled back */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}/failures": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List failed memory contents and embedding reasons
         * @description Available to regular app user tokens and admin tokens. Returns paginated failed, non-deleted contents with redacted latest embedding job diagnostics. Disabled collections and contents remain observable. Successful or retrying contents are not listed; rebuilding clears previous errors.
         */
        get: {
            parameters: {
                query?: {
                    page?: number;
                    page_size?: number;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Failed content IDs and redacted reasons */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryCollectionFailures"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Memory collection not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}/contents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List memory contents */
        get: {
            parameters: {
                query?: {
                    type?: string;
                    keywords?: string;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Memory contents */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryContent"][];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        /**
         * Create or update memory content (admin only)
         * @description When `key` is supplied and content with that key already exists, the existing content is updated instead of creating a new one.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["MemoryContentRequest"];
                };
            };
            responses: {
                /** @description Content result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryContentActionResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}/contents-filter": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Filter memory contents with advanced operators */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["MemoryContentsFilterRequest"];
                };
            };
            responses: {
                /** @description Memory contents */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryContent"][];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}/contents/{content_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get memory content */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                    content_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Memory content */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryContent"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        /** Update memory content (admin only) */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                    content_id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["MemoryContentRequest"];
                };
            };
            responses: {
                /** @description Content result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryContentActionResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        post?: never;
        /**
         * Delete memory content (admin only)
         * @description When `{content_id}` starts with `_`, the remainder is treated as a content key instead of an id.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                    content_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Content result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryContentActionResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}/contents/batch": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create memory contents in batch (admin only) */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["MemoryContentBatchRequest"];
                };
            };
            responses: {
                /** @description Batch content result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryBatchCreateResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}/contents/{content_id}/chunks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List content chunks (admin only) */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                    content_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Content chunks */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryContentChunk"][];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}/embeddings-search-chunks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Search memory chunks by embedding */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["MemorySearchRequest"];
                };
            };
            responses: {
                /** @description Matching chunks */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemorySearchChunk"][];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}/embeddings-search-contents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Search memory contents by embedding */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["MemorySearchRequest"];
                };
            };
            responses: {
                /** @description Matching contents */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MemoryContent"][];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/queue/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get embedding queue status (admin only) */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Queue and worker status */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EmbeddingQueueStatusResponse"];
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/memories/{id}/contents/{content_id}/jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List content embedding jobs (admin only) */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                    content_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Embedding jobs */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["EmbeddingJob"][];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/qa/pairs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List QA pairs
         * @description List all non-deleted QA pairs of the current app.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description QA pairs */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAPair"][];
                    };
                };
            };
        };
        put?: never;
        /**
         * Create a QA pair (upsert by key)
         * @description Creates a QA pair. When `key` is supplied and a pair with that key already exists, the existing pair is updated (200) instead of creating a new one (201). Requires an embedding model available to the app, otherwise 400.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["QAPairCreateRequest"];
                };
            };
            responses: {
                /** @description Existing pair updated by key */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAPair"];
                    };
                };
                /** @description Pair created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAPair"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/qa/pairs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a QA pair */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description QA pair */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAPair"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAError"];
                    };
                };
            };
        };
        /** Update a QA pair */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["QAPairUpdateRequest"];
                };
            };
            responses: {
                /** @description Updated pair */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAPair"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAError"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAError"];
                    };
                };
            };
        };
        post?: never;
        /** Soft-delete a QA pair */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Deletion result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QADeleteResponse"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/qa/batch/delete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Batch soft-delete QA pairs
         * @description Deletes pairs matching any of the supplied conditions (`ids`, `keys`, `attrs_filter`) combined with OR logic. At least one condition is required. `attrs_filter` only supports exact value matches (no comparison operators).
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["QABatchDeleteRequest"];
                };
            };
            responses: {
                /** @description Batch deletion result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QABatchDeleteResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/qa/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Search matching QA pairs
         * @description `attrs` supports comparison operators; requires an embedding model available to the app, otherwise 400.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["QASearchRequest"];
                };
            };
            responses: {
                /** @description Matching pairs */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAMatchResult"][];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/qa/match": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the best matching QA pair
         * @description Requires an embedding model available to the app, otherwise 400.
         */
        get: {
            parameters: {
                query?: {
                    q?: string;
                    min_similarity?: number | string;
                    embedding_model?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Best match */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAMatchResult"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QAError"];
                    };
                };
                /** @description No matching QA pair found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["QANoMatch"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/extract": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Extract text from an uploaded file
         * @description multipart/form-data upload with a `file` field. The parser is selected from the file extension. Supported: pdf, docx, doc, txt, md, xlsx, xls, csv, pptx, html, htm, json, yaml, yml.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "multipart/form-data": components["schemas"]["FileExtractRequest"];
                };
            };
            responses: {
                /** @description Extracted content */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FileExtractResponse"];
                    };
                };
                /** @description Missing or invalid file */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FileExtractError"];
                    };
                };
                /** @description Parsing error or unsupported file type */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["FileExtractError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/chat/conversations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List conversations
         * @description List conversations of the authenticated external user, ordered by `updated_at` desc. Paged: `page` defaults to 1, `page_size` defaults to 20.
         */
        get: {
            parameters: {
                query?: {
                    category?: string;
                    agent_id?: string;
                    page?: number | string;
                    page_size?: number | string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Conversations */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatConversation"][];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Create a conversation
         * @description All body fields are optional. `settings.model` selects the model; `reference_settings` configures memory/QA retrieval.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ConversationCreateRequest"];
                };
            };
            responses: {
                /** @description Created conversation */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatConversation"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Forbidden: one or more memory collections are not valid for this app */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/chat/conversations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a conversation */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Conversation */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatConversation"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        /** Update conversation title and custom data */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ConversationUpdateRequest"];
                };
            };
            responses: {
                /** @description Update result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MessageActionResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        post?: never;
        /** Delete a conversation (soft delete) */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Delete result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MessageActionResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/chat/conversations/{id}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List messages of a conversation */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Messages */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatMessage"][];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Send a message and get the AI response
         * @description `stream` defaults to true. With `tools` and default runtime-execute mode, `tool_bindings` is required.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ChatMessageCreateRequest"];
                };
            };
            responses: {
                /** @description AI response。stream=true 时为 text/event-stream（每行 `data: {...}`, 以 `data: [DONE]` 结束）; stream=false 时为 JSON。 */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/event-stream": string;
                        "application/json": components["schemas"]["ChatMessageResult"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        /** Delete all messages of a conversation */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Delete result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MessageActionResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/chat/conversation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send a message without building a conversation id
         * @description Simplified endpoint: pass `conversation_id` to continue, or omit it to auto-create a conversation.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": components["schemas"]["ChatMessageCreateRequest"];
                };
            };
            responses: {
                /** @description AI response。stream=true 时为 text/event-stream（每行 `data: {...}`, 以 `data: [DONE]` 结束）; stream=false 时为 JSON。 */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/event-stream": string;
                        "application/json": components["schemas"]["ChatMessageResult"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/chat/conversations/{id}/messages/{message_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a single message */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                    message_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Message */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatMessage"] & (Record<string, unknown> | null);
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /** Delete a single message */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                    message_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Delete result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MessageActionResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/chat/conversations/{id}/generate-title": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Generate a title for the conversation */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Generated title */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["GeneratedTitleResponse"];
                    };
                };
                /** @description Bad request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
                /** @description Not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ChatError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/models": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List models available to this app
         * @description App admin tokens (ak-*) list app-owned models for management. Regular user tokens (ek-*) list models available to the app, filtered by application scope, the app owner's user group, enabled abilities and enabled channels. Runtime availability does not grant model management permissions. Both catalogs use the same response shape.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description App-owned models for ak-*; app-available models for ek-* */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            models: components["schemas"]["SettingsModel"][];
                        };
                    };
                };
                /** @description Unauthorized: missing or invalid bearer token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unexpected server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Register a model with a dedicated OpenAI-compatible channel
         * @description One-call registration of an upstream model: a dedicated OpenAI-compatible channel, the model, one ability and the app ownership are created in the same transaction. Each model gets exactly one channel. Replaying the same model_id is idempotent: existing fields are left untouched and only missing ownership / ability rows are recreated. Requires an app admin token (ak-*).
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CreateSettingsModelRequest"];
                };
            };
            responses: {
                /** @description Registered model (created=false means this app had already registered it) */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            model: components["schemas"]["SettingsModel"];
                            /** @description Channel created for this model; null when the request was an idempotent replay and the channel is gone */
                            channel_id: number | null;
                            /** @description Whether any record was newly created */
                            created: boolean;
                        };
                    };
                };
                /** @description Validation failed */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unauthorized: missing or invalid bearer token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Model not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description model_id already exists */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unexpected server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/models/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a model owned by this app
         * @description Returns 404 for models that do not exist or are not owned by this app. Requires an app admin token (ak-*).
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Model details */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            model: components["schemas"]["SettingsModel"];
                        };
                    };
                };
                /** @description Invalid model id */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unauthorized: missing or invalid bearer token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Model not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unexpected server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /**
         * Release this app's ownership of a model
         * @description Removes the ownership row, deletes this app's ability rows for the model, and recycles the channel when it no longer serves any model. The model and channel records themselves are NOT deleted, because other apps may still own them; the platform cleans them up via /api. Requires an app admin token (ak-*).
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Ownership released */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            deleted: boolean;
                            model_id: string;
                        };
                    };
                };
                /** @description Invalid model id */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unauthorized: missing or invalid bearer token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Model not found or not owned by this app */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Conflicting resource state */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unexpected server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /**
         * Update model capability configuration
         * @description Merges capabilities / features / chat_features into the existing config: omitted fields keep their current value and unrelated config keys are preserved. Requires an app admin token (ak-*).
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateSettingsModelRequest"];
                };
            };
            responses: {
                /** @description Updated model */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            model: components["schemas"]["SettingsModel"];
                        };
                    };
                };
                /** @description Invalid model id or body */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unauthorized: missing or invalid bearer token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Model not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unexpected server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
            };
        };
        trace?: never;
    };
    "/models/test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Test whether given models actually work against their upstreams
         * @description Takes the model ids to test and reports two independent facts for each. `access` is authorization, resolved from the database and always checked first: a model that is not_configured / model_not_found / unauthorized is never probed, so no billable request is issued for it. `probe` is live upstream connectivity, null when the model was not probed. The upstream path is derived from the model's own capabilities: chat models via /chat/completions (or /responses when the model declares Native Responses API), embedding models via /embeddings. Requires an app admin token (ak-*). This endpoint is billable — each probed model issues exactly one real upstream request, and charged_calls reports how many were actually issued.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["TestSettingsModelsRequest"];
                };
            };
            responses: {
                /** @description Per-model access and probe results, in request order */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["TestSettingsModelsResponse"];
                    };
                };
                /** @description Missing or invalid body */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unauthorized: missing or invalid bearer token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unexpected server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/channels": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List channels created by this app
         * @description API keys are returned masked. Requires an app admin token (ak-*).
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description App-owned channels */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            channels: components["schemas"]["SettingsChannel"][];
                        };
                    };
                };
                /** @description Unauthorized: missing or invalid bearer token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unexpected server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/channels/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Rotate channel base_url / api_key
         * @description Used for credential rotation only. Channels are shared by the models bound to them; changes affect all of them. Creating channels is done via POST /v1/zai/models. Requires an app admin token (ak-*).
         */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["UpdateSettingsChannelRequest"];
                };
            };
            responses: {
                /** @description Updated channel */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            channel: components["schemas"]["SettingsChannel"];
                        };
                    };
                };
                /** @description Validation failed or nothing to update */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unauthorized: missing or invalid bearer token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Channel not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Unexpected server error */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/signing_secret": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the ek-* signing secret for this app
         * @description Returns this app's signing secret (`signing_secret`), the value used to sign ek-* (external user) tokens on the app side: md5(signing_secret + app_id + user_id + expired_time). Sensitive key material; reads are audit-logged. api_key is never returned. Requires an app admin token (ak-*).
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Signing secret */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description App id */
                            app_id: string;
                            /** @description Signing secret for ek-* tokens */
                            signing_secret: string;
                            /** @description Token prefix produced with this secret */
                            token_prefix: string;
                        };
                    };
                };
                /** @description Unauthorized: missing or invalid bearer token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description App has no signing secret configured */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/signing_secret/generate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Regenerate the ek-* signing secret for this app
         * @description Generates a new signing secret and persists it immediately. The previous secret is invalidated, so any ek-* tokens signed with it will stop verifying. The new secret can be read back at any time via GET /v1/zai/signing_secret. Generation is audit-logged. Requires an app admin token (ak-*).
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Newly generated signing secret */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @description App id */
                            app_id: string;
                            /** @description Signing secret for ek-* tokens */
                            signing_secret: string;
                            /** @description Token prefix produced with this secret */
                            token_prefix: string;
                        };
                    };
                };
                /** @description Unauthorized: missing or invalid bearer token */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Forbidden: requires an app admin token (ak-*) */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description App not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
                /** @description Failed to regenerate the signing secret */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["SettingsError"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coding/sessions/{session_id}/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Stream persisted coding session events
         * @description Persistent session SSE stream. Resume with after_seq; terminal turn events do not close the session stream. Valid persisted error events are non-terminal data, followed by turn.failed; only malformed envelopes or channel failures interrupt parsing. Heartbeat comments are ignored. Source: https://zai-dev.sh.oop.cc/docs/zai/coding/events
         */
        get: {
            parameters: {
                query?: {
                    /** @description Replay events after this sequence, then follow new events. */
                    after_seq?: string;
                };
                header?: never;
                path: {
                    session_id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description SSE frames contain full persisted events with seq, type, turn_id, payload and created_at. EOF ends this connection and does not imply turn success; no [DONE] sentinel is required. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "text/event-stream": string;
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        MemoryCollection: {
            id: string;
            app_id: string;
            external_user_id?: string;
            external_username?: string;
            name: string;
            description?: string;
            embedding_model?: string;
            max_tokens_per_chunk: number;
            overlap_tokens: number;
            /**
             * @description Collection status
             * @enum {string}
             */
            status: "enabled" | "disabled" | "deleted";
            metadata: {
                [key: string]: unknown;
            };
            created_at: string;
            updated_at?: string;
        };
        MemoryCollectionCreateRequest: {
            /** @description 必填。集合名称, 缺失时返回 400 `{"error":"name is required"}` */
            name?: string;
            /** @description 可选。集合描述, 不传时落库为 null */
            description?: string | null;
            /** @description 可选。不传时使用应用默认向量模型; 应用未配置向量模型时返回 400 */
            embedding_model?: string;
            /** @description 可选。默认 1024 */
            max_tokens_per_chunk?: number | string;
            /** @description 可选。默认 0 */
            overlap_tokens?: number | string;
        };
        MemoryCollectionDetails: components["schemas"]["MemoryCollection"] & {
            /** @description Whether the effective embedding model (collection model, otherwise app default) is available to this app, with an app default configured. Checks embedding capability, app access, owner group, and enabled channels/abilities; does not probe upstream health. */
            embedding_model_available: boolean;
            /** @description Embedding synchronization counts for this app and collection's non-deleted contents, including disabled contents; independent of model availability. */
            content_sync: {
                /**
                 * @description Overall synchronization state; error takes precedence if any content has failed.
                 * @enum {string}
                 */
                status: "empty" | "syncing" | "synced" | "error";
                total: number;
                pending: number;
                processing: number;
                completed: number;
                /** @description Failed content count. GET /memories/{id}/failures returns the paginated failed content IDs and redacted reasons. */
                error: number;
            };
        };
        MemoryCollectionRebuildResponse: {
            /** @enum {boolean} */
            success: true;
            /** @description Number of non-deleted contents queued for embedding; acceptance does not mean embedding has completed. */
            requeued: number;
        };
        MemoryCollectionRebuildRequest: {
            /** @description Optional model override; defaults to the collection model, then app default. The same model can be rebuilt. */
            embedding_model?: string;
        };
        MemoryCollectionFailures: {
            collection_id: string;
            /** @description Total failed, non-deleted contents, including disabled contents; not just the current page. */
            total: number;
            page: number;
            page_size: number;
            contents: {
                id: string;
                /** @enum {string} */
                embedding_status: "error";
                updated_at: string | null;
                /** @description Latest applicable embedding job feedback. message is redacted and may be null when no current failure reason is available. Successful contents are never listed. */
                embedding_feedback: {
                    /** @enum {string} */
                    status: "retrying" | "failed";
                    /** @enum {string} */
                    kind: "model_unavailable" | "timeout" | "rate_limit" | "authentication" | "upstream" | "unknown";
                    message: string | null;
                    retry_count: number;
                    max_retries: number;
                } | null;
            }[];
        };
        MemoryCollectionUpdateRequest: {
            /** @description 必填。缺失时返回 400 `{"error":"name is required"}` */
            name?: string;
            /** @description 可选。不传时落库为 null */
            description?: string | null;
            /**
             * @description 必填。缺失时返回 400 `{"error":"status is required"}`
             * @enum {string}
             */
            status?: "enabled" | "disabled" | "deleted";
        };
        MemoryContent: {
            id: string;
            collection_id: string;
            app_id: string;
            external_user_id?: string;
            external_username?: string;
            key?: string | null;
            attrs?: {
                [key: string]: unknown;
            } | null;
            /**
             * @description Content status
             * @enum {string}
             */
            status: "enabled" | "disabled" | "deleted";
            /**
             * @description Embedding processing status
             * @enum {string}
             */
            embedding_status: "error" | "pending" | "processing" | "completed";
            metadata: {
                [key: string]: unknown;
            };
            /**
             * @description Content type
             * @enum {string}
             */
            content_type: "text" | "markdown";
            content: string;
            created_at: string;
            updated_at?: string | null;
            /** @description Present on embedding search results only */
            similarity?: number;
        };
        MemoryContentsFilterRequest: {
            /** @description Attribute filters with operators: $gt/$gte/$lt/$lte/$ne/$in/$nin/$contains/$startsWith/$endsWith/$regex/$exists */
            attrs?: {
                [key: string]: unknown;
            };
            /**
             * @description Filter by content type (exact match)
             * @enum {string}
             */
            content_type?: "text" | "markdown";
            /** @description Case-insensitive keyword search within content */
            content_keywords?: string;
        };
        MemoryContentActionResponse: {
            success: boolean;
            message: string;
            content_id?: string;
        };
        MemoryContentRequest: {
            /** @description 必填。缺失时返回 400 `{"error":"content is required"}` */
            content?: string;
            /**
             * @description 可选。默认 `text`
             * @enum {string}
             */
            content_type?: "text" | "markdown";
            /** @description 可选。提供时按 key 做 upsert: 同 key 内容已存在则更新 */
            key?: string | null;
            /** @description 可选。内容属性, 可用于高级过滤 */
            attrs?: {
                [key: string]: unknown;
            } | null;
        };
        MemoryBatchCreateResponse: {
            success: boolean;
            message: string;
            content_ids: string[];
        };
        MemoryContentBatchRequest: {
            /** @description 必填。1 到 500 项; 非数组/空数组/超过 500 项分别返回 400 */
            contents?: components["schemas"]["MemoryContentRequest"][];
        };
        MemoryContentChunk: {
            id: string;
            content: string;
            payload: {
                [key: string]: unknown;
            };
        };
        MemorySearchChunk: {
            collection_id: string;
            content_id: string;
            /** @enum {string} */
            content_type: "text" | "markdown";
            content_key: string | null;
            content_attrs: {
                [key: string]: unknown;
            };
            chunk_id: string;
            chunk_index: number;
            chunk_content: string;
            similarity: number;
        };
        MemorySearchRequest: {
            /** @description 必填。检索文本, 缺失时返回 400 `{"error":"query is required"}` */
            query?: string;
            /** @description 可选。最低相似度, 默认 0.7 */
            min_similarity?: number | string;
            /** @description 可选。返回条数, 默认 10 */
            limit?: number | string;
            /** @description 可选。支持 `content_type`、`content_keywords`、`attrs` */
            content_filter?: {
                [key: string]: unknown;
            };
        };
        EmbeddingQueueStats: {
            pending: number;
            processing: number;
            completed: number;
            failed: number;
            cancelled: number;
            total: number;
            byTarget: {
                memory: {
                    pending: number;
                    processing: number;
                    completed: number;
                    failed: number;
                    cancelled: number;
                };
                qa: {
                    pending: number;
                    processing: number;
                    completed: number;
                    failed: number;
                    cancelled: number;
                };
            };
        };
        EmbeddingWorkerStatus: {
            isRunning: boolean;
            isStopping: boolean;
            pollIntervalMs: number;
        };
        EmbeddingQueueStatusResponse: {
            queue: components["schemas"]["EmbeddingQueueStats"];
            worker: components["schemas"]["EmbeddingWorkerStatus"];
        };
        EmbeddingJob: {
            id: string;
            app_id: string;
            /** @enum {string} */
            target_type: "memory" | "qa";
            target_id: string;
            /** @enum {string} */
            action: "embed" | "delete";
            /** @enum {string} */
            status: "pending" | "processing" | "completed" | "failed" | "cancelled";
            priority: number;
            retry_count: number;
            max_retries: number;
            payload: {
                [key: string]: unknown;
            } | null;
            error_message: string | null;
            started_at: string | null;
            completed_at: string | null;
            created_at: string;
            updated_at: string | null;
        };
        QAPair: {
            /** @description QA pair id */
            id: string;
            /** @description Owning app id */
            app_id: string;
            /** @description Main question */
            question: string;
            /** @description Answer content */
            answer: string;
            /** @description Alternative phrasings used to improve match rate */
            additional_questions: string[];
            /** @description Custom attributes for categorization and filtering */
            attrs?: {
                [key: string]: unknown;
            } | null;
            /** @description Caller-defined unique key enabling upsert */
            key?: string | null;
            /** @description Embedding model used for this pair */
            embedding_model?: string | null;
            /**
             * @description QA pair status
             * @enum {string}
             */
            status: "enabled" | "disabled" | "deleted";
            /** @description Creation timestamp */
            created_at: string;
            /** @description Last update timestamp */
            updated_at?: string | null;
        };
        QAError: {
            /** @description Error message */
            error: string;
        };
        QAPairCreateRequest: {
            /** @description 必填。主问题 */
            question?: string;
            /** @description 必填。答案内容 */
            answer?: string;
            /** @description 可选。同义问法, 用于提升命中率 */
            additional_questions?: string[];
            /** @description 可选。自定义属性, 用于分类与过滤 */
            attrs?: {
                [key: string]: unknown;
            } | null;
            /** @description 可选。提供时按 key 做 upsert */
            key?: string | null;
            /** @description 可选。不传时使用应用默认向量模型 */
            embedding_model?: string | null;
        };
        QAPairUpdateRequest: {
            /** @description 必填。主问题 */
            question?: string;
            /** @description 必填。答案内容 */
            answer?: string;
            additional_questions?: string[];
            attrs?: {
                [key: string]: unknown;
            } | null;
            /**
             * @description 可选。默认 enabled
             * @enum {string}
             */
            status?: "enabled" | "disabled" | "deleted";
            embedding_model?: string | null;
        };
        QADeleteResponse: {
            /** @description Whether the pair was deleted */
            success: boolean;
        };
        QABatchDeleteResponse: {
            /** @description Number of QA pairs deleted */
            deleted_count: number;
            /** @description Ids of the deleted pairs */
            deleted_ids: string[];
        };
        QABatchDeleteRequest: {
            /** @description 按 id 删除 */
            ids?: string[];
            /** @description 按 key 删除 */
            keys?: string[];
            /** @description 按属性等值匹配删除; 多个属性之间为 OR, 不支持比较操作符 */
            attrs_filter?: {
                [key: string]: unknown;
            };
        };
        QAMatchResult: {
            /** @description QA pair id */
            id: string;
            /** @description Main question of the matched pair */
            question: string;
            /** @description Answer content */
            answer: string;
            /** @description Custom attributes of the matched pair */
            attrs?: {
                [key: string]: unknown;
            } | null;
            /** @description Which question (main or additional) was matched */
            matched_question: string;
            /** @description Similarity score of the match */
            similarity: number;
        };
        QASearchRequest: {
            /** @description 必填。检索文本 */
            query?: string;
            /** @description 可选。默认 0.7 */
            min_similarity?: number | string;
            /** @description 可选。默认 10 */
            limit?: number | string;
            /** @description 可选。属性过滤, 支持比较操作符 */
            attrs?: {
                [key: string]: unknown;
            };
            embedding_model?: string | null;
        };
        QANoMatch: {
            /** @description Error message */
            error: string;
            /** @description Always null: no pair matched */
            match: null;
        };
        FileExtractResponse: {
            /** @description Extracted text content, sanitized for UTF-8 storage */
            content: string;
            /** @description Parser-specific metadata; structure varies by file type (pdf / excel / word / json / yaml / html / text) */
            metadata?: {
                [key: string]: unknown;
            };
        };
        FileExtractError: {
            error: string;
        };
        FileExtractRequest: {
            /**
             * Format: binary
             * @description 必填。待解析的文件（multipart/form-data 的 `file` 字段）; 缺失时返回 400
             */
            file?: string;
        };
        /** @description Resolved agent summary (present on get/create) */
        ConversationAgent: {
            id: string;
            name: string;
            type?: string;
            is_default?: boolean;
            status?: string;
            config?: {
                [key: string]: unknown;
            };
        };
        ConversationSettings: {
            /** @description Model id used by this conversation */
            model: string;
            /** @description Sampling temperature */
            temperature: number;
            /** @description Maximum completion tokens */
            max_tokens: number;
            /** @description Nucleus sampling parameter */
            top_p: number;
            /** @description Frequency penalty */
            frequency_penalty: number;
            /** @description Presence penalty */
            presence_penalty: number;
            /** @description System prompt */
            prompt: string | null;
            /** @description Number of history messages included in context (default 10) */
            history_messages_count: number;
        };
        ConversationReferenceSettings: {
            memories?: {
                collections?: string[];
                content_filter?: {
                    [key: string]: unknown;
                };
                min_similarity?: number;
                limit?: number;
                unmatch_message?: string | null;
            };
            qa?: {
                enabled: boolean;
                min_similarity?: number;
                attrs_filter?: {
                    [key: string]: unknown;
                };
                unmatch_message?: string | null;
            };
        };
        ChatConversation: {
            /** @description Conversation id */
            id: string;
            app_id: string;
            /** @description Agent (assistant) id this conversation belongs to */
            agent_id: string;
            agent?: components["schemas"]["ConversationAgent"];
            external_user_id: string;
            external_username?: string;
            title: string;
            description?: string;
            settings: components["schemas"]["ConversationSettings"];
            reference_settings: components["schemas"]["ConversationReferenceSettings"];
            metadata: {
                [key: string]: unknown;
            };
            custom_data: {
                [key: string]: unknown;
            };
            skill_ids?: string[] | null;
            category?: string;
            /**
             * @description Conversation status
             * @enum {string}
             */
            status: "active" | "archived" | "deleted" | "suspended";
            created_at: string;
            updated_at: string;
            context_reset_message_id?: string | null;
        };
        ChatError: {
            /** @description Error message */
            error: string;
        };
        ConversationCreateRequest: {
            /** @description 会话标题; 不传时使用默认标题 */
            title?: string | null;
            settings?: components["schemas"]["ConversationSettings"] & unknown;
            reference_settings?: components["schemas"]["ConversationReferenceSettings"] & unknown;
            /** @description 业务元数据, 原样存储并随会话返回 */
            custom_data?: {
                [key: string]: unknown;
            } | null;
            /** @description 会话分类, 默认 `chat` */
            category?: string;
            /** @description 关联的智能体 id; 不传时使用应用默认智能体 */
            agent_id?: string;
        };
        MessageActionResponse: {
            /** @description Result message */
            message: string;
        };
        ConversationUpdateRequest: {
            title?: string | null;
            custom_data?: {
                [key: string]: unknown;
            } | null;
        };
        ChatMessageResult: {
            content?: string | null;
            model?: string;
            finish_reason?: string | null;
            /** @description 仅当模型决定调用工具时出现（schema-only 模式或 runtime 透传） */
            tool_calls?: {
                [key: string]: unknown;
            }[];
            usage?: {
                [key: string]: unknown;
            } | null;
            execution_summary?: {
                [key: string]: unknown;
            } | null;
        };
        ChatMessageCreateRequest: {
            /** @description 用户消息文本; 与 attachments / messages 至少提供一个 */
            content?: string | null;
            /** @description 附件数组, 例如 `{ type: "image", url: "..." }` */
            attachments?: {
                [key: string]: unknown;
            }[];
            /** @description 是否流式返回, 默认 true */
            stream?: boolean;
            /** @description 指定本次调用挂载的技能 id; 未挂载到该会话的智能体上时返回 404 */
            skill_id?: string;
            /** @description OpenAI 格式的 tool 定义数组 */
            tools?: {
                [key: string]: unknown;
            }[];
            /** @description `runtime-execute` 模式下传了 tools 时必填: 工具名到执行方式的绑定 */
            tool_bindings?: {
                [key: string]: unknown;
            };
            /**
             * @description 默认 runtime-execute; 未显式指定且只传了 tools 时自动降级为 schema-only
             * @enum {string}
             */
            tool_execution_mode?: "runtime-execute" | "schema-only" | "runtime-orchestrate";
            /** @description 追加到上下文的 OpenAI 格式消息 */
            messages?: {
                [key: string]: unknown;
            }[];
            custom_data?: {
                [key: string]: unknown;
            } | null;
            /** @description 仅 POST /chat/conversation: 续接已有会话; 不传则自动创建 */
            conversation_id?: string;
            /** @description 自动创建会话时的标题 */
            title?: string | null;
            settings?: components["schemas"]["ConversationSettings"];
            reference_settings?: components["schemas"]["ConversationReferenceSettings"];
            category?: string;
            agent_id?: string;
        };
        ChatMessage: {
            /** @description Message id */
            id: string;
            conversation_id: string;
            app_id: string;
            external_user_id: string;
            parent_id?: string | null;
            /**
             * @description Message role
             * @enum {string}
             */
            role: "user" | "assistant" | "system" | "tool";
            content: string;
            /** @description 内容类型, 例如 markdown / text / html / json */
            content_type?: string;
            metadata: {
                [key: string]: unknown;
            };
            custom_data: {
                [key: string]: unknown;
            };
            attachments: {
                [key: string]: unknown;
            }[];
            /** @description 多模态内容分片 */
            content_parts?: {
                [key: string]: unknown;
            }[];
            /** @description 本次执行的耗时 / 工具 / 引用统计, 由运行时写入 */
            execution_summary?: {
                [key: string]: unknown;
            } | null;
            /** @description 上游模型原始响应 */
            ai_response?: {
                [key: string]: unknown;
            };
            /** @enum {string} */
            status?: "pending" | "sending" | "sent" | "failed" | "deleted" | "moderated";
            created_at?: string;
            updated_at?: string | null;
        };
        GeneratedTitleResponse: {
            /** @description Generated conversation title */
            title: string;
        };
        SettingsModel: {
            /** @description Model record id in llm_models */
            id: number;
            /** @description Model identifier, also used as the upstream model name */
            model_id: string;
            /** @description Display name */
            name: string;
            /**
             * @description Model capability type: 'chat' or 'embeddings'; null when unset
             * @enum {string|null}
             */
            model_type: "chat" | "embeddings" | null;
            /** @description Creation timestamp */
            created_at: string;
        };
        SettingsError: {
            /** @description Error message */
            error: string;
        };
        CreateSettingsModelRequest: {
            /** @description Model identifier. Must match the real upstream model name and only contain letters, digits, '.', '_', ':' and '-' */
            model_id: string;
            /** @description Display name; defaults to model_id */
            name?: string;
            /**
             * @description Channel type; only 'openai' is supported (default)
             * @enum {string}
             */
            channel_type?: "openai";
            /**
             * @description Model capability type: 'chat' (default) or 'embeddings'. Use 'embeddings' for embedding models so the embedding capability config is applied
             * @enum {string}
             */
            model_type?: "chat" | "embeddings";
            /** @description Upstream OpenAI-compatible base URL; public internet addresses only */
            base_url: string;
            /** @description Upstream API key; stored encrypted and never returned in plaintext */
            api_key: string;
        };
        UpdateSettingsModelRequest: {
            /** @description Model capabilities, e.g. text.chat / text.embeddings */
            capabilities?: string[];
            /** @description Model features, e.g. chat / reasoning / function-calling */
            features?: string[];
            chat_features?: {
                /** @enum {string} */
                function_calling?: "supported" | "unsupported" | "unknown";
            };
        };
        ModelTestProbe: {
            ok: boolean;
            /**
             * @description Failure class; null on success. 'network' = unreachable or timed out, 'auth' = upstream rejected the key, 'model_not_found' = the upstream has no such model, 'upstream' = any other upstream error, including a probe that could not be sent at all.
             * @enum {string|null}
             */
            kind: "network" | "auth" | "model_not_found" | "upstream" | null;
            /** @description Round-trip latency; 0 when the request was never sent */
            latency_ms: number;
            /** @description Upstream HTTP status; 0 for network-level failures and for probes that were never sent. Named http_status rather than status to stay distinct from the aggregate status field. */
            http_status: number;
            /** @description Upstream error text, or 'OK'. Safe to show; never contains the key. */
            message: string;
        };
        ModelTestResult: {
            /** @description The identifier exactly as it appeared in the request, echoed so results can be matched by index. */
            requested: string;
            /** @description Resolved model id, or null when the request carried an empty identifier. */
            model: string | null;
            /**
             * @description Capability the probe was resolved against; null when the model has no probeable capability. Determines the upstream path: text.chat via /chat/completions (or /responses when the model declares Native Responses API), text.embeddings via /embeddings.
             * @enum {string|null}
             */
            capability: "text.chat" | "text.embeddings" | "image.generate" | "image.edit" | "image.variation" | "audio.transcribe" | "audio.translate" | "audio.speech" | null;
            /**
             * @description Authorization state, checked before any billable request. 'ok' = the app may call this model; 'not_configured' = the request carried an empty model id; 'model_not_found' = no such model exists; 'unauthorized' = no enabled ability for the app owner's user group, no enabled channel, or the model is not available to this app. A non-'ok' value short-circuits: no upstream request is sent and charged_calls is not incremented.
             * @enum {string}
             */
            access: "ok" | "not_configured" | "unauthorized" | "model_not_found";
            /** @description Upstream connectivity result, or null when not probed (short-circuited by a non-'ok' access). Deliberately carries no upstream URL: this is an app-facing API, and the probed channel may be a platform-owned one whose base_url the app cannot read through GET /channels. Diagnose from kind, http_status and message instead. */
            probe: components["schemas"]["ModelTestProbe"] | null;
        };
        TestSettingsModelsResponse: {
            /**
             * @description Aggregate verdict. 'unhealthy' = at least one model is unauthorized, missing or empty; 'degraded' = all are authorized but at least one probe failed or could not be sent; 'healthy' = every probe succeeded.
             * @enum {string}
             */
            status: "healthy" | "degraded" | "unhealthy";
            /** @description Number of billable upstream requests this call actually issued. 0 when every entry short-circuited. */
            charged_calls: number;
            /** @description One entry per requested id, in request order. */
            results: components["schemas"]["ModelTestResult"][];
        };
        TestSettingsModelsRequest: {
            /** @description Model ids to test, 1 to 20 entries. Results come back in the same order. Each id must be a model this app may call; ids the app has no access to are reported as unauthorized rather than rejected, so a bulk check stays diagnosable. */
            models: string[];
        };
        SettingsChannel: {
            /** @description Channel id */
            id: number;
            /** @description Channel type; 1 = OpenAI compatible */
            type: number;
            /** @description Channel display name */
            name: string | null;
            /** @description Upstream base URL */
            base_url: string | null;
            /** @description Model ids bound to this channel */
            models: string[];
            /** @description Whether the channel is enabled */
            enabled: boolean;
            /** @description Masked API key; plaintext is never returned */
            key: string;
            /** @description Creation timestamp */
            created_at: string;
        };
        UpdateSettingsChannelRequest: {
            /** @description New upstream base URL */
            base_url?: string;
            /** @description New upstream API key */
            api_key?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
