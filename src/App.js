import React, { Component } from 'react';
// import Room from './Components/Room'
import TEST from './Components/TEST'
import SocketConfiguration from './Components/Utility/SocketConfiguration'
import MediaConfiguration from './Components/Utility/MediaConfiguration'
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
        {/* <Room /> */}
        <SocketConfiguration>
          <MediaConfiguration>
            <TEST />
          </ MediaConfiguration>
        </ SocketConfiguration>
      </div>
    );
  }
}

export default App;
