const throwError = require("./utils").throwError;
const localize = require("./localize");

const defaults = {
    username: null,
    key: null,
    port: 8080,
    testsPath: "/test/",
    platforms: null,
    framework: "jasmine",
    name: "Cross Browser Unit Tests",
    build: Math.floor(Date.now() / 1000)
};

if (!Promise.finally) {
    Promise.prototype.finally = function (callback) {
        const p = this.constructor;
        // We don’t invoke the callback in here,
        // because we want then() to handle its exceptions
        return this.then(
            // Callback fulfills: pass on predecessor settlement
            // Callback rejects: pass on rejection (=omit 2nd arg.)
            value  => p.resolve(callback()).then(() => value),
            reason => p.resolve(callback()).then(() => { throw reason })
        );
    };
}

module.exports = class TestCrossPlatform {
    constructor(config, emitter) {
        this.emitter =  emitter;
        this.config = Object.assign({}, defaults, config);

        this._validateConfig(config);
    }

    _validateConfig({ platforms, username, key }) {
        if (!platforms) {
            throwError(localize("PLATFORMS_MISSING"));
        }

        if (!username || !key) {
            throwError(localize("INVALID_CREDENTIALS"));   
        }
    }

    run(tunnel, server, gateway) {
        // Start server, create the tunnel, start the jobs and wait for them to finish...
        server.start(this.config.port)
            .then(() => tunnel.create(this.config.port))
            .then(() => gateway.start(this.config, tunnel.baseUrl))
            .then(tests => gateway.checkStatus(this.config, tests))
            .then(tests => this.sendResult(tests))
            .catch(err => this.emitter.emit("error", err))
            .finally(() => this.destroy(tunnel, server));

        return this.emitter;
    }

    sendResult(tests) {
        const passed = tests.every((test) => Boolean(test.result && test.result.passed));
        const eventType = passed ? "success" : "failure";
        this.emitter.emit(eventType, tests);
    }

    destroy(tunnel, server) {
        tunnel && tunnel.destroy();
        server && server.stop();
    }
};
