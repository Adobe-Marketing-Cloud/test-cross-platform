const ngrok = require("ngrok");

module.exports = class Ngrok {
    create(port) {
        return new Promise((resolve, reject) => {
            ngrok.connect({ port }, (err, baseUrl) => {
                if (err) {
                    reject(err);
                } else {
                    this._baseUrl = baseUrl;
                    resolve(this);
                }
            });
        });
    }

    destroy() {
        if (this.hasStarted) {
            ngrok.kill();
        }
    }

    get hasStarted() {
        return Boolean(this.baseUrl);
    }

    get baseUrl() {
        return this._baseUrl;
    }
};
