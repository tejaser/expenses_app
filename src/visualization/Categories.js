import React, { Component } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
// console.log(expenseData);

var radiusScale = d3.scaleLinear().range([15, 50]);
var height = 600;
var margin = { left: 40, top: 20, right: 40, bottom: 20 };

var simulation = d3
  .forceSimulation()
  // .force('charge', d3.forceManyBody
  .velocityDecay(0.25)
  .alphaDecay(0.0025)
  .force('collide', d3.forceCollide().radius(d => d.radius + 10))
  .force('x', d3.forceX(d => d.focusX))
  .force('y', d3.forceY(d => d.focusY))
  .stop();

class Categories extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.forceTick = this.forceTick.bind(this);
    simulation.on('tick', this.forceTick);
  }
  componentDidMount() {
    this.container = d3.select(this.refs.container);
    this.calculateData();
    this.renderCircles();

    simulation
      .nodes(this.props.categories)
      .alpha(0.9)
      .restart();
  }
  componentDidUpdate() {
    // component
  }
  calculateData() {
    // all the calculation go here

    //first lets create domain for radius based on the total amount of expenses
    var radiusExtent = d3.extent(this.props.categories, category => category.total);
    console.log('radius extent:', radiusExtent);
    this.categories = _.map(this.props.categories, category => {
      return Object.assign(category, {
        radius: radiusScale(category.total),
        focusX: this.props.width / 2,
        focusY: height / 4
      });
    });
  }
  renderCircles() {
    // d3 rendering code goes here
    this.circles = this.container.selectAll('circles').data(this.categories);

    // exit
    this.circles.exit().remove();

    // enter
    var enter = this.circles.enter().append('g');
    enter
      .append('circle')
      .attr('fill', '#fff')
      .attr('stroke', '#666')
      .attr('stroke-width', 2);
    enter
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em');

    // enter + update
    this.circles = enter.merge(this.circles);
    this.circles.select('circle').attr('r', d => d.radius);
    this.circles.select('text').text(d => d.name);
  }
  forceTick() {
    this.circles.attr('transform', d => 'translate(' + [d.x, d.y] + ')');
  }
  render() {
    return <g ref="container" />;
  }
}

export default Categories;
