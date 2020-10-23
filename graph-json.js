var jsgraphs = require('js-graph-algorithms');

// to include the json data, we "require" it
var data = require('./data.json');

// investigate the data.
console.log(data);

// Try to log the connections of the router object below.
console.log(data.routers[0].connections);

// write a loop that prints the connections one by one.
data.routers[0].connections.forEach(c => console.log(c));


// If you haven't done so already, finish your JSON-data file such that
// it represents the pictured graph.
// And now that you know how to access the routers and the connections,
// create the graph by iterating over the data.

// initliaze graph below
let g = new jsgraphs.WeightedDiGraph(data.routers.length);

// add edges dynamically.
// Hint: You need a nested loop.
// The outer loop must iterate the routers, and the inner loop the connections.

//pseudo code:
/**
 * forEach router (r) {
 *      forEach router.connection (c) {
 *          graph.addEdge(fromNodeIndex, toNodeIndex, cost)
 *      }
 * }
 */

data.routers.forEach(r => {
    r.connections.forEach(c => {
        g.addEdge(new jsgraphs.Edge(r.router, c.to, c.cost))
    })
})


// now that you have your graph, make sure it looks the previous graph,
// and again implement the shortest path function.
const shortestPath = (graph, from, to) => {
    let dijkstra = new jsgraphs.Dijkstra(graph, from);
    // console.log(dijkstra);
    if(dijkstra.hasPathTo(to)){
        return dijkstra.pathTo(to).map(edge => edge.to());
    }
    else return null;
};

const printGraph = (g) => {
    console.log("\nNodes: ", g.V);
    g.adjList.forEach((edges,i) => {
        console.log("Node: ", i)
        edges.forEach(e => {
            console.log("\tconnected to " + e.w + " with a weight of " + e.weight)
        })
    })
}

printGraph(g);

console.log(shortestPath(g, 0, 3));
