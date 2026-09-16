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
         * @description Return all agents available under the current integration.
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
                                integration_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and executor are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "executor";
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
         * @description Create a new agent definition with business fields and prompts. If the new agent is the only agent under the integration, it will still become the default agent. Optionally provide `skills` to mount multiple existing skills during creation.
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
                        type?: "system" | "custom" | "executor";
                        /**
                         * @description Whether to set this agent as the default agent. Defaults to false. If this is the only agent under the integration, it will still become the default agent.
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
                                integration_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and executor are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "executor";
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
                                integration_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and executor are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "executor";
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
                        type?: "system" | "custom" | "executor";
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
                                integration_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and executor are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "executor";
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
                                integration_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and executor are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "executor";
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
                                integration_id: string;
                                name: string;
                                /**
                                 * @description system is platform-reserved (provisioned by the platform, not user-creatable); custom and executor are user-selectable.
                                 * @enum {string}
                                 */
                                type: "system" | "custom" | "executor";
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
    "/agents/{agent_id}/workspaces/{workspace_id}/executor/AGENTS.md": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get workspace AGENTS.md
         * @description Read the AGENTS.md of the workspace. Returns null when the workspace has not been provisioned yet.
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
                /** @description AGENTS.md content */
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
         * Update workspace AGENTS.md
         * @description Write the AGENTS.md of the workspace. The workspace is provisioned lazily if needed.
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
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/agents/{agent_id}/workspaces": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List workspaces
         * @description List workspaces visible to the current user. Lazily creates the default workspace on first access.
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
                /** @description Coding Workspaces */
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
                                description?: string | null;
                                is_default: boolean;
                                /** @enum {string} */
                                status: "active" | "deleted";
                                custom_data: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                                updated_at: string;
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
                /** @description Agent not found */
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
         * Create a workspace
         * @description Create a development workspace under an executor agent. One agent can have multiple workspaces (per user).
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
                        /** @description Workspace name (label only; duplicates allowed). */
                        name: string;
                        description?: string | null;
                        /** @description Arbitrary caller-defined metadata stored and returned as-is. */
                        custom_data?: {
                            [key: string]: unknown;
                        };
                        /** @description Initial repository set for the workspace; can be modified later via the repos API. */
                        repositories?: {
                            repo_key: string;
                            /** @description Git remote URL to clone into the workspace. */
                            url: string;
                            /**
                             * @description Branch to clone; defaults to main.
                             * @default main
                             */
                            default_branch?: string;
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
                            description?: string | null;
                            is_default: boolean;
                            /** @enum {string} */
                            status: "active" | "deleted";
                            custom_data: {
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
                            error: string;
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
    "/agents/{agent_id}/workspaces/{workspace_id}": {
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
                            description?: string | null;
                            is_default: boolean;
                            /** @enum {string} */
                            status: "active" | "deleted";
                            custom_data: {
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
                            error: string;
                        };
                    };
                };
                /** @description Workspace not found */
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
         * Delete a workspace
         * @description Deletion is rejected while sessions are still bound to the workspace.
         */
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
                            deleted: boolean;
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
                /** @description Workspace not found */
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
        /** Update a workspace */
        patch: {
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
                        /** @description Merged into the existing custom_data; pass null to clear it. */
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
                            description?: string | null;
                            is_default: boolean;
                            /** @enum {string} */
                            status: "active" | "deleted";
                            custom_data: {
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
                            error: string;
                        };
                    };
                };
                /** @description Workspace not found */
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
    "/agents/{agent_id}/executor/public-key": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get the current user's public key
         * @description Return the public key of the current user on the agent's executor machine (one key per user per machine, shared by all the user's workspaces/repositories). The key is public material; the owner (ak-* or ek-*) can read it.
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
                /** @description Forbidden */
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
                /** @description Agent not found */
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
    "/agents/{agent_id}/executor/rotate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rotate the current user's public key
         * @description Generate a new keypair for the current user and return the new public key. Rotation only affects this user's repositories (they switch to the new key until deploy keys are updated); the owner can rotate their own key.
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
            requestBody?: never;
            responses: {
                /** @description Rotated */
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
                /** @description Forbidden */
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
                /** @description Agent not found */
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
                                integration_id: string;
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
                                /**
                                 * @description Effective coding provider resolved for this session (explicit session value or global default).
                                 * @enum {string}
                                 */
                                executor_provider?: "claude" | "codex" | "opencode";
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
         * @description Create a new conversation session under the specified agent. The optional `skills` field is a session-level skill_id selection: omit it or set it to null to inherit all skills mounted on the agent; set it to [] to explicitly disable all skills for this session; set it to [skill_id...] to use exactly those active skills for this session. Session-selected skills may include any active skill under the integration and do not need to be mounted on the agent.
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
                        /** @description Executor agents only: bind the session to a development workspace by its uuid id (workspaces.id). The workspace must belong to this agent and be visible to the current user, otherwise the request is rejected. The binding is persisted as custom_data.workspace_id and all subsequent turns run inside that workspace. When omitted, the session falls back to the (agent, user) default workspace (lazily created). PI custom agents ignore this field (they do not participate in coding). */
                        workspace_id?: string;
                        /**
                         * @description Session-level coding provider for executor agents. When omitted, Dathor resolves the provider from the global ZAI_EXECUTOR_PROVIDER default and persists it on the session, so a coding session always has a provider.
                         * @enum {string}
                         */
                        executor_provider?: "claude" | "codex" | "opencode";
                        /** @description Optional model id for this session. It overrides the integration default chat model and is persisted as the session model. */
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
                        /** @description Optional session-level skill_id list. Omit or set null to inherit all skills mounted on the agent. Set [] to disable all skills for this session. Set [skill_id...] to use exactly those active skills, which may include any active skill under the integration. */
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
                                integration_id: string;
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
                                /**
                                 * @description Effective coding provider resolved for this session (explicit session value or global default).
                                 * @enum {string}
                                 */
                                executor_provider?: "claude" | "codex" | "opencode";
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
                                    integration_id: string;
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
                                integration_id: string;
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
                                integration_id: string;
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
    "/agents/{agent_id}/workspaces/{workspace_id}/repos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List repositories
         * @description List repositories of a workspace.
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
                /** @description List repositories */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            repositories: {
                                id: string;
                                integration_id: string;
                                agent_id: string;
                                external_user_id: string;
                                repo_key: string;
                                name: string;
                                description?: string | null;
                                /** @enum {string} */
                                status: "provisioning" | "ready" | "failed" | "deleted";
                                default_branch: string;
                                relative_path: string;
                                git_initialized: boolean;
                                initial_commit_sha?: string | null;
                                is_default: boolean;
                                /** @enum {string} */
                                source_type: "empty" | "inline_files" | "git_remote";
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                                updated_at: string;
                                last_used_at?: string | null;
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
            };
        };
        put?: never;
        /**
         * Create repository
         * @description Create a working repository inside a workspace.
         */
        post: {
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
                        default_branch?: string;
                        /** @description Git remote URL. When provided the repository is created as `git_remote` and cloned into the ZAI executor workspace. For `git_remote` repositories `initialize_git` and `initial_commit` are ignored; cloning and git setup are handled by the ZAI Executor Service. */
                        url?: string;
                        /**
                         * @description Whether to run `git init` inside the repository directory. Defaults to true; set to false to create a plain directory without git. Ignored for `git_remote` repositories, which are always managed as git working copies.
                         * @default true
                         */
                        initialize_git?: boolean;
                        /**
                         * @description Whether to stage template files and create the first commit (`Initial commit`) after git initialization. Defaults to false; requires initialize_git=true, otherwise the request fails with 'Initial commit requires git initialization'. Ignored for `git_remote` repositories.
                         * @default false
                         */
                        initial_commit?: boolean;
                        set_as_default?: boolean;
                        template?: {
                            /** @enum {string} */
                            type?: "empty" | "inline_files" | "git_remote";
                            files?: {
                                path: string;
                                content: string;
                            }[];
                        };
                        metadata?: {
                            [key: string]: unknown;
                        };
                        custom_data?: {
                            [key: string]: unknown;
                        };
                    };
                };
            };
            responses: {
                /** @description Create repository */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            repository: {
                                id: string;
                                integration_id: string;
                                agent_id: string;
                                external_user_id: string;
                                repo_key: string;
                                name: string;
                                description?: string | null;
                                /** @enum {string} */
                                status: "provisioning" | "ready" | "failed" | "deleted";
                                default_branch: string;
                                relative_path: string;
                                git_initialized: boolean;
                                initial_commit_sha?: string | null;
                                is_default: boolean;
                                /** @enum {string} */
                                source_type: "empty" | "inline_files" | "git_remote";
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                                updated_at: string;
                                last_used_at?: string | null;
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
    "/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get repository
         * @description Get repository details by repository id.
         */
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
                /** @description Get repository */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            repository: {
                                id: string;
                                integration_id: string;
                                agent_id: string;
                                external_user_id: string;
                                repo_key: string;
                                name: string;
                                description?: string | null;
                                /** @enum {string} */
                                status: "provisioning" | "ready" | "failed" | "deleted";
                                default_branch: string;
                                relative_path: string;
                                git_initialized: boolean;
                                initial_commit_sha?: string | null;
                                is_default: boolean;
                                /** @enum {string} */
                                source_type: "empty" | "inline_files" | "git_remote";
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                                updated_at: string;
                                last_used_at?: string | null;
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
        /**
         * Delete repository
         * @description Delete a repository by id. This also removes its local working copy.
         */
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
                /** @description Delete repository */
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
        /**
         * Update repository
         * @description Update repository custom_data. Values are merged into the existing custom_data.
         */
        patch: {
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
            requestBody?: {
                content: {
                    "application/json": {
                        /** @description Merged into the existing custom_data; pass null to clear it. */
                        custom_data?: {
                            [key: string]: unknown;
                        } | null;
                    };
                };
            };
            responses: {
                /** @description Updated repository */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            repository: {
                                id: string;
                                integration_id: string;
                                agent_id: string;
                                external_user_id: string;
                                repo_key: string;
                                name: string;
                                description?: string | null;
                                /** @enum {string} */
                                status: "provisioning" | "ready" | "failed" | "deleted";
                                default_branch: string;
                                relative_path: string;
                                git_initialized: boolean;
                                initial_commit_sha?: string | null;
                                is_default: boolean;
                                /** @enum {string} */
                                source_type: "empty" | "inline_files" | "git_remote";
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                                updated_at: string;
                                last_used_at?: string | null;
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
                /** @description Repository not found */
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
    "/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List repository files
         * @description List all files and directories inside the repository recursively.
         */
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
                /** @description Repository file tree */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            repository: {
                                id: string;
                                integration_id: string;
                                agent_id: string;
                                external_user_id: string;
                                repo_key: string;
                                name: string;
                                description?: string | null;
                                /** @enum {string} */
                                status: "provisioning" | "ready" | "failed" | "deleted";
                                default_branch: string;
                                relative_path: string;
                                git_initialized: boolean;
                                initial_commit_sha?: string | null;
                                is_default: boolean;
                                /** @enum {string} */
                                source_type: "empty" | "inline_files" | "git_remote";
                                metadata: {
                                    [key: string]: unknown;
                                };
                                custom_data: {
                                    [key: string]: unknown;
                                };
                                created_at: string;
                                updated_at: string;
                                last_used_at?: string | null;
                            };
                            root: {
                                path: string;
                                name: string;
                                /** @enum {string} */
                                type: "file" | "directory";
                                size?: number;
                                mime_type?: string;
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
    "/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}/files/content": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read repository file
         * @description Read a text file from the repository.
         */
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
                /** @description Repository file content */
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
    "/agents/{agent_id}/workspaces/{workspace_id}/repos/{repository_id}/files/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download repository file
         * @description Download a file from the repository.
         */
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
                /** @description Repository file download */
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
    "/models": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List models
         * @description List models currently available to the authenticated integration and external user. Use this before creating or updating a session with a specific model.
         */
        get: {
            parameters: {
                query?: {
                    all?: "true" | "1";
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Available models */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            models: {
                                /** @description Model identifier. */
                                id: string;
                                /** @description OpenAI-compatible object type. */
                                object?: string;
                                /** @description Creation timestamp when provided by the upstream model registry. */
                                created?: number;
                                /** @description Owning provider or account when available. */
                                owned_by?: string;
                                /**
                                 * @description Availability status. Included when requesting historical models with all=true.
                                 * @enum {string}
                                 */
                                status?: "active" | "disabled" | "deleted";
                            }[];
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
                                integration_id: string;
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
                                    runtime?: "pi_coding_agent" | "executor";
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
                                    path: string;
                                    mime_type?: string;
                                    name?: string;
                                } | {
                                    /** @enum {string} */
                                    type: "input_file";
                                    path: string;
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
                        } | {
                            /** @enum {string} */
                            type: "input_image";
                            path: string;
                            mime_type?: string;
                            name?: string;
                        } | {
                            /** @enum {string} */
                            type: "input_file";
                            path: string;
                            mime_type?: string;
                            name?: string;
                        })[];
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
                                runtime?: "pi_coding_agent" | "executor";
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
                                integration_id: string;
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
                                    runtime?: "pi_coding_agent" | "executor";
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
                                    path: string;
                                    mime_type?: string;
                                    name?: string;
                                } | {
                                    /** @enum {string} */
                                    type: "input_file";
                                    path: string;
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
                                integration_id: string;
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
                                /**
                                 * @description Effective coding provider resolved for this session (explicit session value or global default).
                                 * @enum {string}
                                 */
                                executor_provider?: "claude" | "codex" | "opencode";
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
                                integration_id: string;
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
                                /**
                                 * @description Effective coding provider resolved for this session (explicit session value or global default).
                                 * @enum {string}
                                 */
                                executor_provider?: "claude" | "codex" | "opencode";
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
                        /**
                         * @description Change the session-level coding provider. The next turn runs with the new provider; the previous provider's native session is preserved and resumed if you switch back. When omitted the current provider is kept.
                         * @enum {string}
                         */
                        executor_provider?: "claude" | "codex" | "opencode";
                        /** @description Optional session-level skill_id list. Omit to keep the current selection unchanged. Set null to inherit all skills mounted on the agent. Set [] to disable all skills for this session. Set [skill_id...] to use exactly those active skills, which may include any active skill under the integration. */
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
         * @description List all files and directories inside the session working directory recursively.
         */
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
         * @description Upload a file into the session working directory using a required relative target file path.
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
                        /** @description Required relative target file path inside the session working directory, including the final file name. */
                        path: string;
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
                            path: string;
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
         * @description List all skills under the current integration.
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
                            integration_id: string;
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
         * @description Create a skill record under the current integration.
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
                                integration_id: string;
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
                            integration_id: string;
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
                                integration_id: string;
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
                                integration_id: string;
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
                                integration_id: string;
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
                        "application/json": {
                            id: string;
                            integration_id: string;
                            name: string;
                            description?: string | null;
                            embedding_model?: string | null;
                            max_tokens_per_chunk: number;
                            overlap_tokens: number;
                            /** @enum {string} */
                            status: "enabled" | "disabled" | "deleted";
                            metadata: {
                                [key: string]: unknown;
                            };
                            created_at?: string;
                            updated_at?: string | null;
                        }[];
                    };
                };
            };
        };
        put?: never;
        /** Create a memory collection */
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
                        name: string;
                        description?: string | null;
                        embedding_model?: string;
                        max_tokens_per_chunk?: number;
                        overlap_tokens?: number;
                    };
                };
            };
            responses: {
                /** @description Created collection */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            integration_id: string;
                            name: string;
                            description?: string | null;
                            embedding_model?: string | null;
                            max_tokens_per_chunk: number;
                            overlap_tokens: number;
                            /** @enum {string} */
                            status: "enabled" | "disabled" | "deleted";
                            metadata: {
                                [key: string]: unknown;
                            };
                            created_at?: string;
                            updated_at?: string | null;
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
        /** Get a memory collection */
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
                /** @description Memory collection */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            integration_id: string;
                            name: string;
                            description?: string | null;
                            embedding_model?: string | null;
                            max_tokens_per_chunk: number;
                            overlap_tokens: number;
                            /** @enum {string} */
                            status: "enabled" | "disabled" | "deleted";
                            metadata: {
                                [key: string]: unknown;
                            };
                            created_at?: string;
                            updated_at?: string | null;
                        };
                    };
                };
            };
        };
        /** Update a memory collection */
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
                    "application/json": {
                        name: string;
                        description?: string | null;
                        /** @enum {string} */
                        status: "enabled" | "disabled" | "deleted";
                    };
                };
            };
            responses: {
                /** @description Updated collection */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            integration_id: string;
                            name: string;
                            description?: string | null;
                            embedding_model?: string | null;
                            max_tokens_per_chunk: number;
                            overlap_tokens: number;
                            /** @enum {string} */
                            status: "enabled" | "disabled" | "deleted";
                            metadata: {
                                [key: string]: unknown;
                            };
                            created_at?: string;
                            updated_at?: string | null;
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
            };
        };
        post?: never;
        /** Delete a memory collection */
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
                        "application/json": {
                            id: string;
                            integration_id: string;
                            name: string;
                            description?: string | null;
                            embedding_model?: string | null;
                            max_tokens_per_chunk: number;
                            overlap_tokens: number;
                            /** @enum {string} */
                            status: "enabled" | "disabled" | "deleted";
                            metadata: {
                                [key: string]: unknown;
                            };
                            created_at?: string;
                            updated_at?: string | null;
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
                    type?: "text" | "markdown" | "document" | "web_page";
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
                        "application/json": {
                            id: string;
                            collection_id: string;
                            integration_id: string;
                            key?: string | null;
                            attrs?: {
                                [key: string]: unknown;
                            } | null;
                            /** @enum {string} */
                            status: "enabled" | "disabled" | "deleted";
                            /** @enum {string} */
                            embedding_status: "pending" | "processing" | "completed" | "error";
                            metadata: {
                                [key: string]: unknown;
                            };
                            /** @enum {string} */
                            content_type: "text" | "markdown" | "document" | "web_page";
                            content: string;
                            created_at?: string;
                            updated_at?: string | null;
                        }[];
                    };
                };
            };
        };
        put?: never;
        /** Create or update memory content */
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
                    "application/json": {
                        content: string;
                        /** @enum {string} */
                        content_type?: "text" | "markdown" | "document" | "web_page";
                        key?: string | null;
                        attrs?: {
                            [key: string]: unknown;
                        } | null;
                    };
                };
            };
            responses: {
                /** @description Content result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            success: boolean;
                            message: string;
                            content_id?: string;
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
            };
        };
        delete?: never;
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
        /**
         * Create memory contents in batch
         * @description Create up to 500 memory contents and enqueue their embedding jobs in one transaction.
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
                    "application/json": {
                        contents: {
                            content: string;
                            /** @enum {string} */
                            content_type?: "text" | "markdown" | "document" | "web_page";
                            key?: string | null;
                            attrs?: {
                                [key: string]: unknown;
                            } | null;
                        }[];
                    };
                };
            };
            responses: {
                /** @description Batch content result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
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
                        "application/json": {
                            id: string;
                            collection_id: string;
                            integration_id: string;
                            key?: string | null;
                            attrs?: {
                                [key: string]: unknown;
                            } | null;
                            /** @enum {string} */
                            status: "enabled" | "disabled" | "deleted";
                            /** @enum {string} */
                            embedding_status: "pending" | "processing" | "completed" | "error";
                            metadata: {
                                [key: string]: unknown;
                            };
                            /** @enum {string} */
                            content_type: "text" | "markdown" | "document" | "web_page";
                            content: string;
                            created_at?: string;
                            updated_at?: string | null;
                        };
                    };
                };
            };
        };
        /** Update memory content */
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
                    "application/json": {
                        content: string;
                        /** @enum {string} */
                        content_type?: "text" | "markdown" | "document" | "web_page";
                        key?: string | null;
                        attrs?: {
                            [key: string]: unknown;
                        } | null;
                    };
                };
            };
            responses: {
                /** @description Content result */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            success: boolean;
                            message: string;
                            content_id?: string;
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
            };
        };
        post?: never;
        /** Delete memory content */
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
                        "application/json": {
                            success: boolean;
                            message: string;
                            content_id?: string;
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
    "/memories/{id}/contents/{content_id}/chunks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List content chunks */
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
                        "application/json": {
                            id: string;
                            content: string;
                            payload: {
                                [key: string]: unknown;
                            };
                        }[];
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
                    "application/json": {
                        query: string;
                        min_similarity?: number;
                        limit?: number;
                        content_filter?: {
                            [key: string]: unknown;
                        };
                    };
                };
            };
            responses: {
                /** @description Matching chunks */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            content: string;
                            payload: {
                                [key: string]: unknown;
                            };
                        }[];
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
                    "application/json": {
                        query: string;
                        min_similarity?: number;
                        limit?: number;
                        content_filter?: {
                            [key: string]: unknown;
                        };
                    };
                };
            };
            responses: {
                /** @description Matching contents */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            id: string;
                            collection_id: string;
                            integration_id: string;
                            key?: string | null;
                            attrs?: {
                                [key: string]: unknown;
                            } | null;
                            /** @enum {string} */
                            status: "enabled" | "disabled" | "deleted";
                            /** @enum {string} */
                            embedding_status: "pending" | "processing" | "completed" | "error";
                            metadata: {
                                [key: string]: unknown;
                            };
                            /** @enum {string} */
                            content_type: "text" | "markdown" | "document" | "web_page";
                            content: string;
                            created_at?: string;
                            updated_at?: string | null;
                        }[];
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
        /** Get embedding queue status */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Queue status */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            [key: string]: unknown;
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
        /** List content embedding jobs */
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
                        "application/json": {
                            [key: string]: unknown;
                        }[];
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
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
