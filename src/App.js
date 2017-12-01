import React, { Component } from "react";
import * as d3 from "d3";
import "./App.css";

var expenses = [
  {
    name: "Coffee",
    amount: 5,
    date: new Date()
  },
  {
    name: "breakfast",
    amount: 30,
    date: new Date()
  },
  {
    name: "fuel",
    amount: 1000,
    date: new Date()
  },
  {
    name: "transport",
    amount: 80,
    date: new Date()
  }
];

var width = 900;
var height = 900;
var radius = 10;

var simulation = d3
  .forceSimulation()
  .force("center", d3.forceCenter(width / 2, height / 2))
  // .force("charge", d3.forceManyBody())
  .force("collide", d3.forceCollide(radius))
  .stop();

class App extends Component {
  constructor(props) {
    super();
    this.forceTick = this.forceTick.bind(this);
  }
  componentWillMount() {
    simulation.on("tick", this.forceTick);
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);
    // height and width can be provided here as well, however if they are not changed much give directly on the
    // component itself.
    // console.log(this.refs.container, this.container);  // just to check what those selection are providing us
    this.renderCircles();
    simulation
      .nodes(expenses)
      .alpha(0.9)
      .restart();
  }

  renderCircles() {
    // now drawing circles
    this.circles = this.container.selectAll("circle").data(expenses, d => d.name);

    // complete enter, update and exit pattern.

    // first we would need to carry out exit
    this.circles.exit().remove();

    // after exit it will be enter + update
    this.circles = this.circles
      .enter()
      .append("circle")
      .merge(this.circles)
      .attr("r", radius)
      .attr("opacity", 0.5);
  }
  forceTick() {
    console.log(this.circles.datum().x, this.circles.datum().y);
    this.circles.attr("cx", d => d.x).attr("cy", d => d.y);
  }
  componentDidUpdate() {
    this.renderCircles();
  }
  render() {
    return <svg ref="container" width={width} height={height} />;
  }
}

export default App;
