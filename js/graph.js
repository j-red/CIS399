class ForceGraph {
    /**
     * @param dataset contains the arrays of nodes and edges for the graph.
     */
    constructor(dataset) {
        this.dataset = dataset;
    }

    //Width and height of SVG
    var w = 1920;
    var h = 930;

    //Initialize a simple force layout, using the nodes and edges in dataset
    var force = d3.forceSimulation(dataset.nodes)
                  .force("charge", d3.forceManyBody())
                  .force("link", d3.forceLink(dataset.edges))
                  .force("center", d3.forceCenter().x(w/2).y(h/2));

    var colors = d3.scaleOrdinal(d3.schemeCategory10);

    //Create SVG element
    var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h);
    svg.append("rect")
        .attr("fill", "#333")
        .attr("width", w)
        .attr("height", h);

    //Create edges as lines
    var edges = svg.selectAll("line")
        .data(dataset.edges)
        .enter()
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", 1);

    //Create nodes as circles
    var nodes = svg.selectAll("circle")
        .data(dataset.nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        // .attr("r", function(d, i) {
        //     console.log(dataset["nodes"][i]);
        // })
        .style("fill", function(d, i) {
            return colors(i);
        })
        .call(d3.drag()  //Define what to do on drag events
            .on("start", dragStarted)
            .on("drag", dragging)
            .on("end", dragEnded));

    //Add a simple tooltip
    nodes.append("title")
         .text(function(d) {
            // return d.name;
            return d.realname;
         });

    //Every time the simulation "ticks", this will be called
    force.on("tick", function() {

        edges.attr("x1", function(d) { return d.source.x; })
             .attr("y1", function(d) { return d.source.y; })
             .attr("x2", function(d) { return d.target.x; })
             .attr("y2", function(d) { return d.target.y; });

        nodes.attr("cx", function(d) { return d.x; })
             .attr("cy", function(d) { return d.y; });

    });

    //Define drag event functions
    function dragStarted(d) {
        if (!d3.event.active) force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragging(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragEnded(d) {
        if (!d3.event.active) force.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

}
