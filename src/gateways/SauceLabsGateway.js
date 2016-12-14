const request = require("request");
const localize = require("../localize");
const getStartParams = require("./gatewayParams").getStartParams;
const getCheckStatusParams = require("./gatewayParams").getCheckStatusParams;

const CHECK_STATUS_INTERVAL = 2000;

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
        this.progress = unitTests.reduce((map, id) => { 
            map[id] = {};
            return map;
        }, {});

        const params = getCheckStatusParams(config, unitTests);

        return new Promise((resolve, reject) => {
            const checkJobStatus = () => {
                setTimeout(() => {
                    request.post(params, (err, response, body) => {
                        if (err || body.error || body.message) {
                            return reject(
                                new Error(localize("JOBS_PROGRESS_ERROR", `(${body.message}) ${body.error}`))
                            );
                        }

                        try {
                            this.updateJobProgress(body["js tests"]);
                            return body.completed ? resolve(body["js tests"]) : checkJobStatus();

                        } catch(err) {
                            return reject(err);
                        }
                    });
                }, config.checkstatusinterval || CHECK_STATUS_INTERVAL);
            };
            checkJobStatus();
        });
    }

    updateJobProgress(tests) {
        for (const test of tests) {
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
