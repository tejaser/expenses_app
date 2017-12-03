import React, { Component } from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import _ from 'lodash';

// console.log(expenseData);

var height = 500;
var margin = { left: 40, top: 20, right: 40, bottom: 20 };
var radius = 7;

// d3 functions
var daysOfWeek = [[0, 'Sun'], [1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat']];
var xScale = d3.scaleBand().domain(_.map(daysOfWeek, 0));
var yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
var colorScale = chroma.scale(['#53cf8d', '#f7d283', '#e85151']);
var amountScale = d3.scaleLog();

var simulation = d3
  .forceSimulation()
  // .force('charge', d3.forceManyBody
  .velocityDecay(0.25)
  .alphaDecay(0.0025)
  .force('collide', d3.forceCollide(radius))
  .force('x', d3.forceX(d => d.focusX))
  .force('y', d3.forceY(d => d.focusY))
  .stop();

class Expenses extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.forceTick = this.forceTick.bind(this);
  }
  componentWillMount() {
    xScale.range([margin.left, this.props.width - margin.right]);
    // simulation.force('center', d3.forceCenter(this.props.width / 2,));
    simulation.on('tick', this.forceTick);
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);
    // height and width can be provided here as well, however if they are not changed much give directly on the
    // component itself.
    // console.log(this.refs.container, this.container);  // just to check what those selection are providing us
    this.calculateData();
    this.renderDays();
    this.renderWeeks();
    this.renderCircles();
    simulation
      .nodes(this.props.expenses)
      .alpha(0.9)
      .restart();
  }
  componentDidUpdate() {
    this.calculateData();
    this.renderCircles();
    simulation
      .nodes(this.props.expenses)
      .alpha(0.9)
      .restart();
  }
  calculateData() {
    var weeksExtent = d3.extent(this.props.expenses, d => d3.timeWeek.floor(d.date));
    yScale.domain(weeksExtent);

    var selectedWeekRadius = (this.props.width - margin.left - margin.right) / 2;
    var perAngle = Math.PI / 6;

    // rectangle for each weeksExtent
    var weeks = d3.timeWeek.range(weeksExtent[0], d3.timeWeek.offset(weeksExtent[1], 1));
    this.weeks = _.map(weeks, week => {
      return {
        week,
        x: margin.left,
        y: yScale(week) + height
      };
    });
    console.log(this.weeks);
    // circles for the back of each day in semi-circle
    this.days = _.map(daysOfWeek, date => {
      var [dayOfWeek, name] = date;
      var angle = Math.PI - perAngle * dayOfWeek;
      var x = selectedWeekRadius * Math.cos(angle) + this.props.width / 2;
      var y = selectedWeekRadius * Math.sin(angle) + margin.top;
      return {
        name,
        x,
        y
      };
    });
    // console.log(this.days);

    this.expenses = _.chain(this.props.expenses)
      .groupBy(d => d3.timeWeek.floor(d.date))
      .map((expenses, week) => {
        week = new Date(week);
        return _.map(expenses, exp => {
          var dayOfWeek = exp.date.getDay();
          var focusX = xScale(dayOfWeek);
          var focusY = yScale(week) + height;
          if (week.getTime() === this.props.selectedWeek.getTime()) {
            var angle = Math.PI - perAngle * dayOfWeek;
            focusX = selectedWeekRadius * Math.cos(angle) + this.props.width / 2;
            focusY = selectedWeekRadius * Math.sin(angle) + margin.top;
          }
          return Object.assign(exp, {
            focusX,
            focusY
          });
        });
      })
      .flatten()
      .value();
    // console.log(expenses);

    //process data
    var amountExtent = d3.extent(this.expenses, d => d.amount);
    amountScale.domain(amountExtent);
  }

  renderDays() {
    var days = this.container
      .selectAll('.day')
      .data(this.days, d => d.name)
      .enter()
      .append('g')
      .classed('day', true)
      .attr('transform', d => 'translate(' + [d.x, d.y] + ')');

    var daysRadius = 50;
    var fontSize = 12;
    days
      .append('circle')
      .attr('r', daysRadius)
      .attr('fill', '#ccc')
      .attr('opacity', 0.25);
    days
      .append('text')
      .attr('y', daysRadius + fontSize)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#999')
      .style('font-weight', 600)
      .text(d => d.name);
  }
  renderWeeks() {
    // console.log('hello');
    var weeks = this.container
      .selectAll('.week')
      .data(this.weeks, d => d.name)
      .enter()
      .append('g')
      .classed('week', true)
      .attr('transform', d => 'translate(' + [d.x, d.y] + ')');

    var rectHeight = 10;
    weeks
      .append('rect')
      .attr('width', this.props.width - margin.left - margin.right)
      .attr('y', -rectHeight / 2)
      .attr('height', rectHeight)
      .attr('fill', '#ccc')
      .attr('opacity', 0.25);

    var weekFormat = d3.timeFormat('%m/%d');
    weeks
      .append('text')
      .attr('text-anchor', 'end')
      .attr('dy', '.35em')
      .attr('fill', '#999')
      .text(d => weekFormat(d.week));
  }
  renderCircles() {
    // now drawing circles
    this.circles = this.container.selectAll('.expense').data(this.expenses, d => d.name);

    // complete enter, update and exit pattern.

    // first we would need to carry out exit
    this.circles.exit().remove();

    // after exit it will be enter + update
    this.circles = this.circles
      .enter()
      .append('circle')
      .classed('expense', true)
      .attr('r', radius)
      .attr('fill-opacity', 0.25)
      .attr('stroke-width', 3)
      .merge(this.circles)
      .attr('fill', d => colorScale(amountScale(d.amount)))
      .attr('stroke', d => colorScale(amountScale(d.amount)));
  }
  forceTick() {
    // console.log(this.circles.datum().x, this.circles.datum().y);
    this.circles.attr('cx', d => d.x).attr('cy', d => d.y);
  }

  render() {
    return <svg ref="container" width={this.props.width} height={2 * height} />;
  }
}

export default Expenses;
