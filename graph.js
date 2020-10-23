var jsgraphs = require('js-graph-algorithms');

// 1. Initialize your graph here.
let g = new jsgraphs.WeightedDiGraph(4);

// 2. Add edges to your graph below
g.addEdge(new jsgraphs.Edge(0, 1, 1));
g.addEdge(new jsgraphs.Edge(0, 2, 3));
g.addEdge(new jsgraphs.Edge(0, 3, 7));
g.addEdge(new jsgraphs.Edge(1, 0, 1));
g.addEdge(new jsgraphs.Edge(1, 2, 1));
g.addEdge(new jsgraphs.Edge(2, 0, 3));
g.addEdge(new jsgraphs.Edge(2, 1, 1));
g.addEdge(new jsgraphs.Edge(2, 3, 2));
g.addEdge(new jsgraphs.Edge(3, 0, 7));
g.addEdge(new jsgraphs.Edge(3, 2, 2));

// 3. Create a function that takes a graph, a from node and a to node,
//    and print the shortest path between the two nodes.
const shortestPath = (graph, from, to) => {
    let dijkstra = new jsgraphs.Dijkstra(graph, from);
     console.log(dijkstra);
    if(dijkstra.hasPathTo(to)){
        return dijkstra.pathTo(to).map(edge => edge.to());
    }
    else return null;
};

console.log(shortestPath(g, 0, 3));
// (4.) Modify above function to handle it, if a path doesn't exist.
