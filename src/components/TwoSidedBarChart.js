import React, { Component } from "react";
import * as d3 from "d3";

import { exampleData } from "../data/exampleData";

class TwoSidedBarChart extends Component {
  /** Draws chart once the component is mounted (in the beginning). */
  componentDidMount() {
    this.drawChart();
  }

  /** JS object with data to be displayed. */
  dataset = exampleData;

  /** Info about current highlighted data. */
  selectedBars = "";

  /** Style variables. */
  colorX = "#ED7D31";
  colorY = "#31a1ed";
  fillOpacity = "40%";

  /** Parses data from the dataset to the desired format.
   * Returns [data, X and Y labels].
   */
  getData() {
    return [this.dataset.data, this.dataset.labels];
  }

  /**
   * Draws SVG two sided barchart (TSBC) using D3 v7.
   */
  drawChart() {
    var [data, labels] = this.getData();

    // Dimensions for the chart
    var width = 600,
      height = 400,
      gapBetweenGroups = 10,
      spaceForLabels = 50,
      margin = {
        top: 20,
        left: 20,
        right: 40,
        bottom: 40,
      };

    // Compute domains
    var xDomain = d3.max(data.map((d) => d.x));
    var yDomain = d3.max(data.map((d) => d.y));
    var domain = d3.max([xDomain, yDomain]);

    // Create x scale, x values will be negative because of divergence
    var x = d3.scaleLinear().domain([-domain, domain]).range([0, width]);

    // Create y scale
    var y = d3
      .scaleBand()
      .domain(data.map((d) => d.key))
      .range([0, height])
      .padding(0.2);

    // Append the svg object to the designated element in the page
    var svg = d3
      .select("#two-sided-barchart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var chart = svg.append("g");

    // Create one group per data entry, each holding two bars
    var positiveBars = chart.selectAll(".positive").data(data);

    positiveBars.exit().remove();

    positiveBars
      .enter()
      .append("rect")
      .attr("class", "positive")
      .attr("fill", this.colorY)
      .attr("fill-opacity", this.fillOpacity)
      .merge(positiveBars)
      .attr("x", x(0))
      .attr("y", (d) => y(d.key))
      .attr("width", (d) => x(d.y) - x(0))
      .attr("height", y.bandwidth());

    var negativeBars = chart.selectAll(".negative").data(data);
    negativeBars.exit().remove();
    negativeBars
      .enter()
      .append("rect")
      .attr("class", "negative")
      .attr("fill", this.colorX)
      .attr("fill-opacity", this.fillOpacity)
      .merge(negativeBars)
      .attr("x", (d) => x(-d.x))
      .attr("y", (d) => y(d.key))
      .attr("width", (d) => x(0) - x(-d.x))
      .attr("height", y.bandwidth());

    // Create x axis
    chart
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => Math.abs(d)));

    // Create y axis
    chart
      .append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(${x(0)}, 0)`)
      .call(d3.axisLeft(y));

    // Change tick text style
    var ticks = d3.selectAll(".tick text");
    ticks.attr("class", "text-graph").attr("font-size", "14px");

    // Create color scale
    var color = d3.scaleOrdinal().range([this.colorX, this.colorY]);

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
        var horz = spaceForLabels + width + 40 - legendRectSize;
        var vert = i * height - offset;
        return "translate(" + horz + "," + vert + ")";
      });

    // Add squares with colors of the lines
    legend
      .append("rect")
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
    var negRects = chart.selectAll(".negative");
    var posRects = chart.selectAll(".positive");

    // Call event handlers
    negRects.on("click", this.handleOnClick(chart));
    negRects.on("mouseover", this.handleOnMouseOver(chart));
    negRects.on("mouseleave", this.handleOnMouseLeave(chart));
    posRects.on("click", this.handleOnClick(chart));
    posRects.on("mouseover", this.handleOnMouseOver(chart));
    posRects.on("mouseleave", this.handleOnMouseLeave(chart));
  }

  /** Handles clicking on a group of bars. */
  handleOnClick(chart) {
    const component = this;
    return function (event, bar) {
      // Selects a group of bars, if not already selected
      if (!d3.select(this).classed("selected")) {
        selectedGroup = chart.selectAll("rect").filter(function (d) {
          if (d.key === bar.key) {
            component.selectedBars = d.key;
            return d;
          }
        });
        // Unselects all other groups
        notSelectedGroups = chart.selectAll("rect").filter(function (d) {
          if (d.key !== bar.key) {
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
          if (d.key === bar.key) {
            return d;
          }
        });
        var notSelectedGroups = chart.selectAll("rect").filter(function (d) {
          if (d.key !== bar.key) {
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
        if (d.key === bar.key) {
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
        if (d.key === bar.key && d.key !== component.selectedBars) {
          return d;
        }
      });

      // Reset style
      hoveredGroup.style("fill-opacity", component.fillOpacity);
    };
  }

  render() {
    return <svg className="graph" id={"two-sided-barchart"}></svg>;
  }
}
export default TwoSidedBarChart;
