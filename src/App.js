import React, { Component } from 'react';
import Room from './Components/Room'
import './App.css';

type Props = {}
type State = {}

class App extends Component<Props, State> {
  state = {

  }

  multiply  = (x: number, y: number): number => {
    return 0
  }

  render() {
    return (
      <div>
        Audition
        <Room />
      </div>
    );
  }
}

export default App;
