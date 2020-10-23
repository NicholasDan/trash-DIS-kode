let data = require("../data.json");
const Router = require("./routerV2");
const prompt = require('prompt');
const seaport = require('seaport');
const ports = seaport.connect('localhost', 9090);
const fetch = require('node-fetch');

let routers = [];

const multipleRouters = () => {
    /**
     * we iterate through the data and create the routers from it
     * as well as add it to our array.
     */

    data.routers.forEach(router => {
        // initialize router
        let r = new Router(router.router, router.connections);

        // add to array
        routers.push(r);

        console.log(routers);
    })

    /**
     * Prompt is a package to prompt the user though the terminal.
     * Can be found here: https://github.com/flatiron/prompt#readme
     */
    prompt.start();
    console.log("demo packet initialized. Send packet? (y/n)")
    prompt.get(["sendPacket"], function(err, res) {
        if(res.sendPacket == "y") {
            let data = {
                msg: "I was sent from multipleRouters",
                path: [1,2,3]
            }
            sendInitialPacket(0, data);
        }
        else {
            console.log("Bye!")
            process.exit(1);
        }
    })

    const sendInitialPacket = (to, body) => {
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
            .then(json => {
                console.log(json);
                process.exit(1);
            });
    }
}

multipleRouters();
