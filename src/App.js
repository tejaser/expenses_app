import React, { Component } from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import _ from 'lodash';
import './App.css';
import expenseData from './data/expenses.json';
// console.log(expenseData);

var width = 900;
var height = 900;
var margin = { left: 20, top: 20, right: 20, bottom: 20 };
var radius = 7;

// d3 functions
var xScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6])
    .range([margin.left, width - margin.right]);
var colorScale = chroma.scale(['#53cf8d', '#f7d283', '#e85151']);
var amountScale = d3.scaleLog();

var simulation = d3
    .forceSimulation()
    .force('center', d3.forceCenter(width / 2, height / 2))
    // .force('charge', d3.forceManyBody())
    .force('collide', d3.forceCollide(radius))
    .force('x', d3.forceX(d => d.focusX))
    .force('y', d3.forceY(d => d.focusY))
    .stop();

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expenses: []
        };
        this.forceTick = this.forceTick.bind(this);
    }
    componentWillMount() {
        var expenses = _.chain(expenseData)
            .filter(d => d.Amount < 0)
            .map(d => {
                return {
                    amount: -d.Amount,
                    name: d.Description,
                    date: new Date(d['Trans Date'])
                };
            })
            .value();

        var row = -1;
        expenses = _.chain(expenses)
            .groupBy(d => d3.timeWeek.floor(d.date))
            .sortBy((expenses, week) => new Date(week))
            .map(expenses => {
                row += 1;
                return _.map(expenses, exp => {
                    return Object.assign(exp, {
                        focusX: xScale(exp.date.getDay()),
                        focusY: row * 120
                    });
                });
            })
            .flatten()
            .value();
        // console.log(expenses);

        //process data
        var amountExtent = d3.extent(expenses, d => d.amount);
        amountScale.domain(amountExtent);

        this.setState({ expenses });

        //
        simulation.on('tick', this.forceTick);
    }

    componentDidMount() {
        this.container = d3.select(this.refs.container);
        // height and width can be provided here as well, however if they are not changed much give directly on the
        // component itself.
        // console.log(this.refs.container, this.container);  // just to check what those selection are providing us
        this.renderCircles();
        simulation
            .nodes(this.state.expenses)
            .alpha(0.9)
            .restart();
    }

    renderCircles() {
        // now drawing circles
        this.circles = this.container.selectAll('circle').data(this.state.expenses, d => d.name);

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
    componentDidUpdate() {
        this.renderCircles();
    }
    render() {
        return <svg ref="container" width={width} height={height} />;
    }
}

export default App;
