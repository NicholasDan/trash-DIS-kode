/* I RouterV3 har jeg instantieret et service registry,
som jeg også bruger til port assignments.
Nedenstående 3 linjer fetcher jeg et node.js library 'node-fetch', som bruges til at lave https-requests (clienten)
Biblioteket connectes gennem seaport ved localhost:9090 og bruges til at forwarde pakke-requests til ruteren.
 */
const seaport = require('seaport');
const ports = seaport.connect('localhost', 9090);
const fetch = require('node-fetch');


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
         */
        return this.shortestPath.shift();
    }

    getTotalCost() {
      /*
      <Array>.reduce() - herunder kaldt ved ".reduce()" kalder på den specificerede callback-funktion for alle elementer der
      ligger i arrayet "routingHistory".

      Return værdien af callback-funktionen er det akkumulerede resultat for alle elementer i arrayet.
      Den akkumulerede værdi gemmes og parses som et argument i det næste kald til callbackfunktionen.
        Funktionen .reduce() i getTotalCost() kaldet vil nu finde den besdste total cost ud fra elementerne i
        arrayet "routingHistory".

      Parametere
      acc - er det akkulumerede resultat
      route - er den værdi der skal lægges når man pusher et nyt route objekt ind i arrayet ''routingHistory'' arrayet.
      */
        return this.routingHistory.reduce((acc, route) => acc+route.cost, 0);
    }


    /*
    .push tager parameteren route og tillæger elementet til "routingHistory" Arrayet.
    Den retunerer derfor et ekstra rute element til arrayet.
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

    //Funktionen funker ikke af en eller anden grund
    forwardPacket(to) {

        let sourceRouter = ports.query("router"+to)[0];
       // console.log(sourceRouter);
       // console.log(ports);

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
