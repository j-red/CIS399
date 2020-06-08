var datasets = [];

function prep(data, svgID, name) {
    datasets.push({data, svgID, name});
}

function loadMatrices() {
    loadMatrix(datasets[0].data, datasets[0].svgID, datasets[0].name); /* Create IG adjacency matrix */
    loadMatrix(datasets[1].data, datasets[1].svgID, datasets[1].name); /* Create TW adjacency matrix */
}

// create adjacency matrices in the svg elements ID'd igmatrix and twmatrix.
function loadMatrix(data, svgID, title) { // will be called twice, once for each data set.
    /* Note: these SVGs have a 100x100 viewBox. */
    let container = d3.select(".matrices");
    container.append("h2").text(title + ":");

    let svg = container.append("svg")
                .attr("id", svgID)
                .attr("class", "adjmatrix")
                .style("cursor", "default")
                .attr("viewBox", "0 0 100 100");
    let count = data.length; // Get the number of entries

    var width = 100;
    var height = 100;
    var delta = width / count;

    let indices = {}; // table to convert usernames to indices
    let table = [];
    for (let i = 0; i < count; i++) {
        indices[data[i].username] = i;
        // table["_" + data[i].username] = i; // leading _ to prevent d3 selection issues
        let tmp = []; // list of the current row
        for (let j = 0; j < count; j++) {
            tmp.push(data[i]);
        }
        table.push(tmp);
    }

    /* Create background rectangle */
    svg.append("rect").attr("width", width).attr("height", height).attr("class", "background");

    /* Get the min and max number of connections for color scale */
    let minSize = d3.min(data, function(d) { return d["mutuals"].length; });
    let maxSize = d3.max(data, function(d) { return d["mutuals"].length; });

    /* Create a color scale identical to the one used in the graphs */
    var colors = d3.scaleLinear() // linear color ramp
                    .domain([minSize, minSize + maxSize / 2, maxSize])
                    .range(["#1E88E5", "#DC267F", "#FE6100"]);

    for (let row = 0; row < count; row ++) {
        svg.append("line")
            .attr("class", "grid")
            // .style("stroke-width", 0.01)
            // .style("stroke", "black")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", delta * row)
            .attr("y2", delta * row);

        for (let col = 0; col < count; col ++) {
            if (row == 0) {
                svg.append("line")
                    .attr("class", "grid")
                    // .attr("stroke-width", 10)
                    // .attr("stroke", "black")
                    .attr("y1", 0)
                    .attr("y2", height)
                    .attr("x1", delta * col)
                    .attr("x2", delta * col);
            }
            /* Create a rectangle at index row, col if a mutual relationship exists */
            let mutuals = false;
            for (let i = 0; i < count; i ++) {
                if (data[col]["mutuals"][i] == data[row].username) {
                    // console.log(`User ${data[col].username} is mutuals with ${data[row].username}`);
                    let box = svg.append("rect") // ID will be combo of the two usernames
                    .attr("class", "entry _" + data[row].username + " _" + data[col].username)
                    // .attr("id", "_" + [data[row].username, data[col].username].sort().join("+_"))
                    .attr("id", "_" + data[row].username.split(".").join(""))
                    .attr("width", delta)
                    .attr("height", delta)
                    .attr("x", row * delta)
                    .attr("y", col * delta)
                    .attr("fill", colors(table[row][col].mutuals.length));
                    // .style("cursor", "pointer");
                }
            }

        }
    }

}
