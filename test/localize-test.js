var test = require("tape");
var localize = require("../src/localize");

test("Calling `localize` without a key", (t) => {
    const invalidCall = () => localize();

    t.throws(invalidCall, Error, "It should throw localize: Key is required!");
    t.end();
});

test("Calling `localize` with a key without params", (t) => {
    const resource = localize("key");

    t.ok(resource, "Resource should be returned");
    t.equal(resource, "This is a simple resource");

    t.end();
});

test("Calling `localize` with a key and with params", (t) => {
    const resource = localize("SERVER_STARTED", "8080");
    const resource2 = localize("PORT_TAKEN_ERROR", "1254");

    t.ok(resource, "Resource should be returned");
    t.equal(resource, "Server has started on port 8080");

    resource2
    t.ok(resource2, "Resource 2 should be returned");
    t.equal(resource2, "Error starting server: port 1254 is already in use");

    t.end();
});

test("Calling `localize` with a key that doesn't exist", (t) => {
    const resource = localize("INVALID_KEY");

    t.ok(resource, "Resource should be returned");
    t.equal(resource, "Invalid key");

    t.end();
});

