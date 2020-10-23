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
                dataArray.push(chunk) //.push() lægger værdien i chunk ind som et element til arrayet 'data'
            })

            // listener for når datastream ender. Den er triggered af eventet 'end'.
            req.on('end', () => {
                if(dataArray.length > 0) {
                    //1. decipher data. hint: JSON.parse()

                    console.log("Data i router " + self.name+ ": ")

                    dataArray = JSON.parse(dataArray); // JSON strings der ligger i dataArray parses til js-objekter

                    console.log(dataArray);

                    //2. reconstruct the packet from the data.
                                // endnu en dum ide....
                    let packet = new Packet(dataArray.id = dataArray[0], dataArray.source = dataArray[1],
                        dataArray.destination = dataArray[2], dataArray.ttl=dataArray[3],
                        dataArray.routingHistory=dataArray[4], dataArray.shortestPath=dataArray[5]);

                       console.log(packet);
                       console.log(dataArray.id)

                    /* Dum idé
                    dataArray.forEach(obj => {
                        if(obj == packet.id){
                            let id = obj;

                        } if(obj == packet.source){
                            let source = obj;
                        }
                        if(obj == packet.destination){
                            let destination = obj;
                        }
                        if(obj == packet.ttl){
                            let ttl = obj;
                        }
                    })
                */
                    /*
                     dataArray.forEach(router => {
                        let source = router.name;
                        let con = router.connections;
                            con.forEach(con => {
                               let destination = con[0];
                               let cost = con[1]
                            })
                    })
                      */
                    console.log("Packet " + packet.id + " received at router " + self.name);

                    if(packet.destination === self.name)
                    {
                        // 3. What to do if packet has reached destination?

                        //data streamet stopper
                        if(dataArray.path.length === 0) {
                            res.end(JSON.stringify(dataArray)); //send et response - Stringify javascript objekter tilbage til JSON string
                        }
                    }
                            // 4. Get which router to forwardTo.
                            // Hint: there's a method in packet, that gets the next router.
                            // Hint: should be an int.

                            // Skal finde den næste ruter (har ikke kunnet teste om det virker)
                            let forwardTo = packet.forwardPacket(packet.destination); //metodens connection skal fikses

                    console.log(forwardTo);

                    // get the connection object (routeTo).
                    // consists of a "to" and a "cost".
                    let routeTo = self.getRouteTo(destination);
                    let cost = routeTo.getTotalCost();

                    // 5. decrement the packets ttl.

                    let packetLifetime = dataArray.ttl =-1;

                    // 6. Add an extra field to routeTo named ttl with same value as the packet's ttl.
                    // remember the object notation of objects in javascript.







                    // 7. Finish the if statement.

                    if(packetLifetime == 0) {
                        res.end(JSON.stringify({msg:"packed dropped due to ttl"}))
                        return;

                    }
                    console.log("Forwarding to router "+forwardTo+" and inccuring a cost of " + routeTo.cost + ". Total cost: " + packet.getTotalCost());

                    // 8. Add the routeTo to the packet's history.
                    // hint: Look at the packet methods.


                    // 9. forward the packet to the forwardTo variable.
                    // again look at the packet's methods.

                }
                else {
                    res.end("No data received");
                }
            })

        })

        // for at hente servicen skal vi bruge en get metode fra en klient-side script - Se ../V3/packet.js
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
