/**
 * Application Configuration
 *
 * This file centralizes all configuration settings for the GameDin application.
 * It handles different environments (development, staging, production),
 * feature flags, API endpoints, and global application settings.
 *
 * Using this centralized approach makes it easier to:
 * - Manage environment-specific configurations
 * - Toggle features on/off
 * - Change API endpoints without modifying code
 * - Maintain consistent timeout and cache durations
 */
declare const FEATURES: {
    OFFLINE_MODE: boolean;
    PWA_ENABLED: boolean;
    ANALYTICS: boolean;
    OAUTH_GOOGLE: boolean;
    OAUTH_DISCORD: boolean;
    OAUTH_FACEBOOK: boolean;
    AI_RECOMMENDATIONS: boolean;
    REAL_TIME_CHAT: boolean;
    GAME_SESSIONS: boolean;
    NOTIFICATIONS: boolean;
    EXPERIMENTAL_VOICE_CHAT: boolean;
    EXPERIMENTAL_GROUP_EVENTS: boolean;
};
declare const THEME: {
    COLORS: {
        PRIMARY: string;
        SECONDARY: string;
        BACKGROUND: string;
        SURFACE: string;
        ERROR: string;
        SUCCESS: string;
        WARNING: string;
        INFO: string;
        TEXT_PRIMARY: string;
        TEXT_SECONDARY: string;
    };
    ANIMATION: {
        FAST: number;
        NORMAL: number;
        SLOW: number;
    };
    BREAKPOINTS: {
        XS: number;
        SM: number;
        MD: number;
        LG: number;
        XL: number;
    };
};
export declare const config: {
    ENV: {
        DEV: boolean;
        STAGING: boolean;
        PROD: boolean;
    };
    apiBaseUrl: string;
    wsUrl: string;
    FEATURES: {
        OFFLINE_MODE: boolean;
        PWA_ENABLED: boolean;
        ANALYTICS: boolean;
        OAUTH_GOOGLE: boolean;
        OAUTH_DISCORD: boolean;
        OAUTH_FACEBOOK: boolean;
        AI_RECOMMENDATIONS: boolean;
        REAL_TIME_CHAT: boolean;
        GAME_SESSIONS: boolean;
        NOTIFICATIONS: boolean;
        EXPERIMENTAL_VOICE_CHAT: boolean;
        EXPERIMENTAL_GROUP_EVENTS: boolean;
    };
    PERFORMANCE: {
        CACHE_DURATION: {
            USER_PROFILE: number;
            GAME_DATA: number;
            MESSAGES: number;
            SEARCH_RESULTS: number;
        };
        TIMEOUTS: {
            DEFAULT: number;
            LONG: number;
            FILE_UPLOAD: number;
        };
        POLLING: {
            NOTIFICATIONS: number;
            ONLINE_STATUS: number;
        };
        RATE_LIMITS: {
            MESSAGE_SEND: number;
            SEARCH_REQUESTS: number;
            API_REQUESTS: number;
        };
    };
    THEME: {
        COLORS: {
            PRIMARY: string;
            SECONDARY: string;
            BACKGROUND: string;
            SURFACE: string;
            ERROR: string;
            SUCCESS: string;
            WARNING: string;
            INFO: string;
            TEXT_PRIMARY: string;
            TEXT_SECONDARY: string;
        };
        ANIMATION: {
            FAST: number;
            NORMAL: number;
            SLOW: number;
        };
        BREAKPOINTS: {
            XS: number;
            SM: number;
            MD: number;
            LG: number;
            XL: number;
        };
    };
    AUTH: {
        TOKEN_REFRESH_BEFORE_EXPIRY: number;
        SESSION_TIMEOUT: number;
        MAX_LOGIN_ATTEMPTS: number;
        LOCKOUT_DURATION: number;
    };
    VALIDATION: {
        USERNAME: {
            MIN_LENGTH: number;
            MAX_LENGTH: number;
            PATTERN: RegExp;
        };
        PASSWORD: {
            MIN_LENGTH: number;
            REQUIRE_LOWERCASE: boolean;
            REQUIRE_UPPERCASE: boolean;
            REQUIRE_NUMBER: boolean;
            REQUIRE_SPECIAL: boolean;
        };
        MESSAGE: {
            MAX_LENGTH: number;
        };
        GAME_SESSION: {
            TITLE_MAX_LENGTH: number;
            DESCRIPTION_MAX_LENGTH: number;
        };
    };
    APP_META: {
        NAME: string;
        VERSION: string;
        COPYRIGHT: string;
        CONTACT_EMAIL: string;
        SOCIAL: {
            TWITTER: string;
            DISCORD: string;
            INSTAGRAM: string;
        };
    };
    INDEXED_DB: {
        VERSION: number;
        NAME: string;
        MAX_AGE: {
            DEFAULT: number;
            USER_DATA: number;
            MESSAGES: number;
        };
    };
    isFeatureEnabled: (featureName: keyof typeof FEATURES) => boolean;
    getThemeValue: (category: keyof typeof THEME, value: string) => any;
    getEnvValue: <T>(devValue: T, stagingValue: T, prodValue: T) => T;
};
export default config;
//# sourceMappingURL=config.d.ts.map