var test = require("tape");
var Server = require("../src/server");
const EventEmitter = require("events");

const publish = new EventEmitter().emit;

var s;

test("Server's interface:", (t) => {
    s = new Server({ port: 9090}, publish);

    t.ok(s, "Server instance should be valid");
    t.ok(s.start, "Should have a start method");
    t.ok(s.stop, "Should have a stop method");

    t.end();
});

test("Calling server.start", (t) => {
    s.start().then(server => {
        t.ok(server, "Start method should return the server");
        t.equal(typeof server.close, "function", "Server should have a close method");

        t.end();
    });
});

test("Calling server.stop", (t) => {
    var closed = false;

    s.server.on("close", () => {
        closed = true;
        t.ok(closed, "Server should have been closed");
    });

    s.stop();
    t.end();
});
