# trash-DIS-kode
:/Exercises regarding distributed shortest path
CAUTION
When solving the following exercises we encourage you to only look at the files, that are mentioned in the specific assignment. Other folders / files e.g. v2 / v3 might contain hints or solutions. ALSO: Before solving any of these exercises remember to run npm install

Graphs
A graph is a data structure consisting of nodes / vertices and connections / edges between these nodes. An edge can be directional or bidirectional and weighted or unweighted. When simulating a distributed shortest path, we need weights on the edges to simulate the delay between there exists between routers. In the image below, you see a graph structure, where the "X" represents the routers (nodes) and each router is connected through a weighted connection. This weight represents the delay. For instance it's more expensive to go from 0 directly to 3 (cost = 7), then it is to go from 0 → 2 → 3 (cost = 5).



js-graph-algorithms is a javascript library that provides a graph data structure and includes algorithms to find the shortest path between two nodes. The documentation can be found here: https://github.com/chen0040/js-graph-algorithms

Graph exercises
Create a graph that looks like the one in the picture through the js-graph-algorithms library.
Initialize your graph with the number of required nodes.
Add edges to your graph.
Create a function that takes a graph, a from node and a to node, and returns the shortest path between the two nodes. I.e. in the example when going from 0 → 3, we want the function to return [1,2,3].
Optional: Modify above function to handle it, if a path doesn't exist.
The steps can also be found in graph.js

Create the same graph but by reading the data from a JSON data-file. The starting code can be found in graph-json.js.

Run the graph-json.js file. What does the object look like? How would you get information about the connects, which is logged as [Array]? Remember that JSON is converted into an ordinary js-object so fields can be accessed with a .fieldName and objects in arrays can be accessed with [indexNumber].
Create a loop that prints all the connections from router 0.
Now finish the data.json file included in this project and make it represent the original graph. Information about JSON along with some examples can be found here: https://www.w3schools.com/whatis/whatis_json.asp. We recommend you to use a JSON formatter s.a. https://jsonformatter.org/ which will provide you with feedback on where your JSON is wrong as well as "beautify" it for you.
Create a graph similar to the one above, but by iterating over the json-data instead of adding the edges manually.
Implement shortest path again.
Advanced: Look into how the shortest path algorithms such as Dijkstra or Bellman-ford works.

Routers
You know how it works.

Router exercises
This part of the exercises builds on top of your other exercises regarding routers. In the v1 folder, we have created a skeleton called router.js. This file contains a node-fetch library which is used to create http-request. This is the library we will use to forward data between our routers. Documentation can be found here: https://github.com/node-fetch/node-fetch

To read data from a http request, we have used the vanilla nodejs approach found on the bottom of this site: https://nodejs.dev/learn/get-http-request-body-data-using-nodejs. Modify the req.on('end') to send the data back to the oneRouter.js file. Hint: call res.end(something). If everything is done correctly, you should see the object printed to the terminal. Note that you can run node --no-warnings oneRouter.js to supress the annoying warning.
The above method uses the sendInitialPacket method. Explain what this method does.
Now that we can read from packages, what we want to do is to send packages between different routers. Go to the v2 and
In multipleRouters.js fill out the forEach loop on line 16, where you have to initialize a Router and add it to an array.
Edit routerV2 to forward a package to the next router based on the path.
If everything works as it should, you should get the following output in the console:
Data received at router 0
Data received at router 1
Data received at router 2
Data received at router 3
{ msg: 'I was sent from multipleRouters', path: [] }
Putting it all together
This will be the basis of your hand-in. In V3, we have included a packet.js file. Get comfortable with the file before you move on.

Assignment
Solve the following exercises:

In multipleRouters.js
Iterate through the data.json file and create your routers.
Build the graph from that data.
Build the demoPacket.
Implement the getShortestPath method.
In routerV3.js
Decipher the data received
reconstruct the packet from the data.
Implement what to do, if packet has reached destination. Hint: res.end()
Get which router to forward to.
Decrement the constructed packet's ttl by one.
Add an extra field to routeTo named ttl with same value as the packet's ttl.
Finish the if statement if packet should be dropped due to TTL.
Add the route to the packets history
forward the pacet to the forwardTo variable. Again look at the packet's methods.
If you have done everything correctly, you should see the following output in your terminal:

Packet source: router0
Packet destination: router3
Packet reached destination and followed 
        router1 at cost 1. ttl: 9
        router2 at cost 1. ttl: 8
        router3 at cost 2. ttl: 7
Total cost of: 4
Optional:
Some very usefull javascript array functions are the map, shift and reduce methods, but what do they do?

Shift is used in packet.js in line 19. Explain what it does.
Reduce is used in packet.js in line 26. Explain what it does? The method is called getTotalCost, but what it basically does is, that it performs a simple sum operation in this case. Could you use it to something else?
Map is not used in this code, but you might have used it in your implementation, in the getShortestPath. If you haven't, how could you implement this method, to modify an array and use it in the method?
