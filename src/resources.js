export const resources = {
    // Error messages
    errorNoDataOnAxis: (axis) => "No data on " + axis + " axis.",
    errorGeneralOverlay:
        "There was an issue with the mod's data; please try reloading. If it persists please check the mod's requirements.",
    errorNullDonutState: (donutState) => "donutState object is " + donutState,
    errorRendering:
        "There was an issue related to the rendering of the mod; please try reloading and check the console for more details.",
    errorCanvasContainerDimensions:
        "The dimensions of the canvas' container are too small. Please try increasing the canvas' size.",

    // Overlay error categories
    errorOverlayCategoryDataView: "DataView",
    errorOverlayCategoryGeneral: "General",

    // Axis-related
    yAxisName: "Sector size by",
    colorAxisName: "Color",
    centerAxisName: "Center value",

    // Popout settings menu: components' values
    popoutLabelsVisibleAllValue: "all",
    popoutLabelsVisibleMarkedValue: "marked",
    popoutLabelsVisibleNoneValue: "none",
    popoutLabelsPositionInsideValue: "inside",
    popoutLabelsPositionOutsideValue: "outside",
    popoutSortedPlacementOrderAscendingValue: "ascending",
    popoutSortedPlacementOrderDescendingValue: "descending",
    popoutCircleTypeWholeValue: "whole-circle",
    popoutCircleTypeSemiValue: "semi-circle",

    // Popout settings menu: components' text titles
    popoutLabelsHeading: "Show labels for",
    popoutLabelsVisibleAllText: "All",
    popoutLabelsVisibleMarkedText: "Marked rows",
    popoutLabelsVisibleNoneText: "None",
    popoutDisplayedLabelsDataHeading: "Show in labels",
    popoutDisplayedLabelsDataPercentageText: "Sector percentage",
    popoutDisplayedLabelsDataValueText: "Sector value",
    popoutDisplayedLabelsDataCategoryText: "Sector category",
    popoutLabelsPositionHeading: "Labels position",
    popoutLabelsPositionInsideText: "Inside chart",
    popoutLabelsPositionOutsideText: "Outside chart",
    popoutSortedPlacementHeading: "Sorting",
    popoutSortedPlacementCheckboxText: "Sort sectors by size",
    popoutSortedPlacementOrderAscendingText: "Sort sectors ascending",
    popoutSortedPlacementOrderDescendingText: "Sort sectors descending",
    popoutCircleTypeHeading: "Circle type",
    popoutCircleTypeWholeText: "Visualize whole circle",
    popoutCircleTypeSemiText: "Visualize semi-circle",

    // Popout settings menu: components' tooltip text
    popoutDisplayedLabelsDataPercentageTooltip: "Shows sector percentage",
    popoutDisplayedLabelsDataValueTooltip: "Shows sector value",
    popoutDisplayedLabelsDataCategoryTooltip: "Shows sector category",
    popoutSortedPlacementCheckboxTooltip: "Enable/disable sectors sorting"
};
