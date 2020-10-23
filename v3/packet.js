/* I RouterV3 har jeg instantieret et service registry,
som jeg også bruger til port assignments.
Nedenstående 3 linjer fetcher jeg et node.js library 'node-fetch', som bruges til at lave https-requests (clienten)
Librariet er connectes gennem seaport ved localhost:9090 og bruges til at forwarde requests til ruteren.
 */
const seaport = require('seaport');
const ports = seaport.connect('localhost', 9090);
const fetch = require('node-fetch');
const http = require('http');

class Packet{
    constructor(id, source, destination, ttl, routingHistory=[], shortestPath = []) {
        this.id = id;
        this.source = source;
        this.destination = destination,
            this.routingHistory = routingHistory;
        this.ttl = ttl;
        this.shortestPath = shortestPath;
    }

    popShortestPath() {
        /*
        .shift() fjerner det første element fra arrayet "shortestPath" og retunerer derefter værdien af alle
        andre elementer i arrayet.

        "shortestPath" arrayet er instantieret i Packet klassens constructor.
         */
        return this.shortestPath.shift();
    }

    getTotalCost() {
      /*
      <Array>.reduce() - her kaldt ved ".reduce()" kalder på den specificerede callback-funktion for alle elementer der
      ligger i arrayet "routingHistory".

      Return værdien af callback-funktionen er det akkumulerede resultat for alle elementer i arrayet.
      Den akkumulerede værdi gemmes og parses som et argument huskes i det næste kald til callbackfunktionen.

      .cost kalder på routing algoritmen: "TopologicalSortShortestPaths", som er hentet fra js-graph-algorithm pakken.
      Alogritmen udregener costen af den akkumulerede array værdi + costen af rejsen til den næste node.
      Den totale cost vil ændre sig løbende når vi udregner ny ruter.

      Parameterforklaring:
      acc - er det akkulumerede resultat
      route - er den værdi der skal lægges når jeg pusher et nyt route element til ''routingHistory'' arrayet.
      */
        return this.routingHistory.reduce((acc, route) => acc+route.cost, 0);
    }

    /*
    .push tager parameteren route og tillæger elementet til "routingHistory" Arrayet.
    Den retunerer derfor et ekstra rute element til arrayet.

    Funktionen .reduce() i getTotalCost() kaldet vil nu finde den besdste total cost ud fra elementerne i
    arrayet "routingHistory".
     */

    addRouteToHistory(route) {
        this.routingHistory.push(route);
    }

    // console print
    prettyPrint() {
        let out = "\nPacket source: router " + this.source;
        out += "\nPacket destination: router " + this.destination;
        out += "\nPacket reached destination and followed ";
        this.routingHistory.forEach(route => {
            out += "\n\trouter"+route.to + " at cost " + route.cost + ". ttl: " + route.ttl;
        })
        out += "\nTotal cost of: " + this.getTotalCost();
        console.log(out)
    }

    /*
    .query() - sætter en query task til seaport i gang, hvor parameteren "to" er
    destinationen som packeten skal leveres til

    .split("") seperer variable let-statementet "sourceRouter" ved host adresse og port med seperatoren Localhost ':' 9090.
    Stringen bliver derfor til to substring og retunerer dem som et array.
    .reverse() vender derefter rækkefølgen af alle elementer i et array. Så arrayet "vendes om" og ved position[0] får man derfor port nummeret
     */

    //Funktionen skal få fat host of port adresse for routers, så jeg kan videresende pakken
    forwardPacket(to) {

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
            body:    JSON.stringify(this),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res.json())
            .then(json => {
                if(json.msg) {
                    console.log(json.msg);
                } else {
                    let packet = new Packet(json.id, json.source, json.destination, json.ttl, json.routingHistory, json.shortestPath);
                    packet.prettyPrint();
                }
                process.exit(1);
            });

    }
}

module.exports = Packet;
