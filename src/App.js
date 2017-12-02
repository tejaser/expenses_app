import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import Expenses from './visualization/Expenses';
import expenseData from './data/expenses.json';
// console.log(expenseData);

var width = 900;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { expenses: [] };
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
        this.setState({ expenses });
    }

    render() {
        var props = {
            width
        };
        return <Expenses {...props} {...this.state} />;
    }
}

export default App;
