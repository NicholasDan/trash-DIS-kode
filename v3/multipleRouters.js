const Router = require("./routerV3.js");
const Packet = require("./packet.js");
const prompt = require('prompt');
let data = require("../data.json");
var jsgraphs = require('js-graph-algorithms');

let routers = [];


const multipleRouters = () => {
    /**
     * 1. Iterate through the data and create the routers from it
     * as well as add it to our array.
     */

    data.routers.forEach(router => {

        //Opretter en instans af en router for hver objekt i json arrayet "router" [{},{},{},{}]
        // de 4 routers får
        let r = new Router(router.router, router.connections);

        //pusher r ind som et element i 'routers' array'et
        routers.push(r);
    })
        console.log(routers); // routers != r ??
    /**
     * 2. build a weighted directional graph and adds the edges
     * between the nodes through the data.json file
     */

    /* Directional graf --> Én retning
       Weighted graf - en simpel graf med weigthed edges.
       Har et sæt af Vertices V, et sæt af edges E.
       Har en (weight) W, som her er givet ved cost. Summen af alle weights = 1 */

    // tilføjer antal vertices til grafen. En for hver router i data filen.
    let g = new jsgraphs.WeightedDiGraph(data.routers.length);

    //For hver router i json filen
    data.routers.forEach(router => {
        //Hent alle dens connections
        router.connections.forEach(c => {
            //fra hver connection, tilføj en edge. Fra (router, til router connection, cost connectionen
            g.addEdge(new jsgraphs.Edge(router.router, c.to, c.cost))
        })
    })
        //console.log(g);
    /**
     * 3. create a new packet.
     * create a packet with a name, a source, a destination and a ttl.
     * the source should be 0, destination 3 and ttl > 3.
     * the name can be whatever you'd like.
     */

    let packet = new Packet("Pakke1", 0, 3, 6);
   // console.log(packet);

    // djikstra shortest path algoritmen bruges (graf, fra, til)
    packet.shortestPath = getShortestPath(g, packet.source, packet.destination);

    console.log(packet.shortestPath);


    /**
     * Prompt is a package to prompt the user though the terminal.
     * Can be found here: https://github.com/flatiron/prompt#readme
     */



    prompt.start();
    console.log("Packet initialized. Send packet? (y/n)")
    prompt.get(["sendPacket"], function(err, res) {
        if(res.sendPacket == "y") {

            packet.forwardPacket(packet.destination);
        }
        else {
            console.log("Bye!")
            process.exit(1);
        }
    })

}

/**
 * This methods gets the router names / indexes on the shortest path.
 */

const getShortestPath = (graph, from, to) => {
    let dijkstra = new jsgraphs.Dijkstra(graph, from);
    console.log(dijkstra);
    if(dijkstra.hasPathTo(to)){
        //Nedenstående retunerer shortest-path fra router 0-3 som rute [1, 2, 3]
        return dijkstra.pathTo(to).map(edge => edge.to());
    }
    else return null;
};

multipleRouters();
