const connect = require("connect");
const serveStatic = require("serve-static");
const localize = require("./localize");

module.exports = class Server {
    constructor(publish) {
        this.publish = publish;
    }

    start(port) { // Create server, start it and return it.
        return new Promise((resolve, reject) => {
            this.server = connect()
                .use(serveStatic("./"))
                .listen(port)
                .on("listening", () => {
                    this.publish("message", localize("SERVER_STARTED", port));
                    resolve(this.server);
                })
                .on("error", (err) => {
                    const isPortInUse = err.code == "EADDRINUSE";
                    reject(isPortInUse ? new Error(localize("PORT_TAKEN_ERROR", port)) : err);
                });
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
        }
    }
};
