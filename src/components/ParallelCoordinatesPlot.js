import React, { Component } from "react";
import * as d3 from "d3";

import { exampleData } from "../data/exampleData";

class ParallelCoordinatesPlot extends Component {
  /** Draws chart once the component is mounted (in the beginning). */
  componentDidMount() {
    this.drawChart();
  }

  /** Keep track of currently selected bars */
  selectedLine = "";

  /** Style variables. */
  colorHighlight = "#ED7D31";
  colorOriginal = "#31a1ed";
  fillOpacity = "40%";
  strokeWidth = 2.5;
  highlightStroke = 4;

  /** JS object with data to be displayed. */
  dataset = exampleData;

  /** Parses data from the dataset to the desired format.
   * Returns [data, X and Y labels].
   */
  getData() {
    return [this.dataset.data, this.dataset.labels];
  }

  /**
   * Draws SVG parallel coordinates plot (PCP) using D3 v7.
   */
  drawChart() {
    const [data, labels] = this.getData();

    // Dimensions for the chart
    const margin = { top: 30, right: 10, bottom: 10, left: 10 },
      width = 700 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // Append the svg object to the designated element in the page
    const svg = d3
      .select("#parallel-coordinates-plot")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Compute domain for y axes
    var minDomainX = d3.min(data.map((d) => d.x));
    var maxDomainX = d3.max(data.map((d) => d.x));
    var minDomainY = d3.min(data.map((d) => d.y));
    var maxDomainY = d3.max(data.map((d) => d.y));

    // Build a linear scale for y axis (X values)
    const y1 = d3
      .scaleLinear()
      .domain([minDomainX, maxDomainX])
      .range([height, 0]);

    // Build a linear scale for y axis (Y values)
    const y2 = d3
      .scaleLinear()
      .domain([minDomainY, maxDomainY])
      .range([height, 0]);

    // Build the X scale -> it find the best position for each Y axis
    const x = d3.scalePoint().range([0, width]).padding(1).domain(labels);

    /** Gets coordinates to build each line.
     * Takes a datapoint and returns the key (name of x or y) and it's value.
     */
    function path(d) {
      return d3.line()(
        labels.map(function (key) {
          var i = labels.indexOf(key, 0);
          if (i === 0) {
            // the key is the name of the x value
            return [x(key), y1(d.x)];
          } else {
            // the key is the name of the Y value
            return [x(key), y2(d.y)];
          }
        })
      );
    }

    // Draw the lines
    svg
      .selectAll("linePath")
      .data(data)
      .join("path")
      .attr("id", function (d, i) {
        return "linePath_" + i;
      })
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", this.colorOriginal)
      .style("stroke-width", this.strokeWidth)
      .style("opacity", this.fillOpacity)
      .attr("class", "linePath");

    // Add labels on lines
    for (let i = 0; i < 7; i++) {
      svg
        .data(data)
        .append("text")
        .attr("dy", "-0.2em")
        .attr("class", "text-graph")
        .append("textPath")
        .attr("xlink:href", function (d) {
          return "#linePath_" + i;
        })
        .style("text-anchor", "middle")
        .attr("startOffset", "25%")
        .text(function (d) {
          return data[i].key;
        });
    }

    // Draw first axis
    svg
      .append("g")
      .attr("transform", "translate(" + x(labels[0]) + ")")
      .call(d3.axisLeft(y1).tickSize(10))
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -15)
      .attr("class", "text-graph")
      .attr("font-size", 14)
      .text(labels[0])
      .style("fill", "black");

    // Draw the second axis
    svg
      .append("g")
      .attr("transform", "translate(" + x(labels[1]) + ")")
      .call(d3.axisRight(y2).tickSize(15))
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -15)
      .attr("class", "text-graph")
      .attr("font-size", 14)
      .text(labels[1])
      .style("fill", "black");

    // Change tick text style
    var ticks = d3.selectAll(".tick text");
    ticks.attr("class", "text-graph").attr("font-size", 14);

    // Get all lines
    var lines = svg.selectAll(".linePath");

    // Call event handlers
    lines.on("click", this.handleOnClick(svg));
    lines.on("mouseover", this.handleOnMouseOver(svg));
    lines.on("mouseleave", this.handleOnMouseLeave(svg));
  }

  /** Handles clicking on a line. */
  handleOnClick(chart) {
    const component = this;
    return function (event, line) {
      // Selects a line, if not already selected
      if (!d3.select(this).classed("selected")) {
        selectedLine = chart.selectAll(".linePath").filter(function (d) {
          if (d.key === line.key) {
            component.selectedLine = d.key;
            return d;
          }
        });
        notSelectedLines = chart.selectAll(".linePath").filter(function (d) {
          if (d.key !== line.key) {
            return d;
          }
        });

        // Highlights the selected line
        selectedLine.style("opacity", "100%");
        selectedLine.style("stroke-width", component.highlightStroke);
        selectedLine.style("stroke", component.colorHighlight);
        selectedLine.classed("selected", true);

        // Resets other lines' styles
        notSelectedLines.style("opacity", component.fillOpacity);
        notSelectedLines.style("stroke-width", component.strokeWidth);
        notSelectedLines.style("stroke", component.colorOriginal);
        notSelectedLines.classed("selected", false);

        // Unselects the line, if already selected
      } else {
        var selectedLine = chart.selectAll(".linePath").filter(function (d) {
          if (d.key === line.key) {
            return d;
          }
        });
        var notSelectedLines = chart
          .selectAll(".linePath")
          .filter(function (d) {
            if (d.key !== line.key) {
              return d;
            }
          });

        // Highlights the selected line
        selectedLine.style("opacity", component.fillOpacity);
        selectedLine.style("stroke-width", component.strokeWidth);
        selectedLine.style("stroke", component.colorOriginal);
        selectedLine.classed("selected", false);

        // Resets other lines' styles
        notSelectedLines.style("opacity", component.fillOpacity);
        notSelectedLines.style("stroke-width", component.strokeWidth);
        notSelectedLines.style("stroke", component.colorOriginal);
        notSelectedLines.classed("selected", false);

        // Clears selected info
        component.selectedLine = "";
      }
    };
  }

  /**  Handles mouse over event. */
  handleOnMouseOver(chart) {
    const component = this;
    return function (event, line) {
      component.start = new Date().getTime();
      var hoveredGroup = chart.selectAll(".linePath").filter(function (d) {
        if (d.key === line.key) {
          return d;
        }
      });

      // Highlight hovered bar
      hoveredGroup.style("opacity", "100%");
      hoveredGroup.style("stroke-width", component.highlightStroke);
      hoveredGroup.style("stroke", component.colorHighlight);
    };
  }

  /**  Handles mouse leave event. */
  handleOnMouseLeave(chart) {
    const component = this;
    return function (event, line) {
      var hoveredGroup = chart.selectAll(".linePath").filter(function (d) {
        if (d.key === line.key && d.key !== component.selectedLine) {
          return d;
        }
      });

      // Reset style
      hoveredGroup.style("opacity", component.fillOpacity);
      hoveredGroup.style("stroke-width", component.strokeWidth);
      hoveredGroup.style("stroke", component.colorOriginal);
    };
  }

  render() {
    return (
      <svg
        className="graph"
        id={"parallel-coordinates-plot"}
        height="500px"
      ></svg>
    );
  }
}
export default ParallelCoordinatesPlot;
