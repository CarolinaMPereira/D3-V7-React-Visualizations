import React, { Component } from "react";
import * as d3 from "d3";

import { exampleData } from "../data/exampleData";

const KEY = 1;

class OneSidedBarChart extends Component {
  /** Draws chart once the component is mounted (in the beginning). */
  componentDidMount() {
    this.drawChart();
  }

  /** Keep track of currently selected bars */
  selectedBars = "";

  /** Style variables. */
  colorX = "#ED7D31";
  colorY = "#31a1ed";
  fillOpacity = "40%";

  /** JS object with data to be displayed. */
  dataset = exampleData;

  /** Parses data from the dataset to the desired format.
   * In order to get grouped bars, we "zip" the data together
   * in an array with the format [x1, y1, x2, y2, ..., xn, yn].
   * Returns [domain, data, keys, labels].
   * Inspired by: https://gist.github.com/erikvullings/51cc5332439939f1f292
   */
  getData() {
    // Data
    var data = [];
    // Numeric values only
    var domain = [];
    // Names of the datapoints
    var keys = [];
    // Parse data to keep x and y values in different arrays: [[x, key], [y, key]]
    // You can add in each array all the information about each datapoint you desire.
    // Here, we are adding the name of the datapoint along with the value of X or Y.
    // Note that you need to repeat that information both for X and Y.
    for (let i = 0; i < this.dataset.data.length; i++) {
      const element = this.dataset.data[i];
      data.push([element.x, element.key], [element.y, element.key]);
      domain.push(element.x);
      domain.push(element.y);
      keys.push(element.key);
    }
    // Save the labels for the axes as well.
    var labels = this.dataset.labels;
    return [d3.max(domain), data, keys, labels];
  }

  /**
   * Draws SVG one sided barchart (OSBC) using D3 v7.
   */
  drawChart() {
    // Dimensions for the chart
    const chartWidth = 500,
      barHeight = 30,
      groupHeight = barHeight * 2,
      gapBetweenGroups = 10,
      spaceForLabels = 50,
      spaceForLegend = 250,
      chartHeight = barHeight * 14 + gapBetweenGroups * 7;

    const [maxDomain, data, keys, labels] = this.getData();

    // Create color scale
    var color = d3.scaleOrdinal().range([this.colorX, this.colorY]);

    // Create x scale, in this case we are using the greater value as max
    var x = d3.scaleLinear().domain([0, maxDomain]).range([0, chartWidth]);

    // Create y scale
    var y = d3.scaleLinear().range([chartHeight + gapBetweenGroups, 0]);

    // Create axes
    var yAxis = d3.axisLeft().scale(y).tickFormat("").tickSize(0);

    var xAxis = d3
      .axisBottom(x)
      .tickFormat(function (d) {
        return d;
      })
      .tickSize(10);

    // Append the svg object to the designated element in the page
    var chart = d3
      .select("#barchart")
      .attr("width", spaceForLabels + chartWidth + spaceForLegend)
      .attr("height", chartHeight + 30);

    // Create bars, each at the correct position in the y axis
    var bar = chart
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function (d, i) {
        return (
          "translate(" +
          spaceForLabels +
          "," +
          (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i / 2))) +
          ")"
        );
      });

    // Create bars with correct width
    bar
      .append("rect")
      .attr("fill", function (d, i) {
        return color(i % 2);
      })
      .attr("fill-opacity", this.fillOpacity)
      .attr("class", "bar")
      .attr("width", function (d) {
        return x(d[0]);
      })
      .attr("height", barHeight - 1)
      .attr("id", function (d, i) {
        return i;
      });

    // Draw labels
    bar
      .append("text")
      .attr("class", "text-graph")
      .attr("fontFamily", "open sans")
      .attr("x", function (d) {
        return -15;
      })
      .attr("y", groupHeight / 2)
      .attr("dy", ".35em")
      .attr("dx", "-0.7em")
      .text(function (d, i) {
        if (i % 2 === 0) return keys[Math.floor(i / 2)];
        else return "";
      });

    // Add the y axis
    chart
      .append("g")
      .attr("class", "y axis")
      .attr(
        "transform",
        "translate(" + spaceForLabels + ", " + -gapBetweenGroups / 2 + ")"
      )
      .call(yAxis);

    // Add the x axis
    chart
      .append("g")
      .attr("class", "x axis")
      .attr("font-size", "14px")
      .attr(
        "transform",
        "translate(" + spaceForLabels + "," + chartHeight + ")"
      )
      .call(xAxis);

    // Change tick text style
    var ticks = d3.selectAll(".tick text");
    ticks.attr("class", "text-graph").attr("font-size", "14px");

    // Draw legend
    var legendRectSize = 18,
      legendSpacing = 4;

    var legend = chart
      .selectAll(".legend")
      .data(labels)
      .enter()
      .append("g")
      .attr("transform", function (d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = -gapBetweenGroups / 2;
        var horizontal = spaceForLabels + chartWidth + 40 - legendRectSize;
        var vertical = i * height - offset;
        return "translate(" + horizontal + "," + vertical + ")";
      });

    // Add squares with colors of the lines
    legend
      .append("rect")
      .classed("selected", false)
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .style("fill", function (d, i) {
        return color(i);
      })
      .style("fill-opacity", this.fillOpacity);

    // Add name of the domains
    legend
      .append("text")
      .attr("class", "text-graph")
      .attr("x", legendRectSize + legendSpacing)
      .attr("y", legendRectSize - legendSpacing)
      .text(function (d) {
        return d;
      });

    // Get all bars
    var rects = chart.selectAll(".bar");

    // Call event handlers
    rects.on("click", this.handleOnClick(chart));
    rects.on("mouseover", this.handleOnMouseOver(chart));
    rects.on("mouseleave", this.handleOnMouseLeave(chart));
  }

  /** Handles clicking on a group of bars. */
  handleOnClick(chart) {
    const component = this;
    return function (event, bar) {
      // Selects a group of bars, if not already selected
      if (!d3.select(this).classed("selected")) {
        selectedGroup = chart.selectAll("rect").filter(function (d) {
          if (d[KEY] === bar[KEY]) {
            component.selectedBars = d[KEY];
            return d;
          }
        });
        // Unselects all other groups
        notSelectedGroups = chart.selectAll("rect").filter(function (d) {
          if (d[KEY] !== bar[KEY]) {
            return d;
          }
        });

        // Highlights the selected group
        selectedGroup.style("fill-opacity", "100%");
        selectedGroup.classed("selected", true);

        // Resets other bars' style
        notSelectedGroups.style("fill-opacity", component.fillOpacity);
        notSelectedGroups.classed("selected", false);

        // Unselects the group, if already selected
      } else {
        var selectedGroup = chart.selectAll("rect").filter(function (d) {
          if (d[KEY] === bar[KEY]) {
            return d;
          }
        });
        var notSelectedGroups = chart.selectAll("rect").filter(function (d) {
          if (d[KEY] !== bar[KEY]) {
            return d;
          }
        });
        // Highlights the selected group
        selectedGroup.style("fill-opacity", component.fillOpacity);
        selectedGroup.classed("selected", false);

        // Resets other bars' style
        notSelectedGroups.style("fill-opacity", component.fillOpacity);
        notSelectedGroups.classed("selected", false);

        // Clears selected bars
        component.selectedBars = "";
      }
    };
  }

  /**  Handles mouse over event. */
  handleOnMouseOver(chart) {
    return function (event, bar) {
      var hoveredGroup = chart.selectAll("rect").filter(function (d) {
        if (d[KEY] === bar[KEY]) {
          return d;
        }
      });

      // Highlight hovered bar
      hoveredGroup.style("fill-opacity", "100%");
    };
  }

  /**  Handles mouse leave event. */
  handleOnMouseLeave(chart) {
    const component = this;
    return function (event, bar) {
      // Selected hovered group, unless it is the currently clicked one
      var hoveredGroup = chart.selectAll("rect").filter(function (d) {
        if (d[KEY] === bar[KEY] && d[KEY] !== component.selectedBars) {
          return d;
        }
      });

      // Reset style
      hoveredGroup.style("fill-opacity", component.fillOpacity);
    };
  }

  render() {
    return <svg className="graph" id={"barchart"}></svg>;
  }
}
export default OneSidedBarChart;
