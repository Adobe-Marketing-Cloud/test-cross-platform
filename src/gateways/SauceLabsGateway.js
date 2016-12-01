const request = require("request");
const localize = require("../localize");
const getStartParams = require("./gatewayParams").getStartParams;
const getCheckStatusParams = require("./gatewayParams").getCheckStatusParams;

const CHECK_STATUS_INTERVAL = 2000;
const API_URL = "https://saucelabs.com/rest/v1/";

module.exports = class SauceLabsGateway {
    constructor(publish) {
        this.publish = publish;
    }

    start(config, baseUrl) { // Returns a list of unit test ids.
        const params = getStartParams(baseUrl, config);

        return new Promise((resolve, reject) => {
            request.post(params, (err, res, body) => {
                if (err) {
                    return reject(err);
                }

                if (body.error) {
                    return reject(new Error(localize("UNIT_TESTS_START_ERROR", `(${res.statusCode}) ${body.error}`)));
                }
                this.publish("message", localize("UNIT_TESTS_STARTED", params.body.url));
                resolve(res.body["js tests"]);
            });
        });
    }

    checkStatus(config, unitTests) {
        this.progress = {};
        for (let id of unitTests) {
            this.progress[id] = {};
        }

        const checkStatusUrl = `${API_URL}/${config.username}/js-tests/status`;
        const params = {
            url: checkStatusUrl,
            json: true,
            body: { "js tests": unitTests },
            auth: { username: config.username, password: config.key }
        };

        return new Promise((resolve, reject) => {
            let checkJobStatus = () => {
                setTimeout(() => {
                    request.post(params, (err, response, body) => {
                        if (err) {
                            return reject(err);
                        }

                        if (body.error) {
                            return reject(
                                new Error(localize("JOBS_PROGRESS_ERROR", `(${response.statusCode}) ${body.error}`))
                            );
                        }

                        if (body.message) {
                            return reject(new Error(body.message));
                        }

                        let ongoingUnitTests = body["js tests"];

                        try {
                            this.updateJobProgress(ongoingUnitTests);
                        } catch(err) {
                            return reject(err);
                        }

                        return body.completed ? resolve(ongoingUnitTests) : checkJobStatus();
                    });
                }, config.checkstatusinterval || CHECK_STATUS_INTERVAL);
            };
            checkJobStatus();
        });
    }

    updateJobProgress(tests) {
        for (let test of tests) {
            test.status = test.status || localize("TEST_IS_FINISHED");
            
            if (test.status !== this.progress[test.id].status) {
                this.progress[test.id].status = test.status;
                this.publish("update", test);
            }

            if (test.status.indexOf("error") > -1) {
                throw new Error(test.status);
            }
        }
    }
};
