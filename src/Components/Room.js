import * as React from 'react'
import hark from 'hark'

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
            speaking: false,
            users: []
        }
        this.props.socket.on('currentStreams', (data) => {
            console.log(data)
            this.setState({
                users: data
            })
        })
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps: Props) {
        if(prevProps.connectionTools !== this.props.connectionTools && this.props.connectionTools.connectionStatus) {
            this.audio.srcObject = this.props.connectionTools.connectionStatus
            const speech = hark(this.props.connectionTools.connectionStatus)
            speech.on('speaking', () => {
                this.setState({
                    speaking: true
                })
            })
            speech.on('stopped_speaking', () => {
                this.setState({
                    speaking: false
                })
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
        console.log('------------ this.props.connectionTools', this.props.connectionTools)
        this.props.connectionTools.accessUserMedia(username, room)
        const streamData = {
            username,
            room,
            stream: this.props.connectionTools.connectionStatus,
            rtcConnection: this.props.connectionTools.rtcConnection
        }
        // this.props.socket.emit('join', streamData)
    }

    render(): React.Node {
        console.log('------------ this.props', this.props)
        console.log('STATE', this.state)
        return (
            <div>
            Username:
                <input type="text" name='username' onChange={(e) => this.handleInput(e)} />
            Room:
                <input type='text' name='room' onChange={(e) => this.handleInput(e)} />
                <button onClick={this.joinRoom}>Join Room</button>
                <audio id='audio-track' autoPlay ref={audio => {this.audio = audio}} controls volume='true' type='MediaStream'></audio>
                {this.state.speaking &&
                <div style={{width: '100px', height: '200px', background: 'green'}}></div>
                }
            Users:
                {this.state.users.length && this.state.users.map(user => (
                    <div>User</div>
                    // <div onClick={this.props.connectionTools.answer(user.rtcConnection.userid)}>{user.userid}</div>
                ))}
            </div>
        )
    }
}
