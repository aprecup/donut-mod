import * as d3 from "d3";
import * as marker from "./marker";
import {roundNumber} from "./utility"

/**
 * @param {object} donutState
 */
export async function render(donutState) {
    // Added a constant to remove the magic numbers within the width, height and radius calculations.
    const sizeModifier = 10;
    // D3 animation duration used for svg shapes

    const animationDuration = 100;

    const width = donutState.size.width - sizeModifier;
    const height = donutState.size.height - sizeModifier;
    const radius = Math.min(width, height) / 2 - sizeModifier;
    const innerRadius = radius * 0.5;

    // Initialize the circle state
    donutState.donutCircle.x = width / 2;
    donutState.donutCircle.y = height / 2;
    donutState.donutCircle.radius = radius;
    donutState.donutCircle.innerRadius = innerRadius;

    d3.select("#mod-container svg").attr("width", width).attr("height", height);

    const svg = d3.select("#mod-container svg g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.absValue);


    const arc = d3
        .arc()
        .padAngle(0.1 / donutState.data.length)
        .innerRadius(innerRadius)
        .outerRadius(radius);


    // Join new data
    const sectors = svg.select("g#sectors").selectAll("path").data(pie(donutState.data), (d) => {
        return d.data.id;
    });

    let newSectors = sectors
        .enter()
        .append("svg:path")
        .attr("class", "sector")
        .on("click", function (d) {
            marker.select(d);
            d3.event.stopPropagation();
        })
        .on("mouseenter", function (d) {
            donutState.modControls.tooltip.show(d.data.tooltip());
        })
        .on("mouseleave", function () {
            donutState.modControls.tooltip.hide();
            d3.select(this).style("stroke", "none")
        })
        .on("mouseover", function (){
            d3.select(this).style("stroke", donutState.context.styling.general.font.color)
        })
        .attr("fill", () => "transparent");


    sectors
        .merge(newSectors)
        .attr("class", "sector")
        .transition()
        .duration(animationDuration)
        .attr("value", (d) => (d.data.absPercentage))
        .attr("fill", (d) => d.data.color)
        .attrTween("d", tweenArc)
        .attr("stroke", "none");

    sectors.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();

    svg.select("g#labels")
        .attr("pointer-events", "none")
        .selectAll("text")
        .data(pie(donutState.data), (d) => `label-${d.data.id}`)
        .join(
            (enter) => {
                return enter
                    .append("text")
                    .style("opacity", 0)
                    .attr("dy", "0.35em")
                    .attr("fill", donutState.context.styling.general.font.color)
                    .attr("font-family", donutState.context.styling.general.font.fontFamily)
                    .attr("font-weight", donutState.context.styling.general.font.fontWeight)
                    .attr("font-size", donutState.context.styling.general.font.fontSize)
                    .text((d) => (d.data.absPercentage + "%"))
                    .attr("text-anchor", "middle")
                    .attr("overflow", "visible")
                    .call((enter) =>
                        enter
                            .transition("add labels")
                            .duration(animationDuration)
                            .style("opacity", 1)
                            .attr("transform", calculateLabelPosition)
                    );
            },
            (update) =>
                update.call((update) =>
                    update
                        .transition("update labels")
                        .duration(animationDuration)
                        .style("opacity", 1)
                        .text((d) => (d.data.absPercentage + "%"))
                        .attr("transform", calculateLabelPosition)
                        .attr("fill", donutState.context.styling.general.font.color)

                ),
            (exit) => exit.transition("remove labels").duration(animationDuration).style("opacity", 0).remove()
        );

    d3
        .select("#centertext")
        .text("Sum: " + calculateMiddleText(donutState.data))
        .attr("fill", donutState.context.styling.general.font.color)
        .attr("font-family", donutState.context.styling.general.font.fontFamily)
        .attr("font-weight", donutState.context.styling.general.font.fontWeight)
        .attr("font-size", donutState.context.styling.general.font.fontSize)


    function tweenArc(elem) {
        let prevValue = this.__prev || {};
        let newValue = elem;
        this.__prev = elem;

        let i = d3.interpolate(prevValue, newValue);

        return function (value) {
            return arc(i(value));
        };
    }

    function calculateLabelPosition(data){
        let centeringFactor = radius * 0.75
        let centroid = arc.centroid(data)
        let x = centroid[0]
        let y = centroid[1]
        let h = Math.sqrt(x * x + y * y);
        return "translate(" + (x/h * centeringFactor) +  ',' + (y/h * centeringFactor) +  ")";

    }


    function calculateMiddleText(data) {
        let middleText = 0;
        for (let i = 0; i < data.length; i++) {
            middleText+= data[i].absValue;
        }
        return roundNumber(middleText, 2);
    }

    marker.drawRectangularSelection(donutState);

    sectors.exit().transition().duration(animationDuration).attr("fill", "transparent").remove();

    donutState.context.signalRenderComplete();
}
