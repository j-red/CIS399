// Width and height of SVG elements
var w = 500;
var h = 500;

// blank data sets to be populated
var ig_dataset = {
    nodes: [
        // {name: "username", realname: "realname"}
    ],
    edges: [
        // { source: 0, target: 0 } // source and target indices in the data
    ]
}
var tw_dataset = {
    nodes: [
        // {name: "username", realname: "realname"}
    ],
    edges: [
        // { source: 0, target: 0 } // source and target indices in the data
    ]
}

function randomData(dataset, size, threshold) {
    /* Populate dataset with size nodes and a 1-threshold probability of
        connection to each other node. For debugging purposes only. */
    for (i = 0; i < size; i ++) {
        dataset.nodes.push({"name": i});
    }

    for (i = 0; i < size; i++) {
        for (j = 0; j < i; j++) {
            if (Math.random() > threshold) {
                dataset.edges.push({source: i, target: j});
            }
        }
    }
}

/* These callback functions are only executed AFTER all data is loaded. */
function populate_ig_dataset(data) {
    // console.log("Data has been loaded!");
    // console.log(data);
    /* Insert nodes into the graph. */
    for (let i = 0; i < data.length; i++) {
        ig_dataset.nodes.push({
            username: data[i]["username"],
            realname: data[i]["realname"],
            private: data[i]["private"],
            count: data[i]["mutuals"].length
        });
        /* For each node already in the graph... */
        for (let j = 0; j < i; j++) {
            /* and for each of their mutuals... */
            for (let k = 0; k < data[j]["mutuals"].length; k++) {
                /* If mutual k is our new node... */
                if (data[j]["mutuals"][k] == data[i]["username"]) {
                    /* create an edge between i and j. */
                    ig_dataset.edges.push({source: i, target: j});
                }
            }
        }
    }

    // Select the IG SVG element. It's created in the HTML.
    var svg = d3.select(".IG").select("svg");
    initGraph(data, ig_dataset, svg); // draw the IG graph.

    // randomData(tw_dataset, 50, 0.95); // use x nodes and y threshold for connection to each other node
    // svg = d3.select(".TW").select("svg");
    // initGraph(data, tw_dataset, svg); // draw the TW graph.
}

function populate_tw_dataset(data) {
    // console.log("Twitter data has been loaded!");
    // console.log(data);
    /* Insert nodes into the graph. */
    for (let i = 0; i < data.length; i++) {
        tw_dataset.nodes.push({
            username: data[i]["username"],
            realname: data[i]["realname"],
            private: data[i]["private"],
            count: data[i]["mutuals"].length
        });
        /* For each node already in the graph... */
        for (let j = 0; j < i; j++) {
            /* and for each of their mutuals... */
            for (let k = 0; k < data[j]["mutuals"].length; k++) {
                /* If mutual k is our new node... */
                if (data[j]["mutuals"][k] == data[i]["username"]) {
                    /* create an edge between i and j. */
                    tw_dataset.edges.push({source: i, target: j});
                }
            }
        }
    }

    // Select the IG SVG element. It's created in the HTML.
    // var svg = d3.select(".TW").select("svg");
    var svg = d3.select(".TW").select("svg").append("g").attr("id", "viewport");
    initGraph(data, tw_dataset, svg); // draw the TW graph.
}

function initGraph(data, dataset, svg) {
    document.addEventListener("click", function(e) { /* Add a click event listener. */
            select(null); // clear selection
        }, true);

    //Initialize a simple force layout, using the nodes and edges in dataset
    var force = d3.forceSimulation(dataset.nodes)
                  .force("charge", d3.forceManyBody())
                  .force("link", d3.forceLink(dataset.edges).distance(50))
                  .force("center", d3.forceCenter().x(w/2).y(h/2));

    // Create node sizer function (based on HW6 implementation)
    let minSize = d3.min(data, function(d) { return d["mutuals"].length; });
    let maxSize = d3.max(data, function(d) { return d["mutuals"].length; })
    let nodeScale = d3.scaleSqrt().range([3, 16]).domain([minSize, maxSize]);

    // Create color scale
    // var colors = d3.scaleOrdinal(d3.schemeCategory10);
    var colors = d3.scaleLinear() // linear color ramp
                    .domain([minSize, minSize + maxSize / 2, maxSize])
                    .range(["#1E88E5", "#DC267F", "#FE6100"]);

    // By drawing the legend here, we can drag nodes on top of it.
    // drawLegend();

    // Create edges as lines
    var edges = svg.selectAll("line")
        .data(dataset.edges)
        .enter()
        .append("line")
        // .attr("class", "edge");
        .attr("class", function(d, i) { // use the nodes it connects to as class names for selection & styling
            // return `edge ${d.source.username} ${d.target.username}`;
            return `edge ${"_" + d.source.username.split(".").join("")} ${"_" + d.target.username.split(".").join("")}`; // remove .'s, they cause styling issues
        });

    // Create nodes as circles
    var nodes = svg.selectAll("circle")
        .data(dataset.nodes)
        .enter()
        .append("circle")
        .attr("class", d => d.private == true ? `node private` : `node public`) /* Class nodes based on if they are private */
        .attr("id", d => "_" + d.username.split(".").join(""))
        .attr("r", d => nodeScale(d.count))  /* Size nodes based on their number of connections */
        .style("fill", d => colors(d.count)) /* Color nodes based on their number of connections */
        .on("click", d => select(d))
        .call(d3.drag()  // Define what to do on drag events
            .on("start", dragStarted)
            .on("drag", dragging)
            .on("end", dragEnded));

    function select(d) {
        var m; /* Create reference to proprietary adjacency matrix */
        if (svg.attr("class") == "insta") {
            m = d3.select("#igmatrix");
        } else {
            m = d3.select("#twmatrix")
        }
        
        if (d == null) { // restore default values
            svg.selectAll(".infopanel").transition().duration(500).style("opacity", 0).remove(); // clear the selection info panel
            svg.selectAll(".edge")
                .style("opacity", 0.2);
            svg.selectAll(".node")
                .style("opacity", 1);
            try {
                let current = svg.selectAll(".selected"); // remove " selected" from the classes for this node
                current.attr("class", current.attr("class").substring(0, current.attr("class").length - 9));
            } finally {
                try {
                    console.log("Trying to remove 'selected' class...");
                    let entry = m.selectAll(".selected");
                    entry.attr("class", entry.attr("class").substring(0, entry.attr("class").length - 9));
                } finally {
                    return;
                }
            }
        }
        // console.log("selected @", "_" + d.username.split(".").join(""));
        svg.selectAll(".edge") // select all edges, reduce opacity
            .style("opacity", 0.1);
        svg.selectAll(".node") // select all nodes, reduce opacity
            .style("opacity", 0.25);

        // select all edges with class = username of clicked node
        selection = svg.selectAll(`.edge.${"_" + d.username.split(".").join("")}`);
        selection.style("opacity", 1);

        /* select all nodes within a degree of separation of the node we clicked */
        for (let i = 0; i < selection._groups[0].length; i++) {
            let src = selection._groups[0][i].__data__.source.username;
            let trg = selection._groups[0][i].__data__.target.username;

            let selection_a = svg.selectAll(`#${"_" + src.split(".").join("")}`);
            selection_a.transition().duration(500).style("opacity", 1);
            let selection_b = svg.selectAll(`#${"_" + trg.split(".").join("")}`);
            selection_b.transition().duration(500).style("opacity", 1);
        }

        // select the node with class = username of clicked node
        selection = svg.selectAll(`#_${d.username.split(".").join("")}`);
        selection.style("opacity", 1).attr("class", selection.attr("class") + " selected");

        // select the corresponding entry in the adjacency matrix
        try {
            selection = m.selectAll(`#_${d.username.split(".").join("")}`);
            selection.attr("class", selection.attr("class") + " selected");
        } catch {
            console.log(`${d.username} is not drawn in the adjacency matrix.`);
        }

        // Draw the selected user info panel
        let panel = svg.append("g")
                        .attr("class", "infopanel")
                        .attr("transform", "translate(10, 30)")
                        .attr("text-anchor", "start")
                        .style("opacity", 0);
        panel.append("text")
            .text(`Currently selected: @${d.username}`);
        panel.append("text")
            .text(`User has ${d.count} connections.`)
            .attr("transform", "translate(0, 22)");
        panel.append("text")
            .text(d.private ? "Their profile is PRIVATE." : "Their profile is PUBLIC.")
            .attr("transform", "translate(0, 44)");
        panel.transition().duration(1000).style("opacity", 1);
    }

    // Add a simple tooltip to ALL nodes
    nodes.append("title")
         .text(function(d, i) {
            // return d.realname;
            // return `${d.realname}\n${data[i]["mutuals"].length} mutual connections`;
            return `${data[i]["mutuals"].length} mutual connections`;
         });
    /*
    // Add a name tooltip to only the PUBLIC nodes
    d3.selectAll(".public")
        .append("title")
        .text(function(d) {
            // return d.realname;
            return `${d.realname}\n@${d.username}`; // return name and username in tooltip
        });
    // Use <<Private>> as the tooltip for all private accounts
    d3.selectAll(".private")
        .append("title")
        .text("<Private Account>"); */

    function drawLegend() {
        g = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(40, 430)");

        g.append("text")
            .text("Legend:")
            .attr("text-anchor", "middle")
            .attr("transform", "scale(1.2, 1.2)");
        g.append("text")
            .attr("class", "legend note")
            .text("Depicts node's total number of mutual connections,")
            .attr("text-anchor", "end")
            .attr("transform", "translate(450, 50) scale(0.8, 0.8)");
        g.append("text")
            .attr("class", "legend note")
            .text("which is likely greater than what is drawn.")
            .attr("text-anchor", "end")
            .attr("transform", "translate(450, 62) scale(0.8, 0.8)");

        g.append("circle")
            .attr("cx", "0")
            .attr("cy", "25")
            .attr("r", nodeScale(minSize))
            .attr("fill", colors(minSize));
        g.append("text")
            .text(minSize)
            .attr("transform", "translate(0, 60)");

        g.append("circle")
            .attr("cx", "40")
            .attr("cy", "25")
            .attr("r", nodeScale(minSize + maxSize / 2))
            .attr("fill", colors(minSize + maxSize / 2));
        g.append("text")
            .text(Math.round(minSize + maxSize / 2))
            .attr("transform", "translate(40, 60)");

        g.append("circle")
            .attr("cx", "90")
            .attr("cy", "25")
            .attr("r", nodeScale(maxSize))
            .attr("fill", colors(maxSize));
        g.append("text")
            .text(maxSize)
            .attr("transform", "translate(90, 60)");
    }
    drawLegend();

    //Every time the simulation "ticks", this will be called
    force.on("tick", function() {
        edges.attr("x1", function(d) { return d.source.x; })
             .attr("y1", function(d) { return d.source.y; })
             .attr("x2", function(d) { return d.target.x; })
             .attr("y2", function(d) { return d.target.y; });
        nodes.attr("cx", function(d) { return d.x; })
             .attr("cy", function(d) { return d.y; });
    });

    // Drag event functions, taken from the D3 textbook documentation.
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
