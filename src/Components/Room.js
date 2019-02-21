import * as React from 'react'
import hark from 'hark'
import PeerAudio from './Utility/PeerAudio'
import axios from 'axios'

// Component props and state go here
type Props = {
    socket: WebSocket,
    connectionTools: {}
}
type State = {
    username: string,
    room: string,
    speaking: boolean,
    users: Array<mixed>
}

export default class Room extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            username: '',
            room: '',
            users: [],
            audioTracks: []
        }

        // this.props.socket.on('roomUsers', (data) => {
        //     // New users array can't have any old users or current pending connections in it.
        //     const newUsers = data.filter(user => !this.state.users.find(person => person.userid === user.userid) && !this.props.pendingConnections.find(connection => connection.userid === user.userid))
        //     console.log('------------ newUsers', newUsers)
        //     if(newUsers.length) {
        //         newUsers.forEach(user => this.props.makeOffer(user.userid))
        //     }
        //     this.setState({
        //         users: data
        //     })
        // })

        this.props.socket.on('message', data => {
            // if(data.broadcasting && data.userid !== this.props.rtcConnection.userid) {
            //     this.props.makeOffer(data.userid)
            // }
            if(data.participationRequest && !this.props.pendingConnections.find(connection => connection.userid === data.userid)) {
                console.log('------------ data', data)
                this.props.acceptOffer(data.userid)
            }
        })

        // this.props.socket.on('pendingRequests', data => {
        //     console.log('------------ data', data)
        //     const offersForUser = data.filter(offer => offer.participationRequest && offer.to === this.props.rtcConnection.userid)
        //     offersForUser.forEach(offer => this.props.acceptOffer(offer.userid))
        // })

        this.props.socket.on('pendingOffers', data => {
            console.log('------------ OFFERS', data)
            console.log('------------ this.props.rtcConnection', this.props.rtcConnection)
        })
    }

    componentDidMount() {
   
    }

    makeOffersToCurrentUsers = () => {

    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if(prevProps.connectionTools !== this.props.connectionTools) {
            // this.audio.srcObject = this.props.rtcConnection.MediaStream
            // const speech = hark(this.props.connectionStatus)
            // speech.on('speaking', () => {
            //     this.setState({
            //         speaking: true
            //     })
            // })
            // speech.on('stopped_speaking', () => {
            //     this.setState({
            //         speaking: false
            //     })
            // })
        }
        if(prevProps.peerConnections !== this.props.peerConnections) {
            const audioElements = this.props.peerConnections.map((stream, key) => {
                return <PeerAudio key={key} media={stream} />
                // console.log('------------ this.audio', this.audio)
                // audioElement.srcObject = stream.stream

            })
            this.setState({
                audioTracks: audioElements
            })
        }
    }

    handleInput = (e: {target: {value: string, name: string}}): void => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    joinRoom = (): void => {
        const { username, room } = this.state
        if(!this.state.users.find(user => user ? user.socketid === this.props.socket.id : false)) {
            this.props.newPendingConnection(username, room)
        }
        // const streamData = {
        //     username,
        //     room,
        //     stream: this.props.connectionStatus,
        //     rtcConnection: this.props.rtcConnection
        // }
        // this.props.socket.emit('join', streamData)
    }

    render(): React.Node {
        console.log('------------ this.props', this.props)
        console.log('STATE', this.state)
        const userList = []
        
        return (
            <div>
            Username:
                <input type="text" name='username' onChange={(e) => this.handleInput(e)} />
            Room:
                <input type='text' name='room' onChange={(e) => this.handleInput(e)} />
                <button onClick={this.joinRoom}>Join Room</button>
                {this.state.audioTracks}
                {/* <audio id={`audio-track`} ref={audio => {this.audio = audio}} controls volume='true' type='MediaStream'></audio> */}
                {this.state.speaking &&
                <div style={{width: '100px', height: '200px', background: 'green'}}></div>
                }
            Users:
                {this.state.users.length && this.state.users.map((user,index) => {
                        return(
                        <div key={index}>{user.username}</div>
                        // <div onClick={this.props.answer(user.rtcConnection.userid)}>{user.userid}</div>
                        )
                    }
                )}
            </div>
        )
    }
}
