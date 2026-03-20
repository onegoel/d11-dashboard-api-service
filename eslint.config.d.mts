import tsparser from "@typescript-eslint/parser";
declare const _default: ({
    ignores: string[];
    files?: never;
    languageOptions?: never;
    plugins?: never;
    rules?: never;
} | {
    files: string[];
    languageOptions: {
        parser: typeof tsparser;
        sourceType: string;
    };
    plugins: {
        "@typescript-eslint": {
            configs: Record<string, import("@typescript-eslint/utils/ts-eslint").ClassicConfig.Config>;
            meta: import("@typescript-eslint/utils/ts-eslint").FlatConfig.PluginMeta;
            rules: typeof import("@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules");
        };
    };
    rules: {
        "@typescript-eslint/no-unused-vars": string;
        semi: string[];
        quotes: string[];
    };
    ignores?: never;
})[];
export default _default;
//# sourceMappingURL=eslint.config.d.mts.map