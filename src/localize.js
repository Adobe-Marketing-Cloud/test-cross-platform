const sprintf = require("sprintf-js").sprintf;
const humanize = require("underscore.string/humanize");
const throwError = require("./utils").throwError;

// TODO Move those messages to a JSON file.
const resources = {
   key: "This is a simple resource",
   SERVER_STARTED: "Server has started on port %s",
   PORT_TAKEN_ERROR: "Error starting server: port %s is already in use",
   PLATFORMS_MISSING: "Please specify the platforms you would like to test in",
   INVALID_CREDENTIALS: "Please provide your sauce labs username and key",
   UNIT_TESTS_START_ERROR: "",
   UNIT_TESTS_STARTED: "Unit tests have started at %s",
   TEST_IS_FINISHED: "",
   TEST_PASSED: "All tests have passed!",
   VISIT_TEST_URL: "Visit %s for more details.\n"
};

module.exports = function localize(key = throwError("localize: Key is required!"), ...args) {
    if (!resources[key]) {
        return humanize(key);
    }

    return sprintf(resources[key], ...args);
};
