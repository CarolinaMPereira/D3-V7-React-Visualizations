import React, { Component } from "react";
import * as d3 from "d3";

import { exampleData } from "../data/exampleData";

class Scatterplot extends Component {
  /** Draws chart once the component is mounted (in the beginning). */
  componentDidMount() {
    this.drawChart();
  }

  /** Keep track of currently selected bars */
  selectedDots = "";

  /** Style variables. */
  colorHighlight = "#ED7D31";
  colorOriginal = "#31a1ed";
  fillOpacity = "55%";

  /** JS object with data to be displayed. */
  dataset = exampleData;

  /** Parses data from the dataset to the desired format.
   * Returns [data, X and Y labels].
   */
  getData() {
    return [this.dataset.data, this.dataset.labels];
  }

  /**
   * Draws SVG scatterplot using D3 v7.
   */
  drawChart() {
    var [data, labels] = this.getData();

    // Dimensions for the chart
    var width = 500,
      height = 500;

    // Append the svg object to the designated element in the page
    const chart = d3
      .select("#scatterplot")
      .attr("width", width)
      .attr("height", height)
      .append("g");

    // Compute values for domain
    var maxX = d3.max(data.map((d) => d.x));
    var maxY = d3.max(data.map((d) => d.y));

    // Add X axis
    const x = d3
      .scaleLinear()
      .domain([0, maxX + maxX * 0.1])
      .range([0, width]);

    // Add X axis key
    chart
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", 40)
      .attr("x", 520)
      .attr("class", "text-graph")
      .attr("font-size", 13)
      .text(labels[0])
      .style("fill", "black");

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([0, maxY + maxY * 0.1])
      .range([height, 0]);

    // Add Y axis key
    chart
      .append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", `rotate(270, 0, 0)`)
      .style("text-anchor", "middle")
      .attr("y", -45)
      .attr("x", -110)
      .attr("class", "text-graph")
      .attr("font-size", 13)
      .text(labels[1])
      .style("fill", "black");

    // Add dots
    const dot = chart
      .append("g")
      .selectAll("dot")
      .data(data)
      .join("circle")
      .attr("cx", function (d) {
        return x(d.x);
      })
      .attr("cy", function (d) {
        return y(d.y);
      })
      .attr("r", 5)
      .style("fill", this.colorOriginal);

    // Add text key in circle
    for (let i = 0; i < 7; i++) {
      chart
        .data(data)
        .append("text")
        .attr("class", "text-graph")
        .attr("fontFamily", "open sans")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .attr("x", x(data[i].x) + 10)
        .attr("y", y(data[i].y) - 6)
        .text(data[i].key);
    }

    // Change tick text style
    var ticks = d3.selectAll(".tick text");
    ticks.attr("class", "text-graph").attr("font-size", "14px");

    // Get all dots
    var dots = chart.selectAll("circle");

    // Call event handlers
    dots.on("click", this.handleOnClick(chart));
    dots.on("mouseover", this.handleOnMouseOver(chart));
    dots.on("mouseleave", this.handleOnMouseLeave(chart));
  }

  /** Handles clicking on a dot. */
  handleOnClick(chart) {
    const component = this;
    return function (event, dot) {
      // Selects a group of dots, if not already selected
      if (!d3.select(this).classed("selected")) {
        selectedDot = chart.selectAll("circle").filter(function (d) {
          if (d.key === dot.key) {
            component.selectedDots = d.key;
            return d;
          }
        });
        notSelectedDot = chart.selectAll("circle").filter(function (d) {
          if (d.key !== dot.key) {
            return d;
          }
        });

        // Highlights the selected dot
        selectedDot.style("fill", component.colorHighlight);
        selectedDot.classed("selected", true);

        // Resets other dots' styles
        notSelectedDot.style("fill", component.colorOriginal);
        notSelectedDot.classed("selected", false);

        // Unselects the dot, if already selected
      } else {
        var selectedDot = chart.selectAll("circle").filter(function (d) {
          if (d.key === dot.key) {
            return d;
          }
        });
        var notSelectedDot = chart.selectAll("circle").filter(function (d) {
          if (d.key !== dot.key) {
            return d;
          }
        });

        // Highlights the selected dot
        selectedDot.style("fill", component.colorOriginal);
        selectedDot.classed("selected", false);

        // Resets other dots' styles
        notSelectedDot.style("fill", component.colorOriginal);
        notSelectedDot.classed("selected", false);

        // Clears selected info
        component.selectedDots = "";
      }
    };
  }

  /** Handles mouse over event. */
  handleOnMouseOver(chart) {
    const component = this;
    return function (event, dot) {
      var hoveredDot = chart.selectAll("circle").filter(function (d) {
        if (d.key === dot.key) {
          return d;
        }
      });

      // Highlight hovered dot
      hoveredDot.style("fill", component.colorHighlight);
    };
  }

  /**  Handles mouse leave event. */
  handleOnMouseLeave(chart) {
    const component = this;
    return function (event, dot) {
      var hoveredDot = chart.selectAll("circle").filter(function (d) {
        if (d.key === dot.key && d.key !== component.selectedDots) {
          return d;
        }
      });

      // Reset style
      hoveredDot.style("fill", component.colorOriginal);
    };
  }

  render() {
    return <svg className="graph" id={"scatterplot"}></svg>;
  }
}
export default Scatterplot;
