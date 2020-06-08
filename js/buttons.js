var notLoaded = true;
var hasClicked = false;

function loadButtons() {
    // console.log("Loading");
    let svg = d3.select(".buttonBox").append("svg")
        .attr("viewBox", "0 0 100 20")
        .attr("height", "50px")
        .style("border", "none")
        .style("box-shadow", "none")
        .attr("id", "buttonBox");

    let selector = svg.append("circle")
                        .attr("id", "circleSelector")
                        .attr("fill", "rgba(99, 108, 121, 1)")
                        .attr("r", "7")
                        .attr("cx", 30)
                        .attr("cy", 10);

    svg.append("circle")
        .attr("id", "buttonOne")
        .attr("cx", 30)
        .attr("cy", 10)
        .attr("r", 5.5)
        .attr("class", "button")
        .on("click", function() {
            // var coords = d3.mouse(this);
            // d3.select(".active").attr("class", d3.select(".active").attr("class").replace(" active", ""));
            // d3.select(".one").attr("class", "textbox one active");
            hasClicked = true;
            // if (!notLoaded) {
            //     notLoaded = true;
            //     d3.select("#igmatrix").remove();
            //     d3.select("#twmatrix").remove();
            // }

            d3.select(".one").attr("class", "textbox one active");
            d3.select(".two").attr("class", "textbox two");
            d3.select(".three").attr("class", "textbox three");

        selector.transition().duration(300).attr("cx", 30);
        });


    svg.append("circle")
        .attr("id", "buttonTwo")
        .attr("cx", 50)
        .attr("cy", 10)
        .attr("r", 5.5)
        .attr("class", "button")
        .on("click", function() {
            // var coords = d3.mouse(this);
            // if (!notLoaded) {
            //     notLoaded = true;
            //     d3.select("#igmatrix").remove();
            //     d3.select("#twmatrix").remove();
            // }

            hasClicked = true;
            d3.select(".one").attr("class", "textbox one");
            d3.select(".two").attr("class", "textbox two active");
            d3.select(".three").attr("class", "textbox three");

        selector.transition().duration(300).attr("cx", 50); // move the circle selector to the active item
        });

    svg.append("circle")
        .attr("id", "buttonThree")
        .attr("cx", 70)
        .attr("cy", 10)
        .attr("r", 5.5)
        .attr("class", "button")
        .on("click", function() {
            // console.log("notLoaded:", notLoaded);
            if (notLoaded) {
                loadMatrices();
                notLoaded = false;
                console.log("Loading adjacency matrices...");
            }
            // var coords = d3.mouse(this);
            hasClicked = true;
            d3.select(".one").attr("class", "textbox one");
            d3.select(".two").attr("class", "textbox two");
            d3.select(".three").attr("class", "textbox three active");
            selector.transition().duration(300).attr("cx", 70);

            if (d3.select(".active")._groups[0][0].childElementCount < 5) {
                console.log("not here");
            } else {
                console.log("good to remove");
                d3.select("#debug").remove();
            }

        });
}
