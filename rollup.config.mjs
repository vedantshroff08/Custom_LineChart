import json from "@rollup/plugin-json";

export default commandLineArgs => {
    const defaultConfig = commandLineArgs.configDefaultConfig;
    return defaultConfig.map(config => ({
        ...config,
        plugins: [json(), ...(config.plugins || [])]
    }));
};
