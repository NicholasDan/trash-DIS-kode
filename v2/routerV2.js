const http = require('http');
const seaport = require('seaport');
const ports = seaport.connect('localhost', 9090);
const fetch = require('node-fetch');

class Router{
    constructor(name, connections) {
        this.name = name;
        this.connections = connections;
        var self = this; // trick to access router from inner functions
        this.server = http.createServer(function(req, res) {
            let data = []
            // If the request contains any data, this listener is activated.
            req.on('data', chunk => {
                data.push(chunk)
            })

            // listener when reading data stream is done.
            req.on('end', () => {
                if(data.length > 0) {
                    console.log("Data received at router " + self.name);
                    // you need to write your code here.

                    // decipher buffer data:
                    data = JSON.parse(data);
                    // if path empty, we have reached the destination
                    if(data.path.length == 0) {
                        res.end(JSON.stringify(data));
                    } else {
                        let forwardTo = data.path.shift();
                        self.forwardPacket(forwardTo, data);
                    }
                }
                else {
                    res.end("No data received");
                }
            })

        })
        this.port = ports.register("router"+this.name);
        this.server.listen(this.port, function() {
            console.log("\nRouter " + name + " is listening on port " + this.address().port);
        });
    }

    getRouteTo = (destination) => {
        let found;
        this.connections.forEach((c) => {
            if(c.to === destination) {
                found = c;
            }
        })
        return found;
    }

    forwardPacket = (to, body) => {
        let sourceRouter = ports.query("router"+to)[0];
        var host = sourceRouter.host.split(":").reverse()[0];
        var port = sourceRouter.port;
        /**
         * node-fetch is a library to send http-requests.
         * In this case, we use it to post / forward the package.
         * The documentation can be found here:
         * https://github.com/node-fetch/node-fetch
         */
        fetch("http://" + host + ":" + port, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res.json())
            .then(json => console.log(json));
    }
}

module.exports = Router;
