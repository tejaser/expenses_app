import React, { Component } from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import _ from 'lodash';

// console.log(expenseData);

var height = 600;
var margin = { left: 20, top: 20, right: 20, bottom: 20 };
var radius = 7;

// d3 functions
var xScale = d3.scaleBand().domain([0, 1, 2, 3, 4, 5, 6]);
var yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
var colorScale = chroma.scale(['#53cf8d', '#f7d283', '#e85151']);
var amountScale = d3.scaleLog();

var simulation = d3
    .forceSimulation()
    // .force('charge', d3.forceManyBody())
    .force('collide', d3.forceCollide(radius))
    .force('x', d3.forceX(d => d.focusX))
    .force('y', d3.forceY(d => d.focusY))
    .stop();

class Expenses extends Component {
    constructor(props) {
        super(props);
        this.forceTick = this.forceTick.bind(this);
        simulation.on('tick', this.forceTick);
    }
    componentWillMount() {
        xScale.range([margin.left, this.props.width - margin.right]);
        simulation.force('center', d3.forceCenter(this.props.width / 2, height / 2));
    }

    componentDidMount() {
        this.container = d3.select(this.refs.container);
        // height and width can be provided here as well, however if they are not changed much give directly on the
        // component itself.
        // console.log(this.refs.container, this.container);  // just to check what those selection are providing us
        this.calculateData();
        this.renderCircles();
        simulation
            .nodes(this.props.expenses)
            .alpha(0.9)
            .restart();
    }
    componentDidUpdate() {
        this.calculateData();
        // this.renderCircles();
    }
    calculateData() {
        var weeksExtent = d3.extent(this.props.expenses, d => d3.timeWeek.floor(d.date));
        yScale.domain(weeksExtent);

        this.expenses = _.chain(this.props.expenses)
            .groupBy(d => d3.timeWeek.floor(d.date))
            .map((expenses, week) => {
                week = new Date(week);
                return _.map(expenses, exp => {
                    return Object.assign(exp, {
                        focusX: xScale(exp.date.getDay()),
                        focusY: yScale(week)
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

    renderCircles() {
        // now drawing circles
        this.circles = this.container.selectAll('circle').data(this.expenses, d => d.name);

        // complete enter, update and exit pattern.

        // first we would need to carry out exit
        this.circles.exit().remove();

        // after exit it will be enter + update
        this.circles = this.circles
            .enter()
            .append('circle')
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
        return <svg ref="container" width={this.props.width} height={height} />;
    }
}

export default Expenses;
