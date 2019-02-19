import React, { Component } from 'react';
import Room from './Components/Room'
import TEST from './Components/TEST'
import SocketConfiguration from './Components/Utility/SocketConfiguration'
import CommunicationProvider from './Components/Utility/CommunicationProvider'
import MediaConfiguration from './Components/Utility/MediaConfiguration'
import './App.css';

type Props = {}
type State = {}

// Flow doesn't know that <MediaConfiguration> will receive the 'socket' prop from <SocketConfiguration>, so this needs to be supplied as a placeholder. When rendering, the actual socket will become the prop as intended.
export const emptySocket = {
    acks: {},
    connected: false,
    disconnected: true,
    flags: {},
    id: '', 
    ids: 0,
    io: {},
    json: {},
    nsp: '',
    receiveBuffer: [],
    sendBuffer: [],
    subs: [],
    _callbacks: {$connecting: [], $connect: []},
    send: () => null,
    emit: () => null,
    on: () => null
}

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
        <SocketConfiguration>
          <CommunicationProvider socket={emptySocket} >
            <Room socket={emptySocket}/>
          </ CommunicationProvider>
        </ SocketConfiguration>
      </div>
    );
  }
}

export default App;
