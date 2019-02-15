import React, { Component } from 'react';

export default class TEST extends Component {
    render() {
        console.log('------------ this.props', this.props)
        return (
            <div>
                TEST
            </div>
        );
    }
}