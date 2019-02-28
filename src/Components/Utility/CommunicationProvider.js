import * as React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

// Type for connectionStatus state object
type MediaStatus = { 
    active?: boolean,
    id?: string,
    onactive?: ?MixedFunction,
    onaddtrack?: ?MixedFunction,
    oninactive?: ?MixedFunction,
    onremovetrack?: ?MixedFunction,
    message?: string
} | null

// Types for WebRTC configs
type MediaArray = () =>  Array<{stop: MixedFunction, enabled: mixed}>
type StreamObject = { getVideoTracks: MediaArray }

// Component props and state go here
type Props = {
    socket: WebSocket,
    children?: React.ChildrenArray<*>
}
type State = {
    connectionStatus: MediaStatus,
    openConnection: [] | null
}

// RTCPeerConnection variables
// const STUN: {urls: string} = {
//     urls: 'stun:stun.l.google.com:19302'
// }
// TODO: Figure out how to implement TURN
// const TURN: {urls: string, credential: string, username: string} = {
//     urls: 'turn:turn.bistri.com:80',
//     credential: 'homeo',
//     username: 'homeo',
// }
// const iceServers: {iceServers: Array<mixed>} = {
//     iceServers: [STUN],
// }

// This is not needed for current browsers?
// const DtlsSrtpKeyAgreement: {DtlsSrtpKeyAgreement: boolean} = {
//     DtlsSrtpKeyAgreement: true
// }
// const optional: {optional: Array<mixed>} = {
//     optional: [DtlsSrtpKeyAgreement]
// }


class CommunicationProvider extends React.Component<Props, State> {
    peerConnection: PeerConnection

    constructor(props: Props) {
        super(props)
        this.state = {
            successfulConnections: [],
            user: {}
        }
        this.newConnection = this.newConnection.bind(this)
        this.makeConnection = this.makeConnection.bind(this)
        this.props.socket.on('request', data => {
            console.log('-request data in room', data)
            // this.makeConnection(data)
        })
    }

    componentDidMount() {
    }

    async makeConnection(data) {
        const userMedia: PrimitivePromise = navigator.mediaDevices ? await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true}}) : null
        try {
            if(userMedia) {
                console.log('------------ this.state.user', this.state.user)
                if(this.state.user.connections.find(connection => connection.participantid !== data.openConnection)) {
                    const connection = this.initializeConnection(userMedia)
                    const userCopy = {...this.state.user}
                    userCopy.connections.push({id: connection.userid, participantid: data.openConnection})
                    this.setState({
                        user: userCopy
                    })
                    connection.sendParticipationRequest(data.openConnection)
                }
            }
        } catch(error) {
            console.log('------------ error', error)
        }
    }

    initializeConnection = (mediaStream) => {
        const connection = new PeerConnection(this.props.socket)

        connection.addStream(mediaStream)
        
        connection.onStreamAdded = (stream):void => {
            axios.get(`/api/stream?participantid=${stream.participantid}`).then(response => {
                console.log('------------ response.data', response.data)
                const peer = response.data
                console.log('[[[[ONSTREAMADDED]]]]', stream, this.state.successfulConnections)
                const newSuccessfulConnections = [...this.state.successfulConnections]
                newSuccessfulConnections.push(stream)

                this.setState({
                    successfulConnections: newSuccessfulConnections
                })
                this.props.socket.emit('updateConnection', {socketId: this.props.socket.id, openConnection: this.initializeConnection(mediaStream).userid, participantid: stream.participantid})
            })
        }

        connection.onUserFound = (userid) => {
            console.log('------------ userid', userid)
        }

        connection.onStreamEnded = () => {   
            console.log('------------ stream END')
        }

        connection.onParticipationRequest = (userid) => {
            console.warn('PARTICIPATION REQUEST FROM: ' + userid)
            connection.acceptRequest(userid)
            // this.props.socket.emit('updateConnection', {socketid: this.props.socket.id, connectionid: userid})
        }

        console.warn('NEW PEERCONNECTION MADE', connection)

        return connection  
    }

    async newConnection(username, room): void {
        const userMedia: PrimitivePromise = navigator.mediaDevices ? await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true}}) : null
        const usersInRoom = await axios.get(`/api/users-in-room?room=${room}`)
        try {
            if(userMedia && usersInRoom) {
                let connectionData = {
                        username,
                        room,
                        openConnection: null,
                        connections: [],
                        socketId: this.props.socket.id
                    }
                if(usersInRoom.data.length) {
                    // There are already users in the current room, send a connection request to each one's open connection
                    console.log('CURRENT USERS IN ROOM ====>', usersInRoom.data)
                    usersInRoom.data.forEach(user => {
                        let newConnection = this.initializeConnection(userMedia)
                        connectionData.openConnection = newConnection.userid
                        this.props.socket.emit('request', {...connectionData, to: user.socketId })
                        // console.log('+++++++ Sending participation request to: ', user.openConnection, " from: ", newConnection.userid)
                        // newConnection.sendParticipationRequest(user.openConnection)
                    })
                }

                this.props.socket.emit('join', connectionData)
                this.setState({
                    user: connectionData
                })
            }
        } catch(error) {
            console.error(error)
        }
    }

    render(): React.Node {
        console.groupCollapsed('MediaConfiguration')
        console.info('STATE', this.state)
        console.log('PROPS', this.props)
        console.groupEnd()

        const connectionTools: {accessUserMedia: MixedFunction, initialize: MixedFunction, acceptOffer: MixedFunction} = {
            newConnection: this.newConnection,
            successfulConnections: this.state.successfulConnections
        }

        const { children, socket } = this.props

        const childrenWithProps: Array<React.Node> = React.Children.map(children, (child: React.Element<any>, index: number): React.Node => React.cloneElement(child, { socket, ...connectionTools }))
        return (
            <>
                {childrenWithProps}
            </>
        )
    }
}

CommunicationProvider.propTypes = {
    socket: PropTypes.object.isRequired
}

export default CommunicationProvider

