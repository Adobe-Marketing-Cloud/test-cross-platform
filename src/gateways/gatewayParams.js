const API_URL = "https://saucelabs.com/rest/v1/";

exports.getStartParams = (baseUrl, config) => {
    const apiUrl = `${API_URL}/${config.username}/js-tests`;
    const testsUrl = baseUrl + config.testsPath;

    return {
        url: apiUrl,
        json: true,
        body: {
            platforms: config.platforms,
            url: testsUrl,
            framework: config.framework,
            name: config.name,
            build: config.build,
            idleTimeout: 30
        },
        auth: {
            username: config.username,
            password: config.key
        }
    };
};

exports.getCheckStatusParams = (config, unitTests) => {
    return {
        url: `${API_URL}/${config.username}/js-tests/status`,
        json: true,
        body: { "js tests": unitTests },
        auth: { username: config.username, password: config.key }
    };
};
