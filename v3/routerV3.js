/*
Seaport storer host & port kombinationer og anden metadata for mig.
Vi bruger denne til at modtage webservice HTTP-request og sende responses tilbage
 */

//routerV3.js er server siden
const http = require('http');
const seaport = require('seaport');
const ports = seaport.connect('localhost', 9090);
const fetch = require('node-fetch');
const Packet = require('./packet');


class Router{
    constructor(name, connections) {
        this.name = name;
        this.connections = connections;
        var self = this; // vi vil gerne bruge variablen i indlejrede funktioner

        // opretter webservice serveren. Lytter efter requests fra packet.js
        // og sender responses til packet.js
        this.server = http.createServer(function(req, res) {

            let dataArray = [];

            //Jeg tilgår http headers ved brug af en chunkListener der pusher chunks in i arrayet 'data' når
            // requestListeneren modtager en klienside request af eventypen 'data'
            req.on('data', chunk => {
                dataArray.push(chunk)
                //.push() lægger værdien i chunk ind som et element til arrayet 'data'
            })

            // listener for når datastream ender. Den er triggered af eventet 'end'.
            req.on('end', () => {
                if(dataArray.length > 0) {
                    //1. decipher data. hint: JSON.parse()

                    dataArray = JSON.parse(dataArray); // JSON strings der ligger i dataArray parses til js-objekter

                    console.log(dataArray);

                    //2. reconstruct the packet from the data.

                    let packet = new Packet(dataArray.id, dataArray.source,
                        dataArray.destination, dataArray.ttl,
                        dataArray.routingHistory, dataArray.shortestPath);

                    //console.log("Packet " + packet.id + " received at router " + self.name);

                      // 3. What to do if packet has reached destination?

                    if(packet.destination === self.name) {
                            res.end(JSON.stringify(dataArray)); //send et response - Stringify javascript objekter tilbage til JSON string
                            return;
                    }
                            // 4. Get which router to forwardTo.
                            // Hint: there's a method in packet, that gets the next router.
                            // Hint: should be an int.

                            let forwardTo = packet.popShortestPath();

                             // get the connection object (routeTo).
                            // consists of a "to" and a "cost".

                            let routeTo = self.getRouteTo(forwardTo);

                    // 5. decrement the packets ttl.

                   packet.ttl = packet.ttl-1; //let packetLifetime = packet.ttl-1;

                    // 6. Add an extra field to routeTo named ttl with same value as the packet's ttl.
                    // remember the object notation of objects in javascript.

                    //console.log(routeTo)
                    routeTo.ttl = packet.ttl;

                    // 7. Finish the if statement.

                    if(packet.ttl == 0) {
                        res.end(JSON.stringify({msg:"packed dropped due to no time to live (ttl)"}))
                        return;

                    }
                    //console.log("Forwarding to router "+forwardTo+" and inccuring a cost of " + routeTo.cost + ". Total cost: " + packet.getTotalCost());

                    // 8. Add the routeTo to the packet's history.
                    // hint: Look at the packet methods.

                    //Jeg pusher routeTo ind som et i arrayet routeToHistory
                    packet.addRouteToHistory(routeTo);

                    // 9. forward the packet to the forwardTo variable.
                    // again look at the packet's methods.

                    //Jeg forwarder endelig pakken til den næste router. På baggrund af shortestPath metoden i forwardTo.
                    packet.forwardPacket(forwardTo);

                     /* console.log("Packet Source: router" + packet.source);
                     console.log("Packet Destination: router" + packet.destination);

                     console.log("Packet reached destination and followed: ")
                        */
                }
                else {
                    res.end("No data received");
                }
            })

        })

        this.port = ports.register("router"+this.name);

        // sender svar tilbage at serveren lytter
        this.server.listen(this.port, function() {
             console.log("Router " + name + " is listening on port " + this.address().port);
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

    updateConnections(connections) {
        this.connections = this.connections;
    }
}

module.exports = Router;
