import React, { Component } from "react";
import "./App.css";
import _ from "lodash";
import * as d3 from "d3";
import Expenses from "./visualization/Expenses";
import Categories from "./visualization/Categories";
import expenseData from "./data/expenses.json";
// console.log(expenseData);

var width = 600;
var height = 1200;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expenses: [],
      categories: [
        { name: "Groceries", expenses: [], total: 0 },
        { name: "Restaurants", expenses: [], total: 0 }
      ],
      selectedWeek: null
    };
    this.prevWeek = this.prevWeek.bind(this);
    this.nextWeek = this.nextWeek.bind(this);
    this.linkToCategory = this.linkToCategory.bind(this);
  }
  componentWillMount() {
    var expenses = _.chain(expenseData)
      .filter(d => d.Amount < 0)
      .map((d, i) => {
        return {
          id: i,
          amount: -d.Amount,
          name: d.Description,
          date: new Date(d["Trans Date"])
        };
      })
      .value();
    // default selected week will be the most recent week
    var selectedWeek = d3.max(expenses, exp => d3.timeWeek.floor(exp.date));
    // console.log(selectedWeek);
    this.setState({ expenses, selectedWeek });
  }
  prevWeek() {
    // to select prev than current week

    var selectedWeek = d3.timeWeek.offset(this.state.selectedWeek, -1);
    // console.log(selectedWeek);
    this.setState({ selectedWeek });
  }

  nextWeek() {
    // to select next than current week
    var selectedWeek = d3.timeWeek.offset(this.state.selectedWeek, +1);
    this.setState({ selectedWeek });
  }

  linkToCategory(expense, category) {
    category.expenses.push(expense);
    category.total = _.sumBy(category.expenses, "amount");

    this.forceUpdate();

    // console.log(category);
  }

  render() {
    var props = {
      width,
      linkToCategory: this.linkToCategory
    };
    var selectedWeek = d3.timeFormat("%B %d, %Y")(this.state.selectedWeek);
    return (
      <div className="App">
        <h2>
          <span className="weekChange" onClick={this.prevWeek}>
            {" "}
            &larr;{" "}
          </span>
          Week of {selectedWeek}
          <span className="weekChange" onClick={this.nextWeek}>
            {" "}
            &rarr;{" "}
          </span>
        </h2>
        <svg width={width} height={height}>
          <Categories {...props} {...this.state} />
          <Expenses {...props} {...this.state} />
        </svg>
      </div>
    );
  }
}

export default App;
