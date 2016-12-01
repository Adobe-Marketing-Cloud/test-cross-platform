const EventEmitter = require("events");
const Ngrok = require("./tunnels/Ngrok");
const Server = require("./server");
const SauceLabsGateway = require("./gateways/SauceLabsGateway");
const TestCrossPlatform = require("./test-cross-platform");

module.exports = function (config) {
    const emitter = new EventEmitter();
    const publish = emitter.emit.bind(emitter);
    const server = new Server(publish);
    const tunnel = new Ngrok();
    const gateway = new SauceLabsGateway(publish);

    const tester = new TestCrossPlatform(config, emitter);
    return tester.run(tunnel, server, gateway);
};
