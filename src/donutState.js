import { resources } from "./resources";
import { roundNumber, calculatePercentageValue } from "./utility";

/**
 * Render the visualization
 * @param {Spotfire.Mod} mod API
 * @return {donutState}
 */
export async function createDonutState(mod) {
    /**
     * Initialize dataView, size, and context based on the mod API
     * @param {Spotfire.DataView} dataView
     * @param {Spotfire.Size} size
     * @param {Spotfire.RenderContext} context
     */
    const dataView = await mod.visualization.data();
    const size = await mod.windowSize();
    const context = await mod.getRenderContext();

    const centerAxisName = "Center value by";

    /**
     * Check for any errors.
     */
    let errors = await dataView.getErrors();
    if (errors.length > 0) {
        mod.controls.errorOverlay.show(errors, resources.errorOverlayCategoryDataView);
        // TODO clear DOM
        return;
    }

    mod.controls.errorOverlay.hide(resources.errorOverlayCategoryDataView);

    // Get the leaf nodes for the x hierarchy. We will iterate over them to
    // render the chart.
    let colorHierarchy = await dataView.hierarchy(resources.colorAxisName);
    if (colorHierarchy == null) {
        // Return and wait for next call to render when reading data was aborted.
        // Last rendered data view is still valid from a users perspective since
        // a document modification was made during a progress indication.
        return;
    }

    let colorRoot = await colorHierarchy.root();
    if (colorRoot == null) {
        // Return and wait for next call to render when reading data was aborted.
        // Last rendered data view is still valid from a users perspective since
        // a document modification was made during a progress indication.
        return;
    }

    let dataViewYAxis = await dataView.continuousAxis(resources.yAxisName);
    if (dataViewYAxis == null) {
        mod.controls.errorOverlay.show(resources.errorNoDataOnAxis(resources.yAxisName), resources.yAxisName);
        return;
    } else {
        mod.controls.errorOverlay.hide(resources.yAxisName);
    }

    let dataViewCenterAxis = await dataView.continuousAxis(centerAxisName);
    if (dataViewCenterAxis == null) {
        mod.controls.errorOverlay.show("No data on center axis.", centerAxisName);
        return;
    } else {
        mod.controls.errorOverlay.hide(resources.yAxisName);
    }
    // Awaiting and retrieving the Color and Y axis from the mod.
    let yAxis = await mod.visualization.axis(resources.yAxisName);
    const colorAxisMeta = await mod.visualization.axis(resources.colorAxisName);

    // Hide tooltip
    mod.controls.tooltip.hide();

    let colorLeaves = colorRoot.leaves();
    if (colorLeaves.length === 0) {
        // Return and wait for next call to render when reading data was aborted.
        // Last rendered data view is still valid from a users perspective since
        // a document modification was made during a progress indication.
        return;
    }

    let totalYSum = calculateTotalYSum(colorLeaves, resources.yAxisName);

    let data;
    try {
        data = colorLeaves.map((leaf) => {
            let rows = leaf.rows();
            let yValue = sumValue(rows, resources.yAxisName);
            let percentage = calculatePercentageValue(yValue, totalYSum);
            return {
                color: rows.length ? rows[0].color().hexCode : "transparent",
                value: yValue,
                absValue: Math.abs(yValue),
                id: leaf.key,
                percentage: percentage,
                absPercentage: Math.abs(percentage),
                mark: (m) => (m ? leaf.mark(m) : leaf.mark()),
                tooltip: () => {
                    /* Adding the display name from the colorAxis and yAxis to the tooltip,
                    to get the corresponding leaf data onto the tooltip. */
                    return (
                        "Ratio: " +
                        percentage +
                        "%" +
                        "\n" +
                        yAxis.parts[0].displayName +
                        ": " +
                        roundNumber(yValue, 2) +
                        "\n" +
                        colorAxisMeta.parts[0].displayName +
                        ": " +
                        leaf.formattedValue() +
                        "\n"
                    );
                }
            };
        });
    } catch (error) {
        console.error(error);
    }


    let totalYSum = calculateTotalYSum(colorLeaves, resources.yAxisName);

    let data = colorLeaves.map((leaf) => {
        let rows = leaf.rows();
        let yValue = sumValue(rows, resources.yAxisName);
        let centerSum = sumValue(rows, centerAxisName);
        let percentage = calculatePercentageValue(yValue, totalYSum, 1);
        return {
            color: rows.length ? rows[0].color().hexCode : "transparent",
            value: yValue,
            absValue: Math.abs(yValue),
            id: leaf.key,
            renderID: leaf.leafIndex,
            percentage: percentage.toFixed(1),
            absPercentage: Math.abs(percentage).toFixed(1),
            centerSum: centerSum,
            colorValue: leaf.formattedValue(),
            centerTotal: 0,
            mark: (m) => (m ? leaf.mark(m) : leaf.mark()),
            markedRowCount: () => leaf.markedRowCount(),
            tooltip: () => {
                /* Adding the display name from the colorAxis and yAxis to the tooltip,
                to get the corresponding leaf data onto the tooltip. */
                return (
                    "Ratio: " +
                    percentage +
                    "%" +
                    "\n" +
                    yAxis.parts[0].displayName +
                    ": " +
                    roundNumber(yValue, 2) +
                    "\n" +
                    colorAxisMeta.parts[0].displayName +
                    ": " +
                    leaf.formattedValue() +
                    "\n"
                );
            }
        };
    });

    /**
     * @typedef {donutState} donutState containing mod, dataView, size, data[], modControls, context
     */
    let donutState = {
        data: data,
        size: size,
        dataView: dataView,
        modControls: mod.controls,
        donutCircle: { x: 0, y: 0, radius: 0, innerRadius: 0 },
        context: context,
        clearMarking: () => dataView.clearMarking(),
        styles: {
            fontColor: context.styling.general.font.color,
            fontFamily:
                context.styling.general.font.fontFamily.indexOf(",") > -1
                    ? context.styling.general.font.fontFamily.split(",")[0]
                    : context.styling.general.font.fontFamily,
            fontWeight: context.styling.general.font.fontWeight,
            fontSize: context.styling.general.font.fontSize,
            fontStyle: context.styling.general.font.fontStyle,
            backgroundColor: context.styling.general.backgroundColor,
            lineStroke: context.styling.scales.line.stroke,
            tick: context.styling.scales.tick.stroke
        }
    };

    return donutState;
}

/**
 * Calculate the total value for an axis from a set of rows. Null values are treated as 0.
 * @param {Spotfire.DataViewRow[]} rows Rows to calculate the total value from
 * @param {string} axis Name of Axis to use to calculate the value.
 */
function sumValue(rows, axis) {
    return rows.reduce((p, c) => +c.continuous(axis).value() + p, 0);
}

/** Function sums the values of each leaf in the data
 * @param {leaves} leaves
 * @param {string} yAxisName
 * @return {Number} sumOfValues
 * */
function calculateTotalYSum(leaves, yAxisName) {
    let sumOfValues = 0;
    leaves.map((leaf) => {
        let rows = leaf.rows();
        let yValue = sumValue(rows, yAxisName);
        sumOfValues += Math.abs(yValue);
    });
    return sumOfValues;
}
