import * as React from 'react'
import PropTypes from 'prop-types'

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
    rtcConnection: {} | null
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
    offerConnection: PeerConnection
    answerConnection: PeerConnection
    peerConnection: PeerConnection
    accessUserMedia: (connection: {}) => Promise<mixed> | void

    constructor(props: Props) {
        super(props)
        this.state = {
            pendingConnections: [],
            successfulConnections: []
        }
        this.newPendingConnection = this.newPendingConnection.bind(this)
    }

    acceptOffer = (userid: string): void => {
        const accept = new PeerConnection(this.props.socket)
        accept.acceptRequest(userid)
    }

    makeOffer = (userid) => {
        console.log('++++++USERID+++++++', userid)
        const availableConnection = [...this.state.pendingConnections].shift()
        console.log('------------ availableConnection', availableConnection)
        availableConnection.sendParticipationRequest(userid)
    }

    async newPendingConnection(username, room): void {
        const userMedia: PrimitivePromise = navigator.mediaDevices ? await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true}}) : null
        try {
            if(userMedia) {
                const newConnection = new PeerConnection(this.props.socket)

                newConnection.addStream(userMedia)

                // newConnection.onStreamAdded = (stream):void => {
                //     const newPeerConnections = [...this.state.peerConnections, stream]
                //     this.setState({
                //         peerConnections: newPeerConnections
                //     })
                //     console.log('------------ STREAM', stream)
                // }

                newConnection.onStreamEnded = () => {
                    console.log('------------ stream END')
                }

                newConnection.onParticipationRequest = (userid) => {
                    console.warn('PARTICIPATION REQUEST')
                    newConnection.acceptRequest(userid)
                }

                this.setState(prevState => {
                    return { pendingConnections: [...prevState.pendingConnections, newConnection ]}
                })

                const connectionData = {
                    username,
                    room,
                    userid: newConnection.userid,
                    socketid: this.props.socket.id
                }

                this.props.socket.emit('join', connectionData)
            }
        } catch(error) {
            console.error(error)
        }
    }

    // async accessUserMedia(username: string, room: string): Promise<mixed> | void {
    //     let userMedia: PrimitivePromise = navigator.mediaDevices ? await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true}}) : null
    //     try {
    //         if(userMedia) {
    //             this.peerConnection.addStream(userMedia)
    //             this.setState({
    //                 rtcConnection: this.peerConnection
    //             }, () => {
    //                 const streamData = {
    //                     username,
    //                     room,
    //                     userid: this.peerConnection.userid,
    //                     socketid: this.props.socket.id
    //                 }
    //                 this.props.socket.emit('join', streamData)
    //             })
    //             return userMedia
    //         }
    //     } catch(error) {
    //         console.error(error)
    //     }
    // }

    render(): React.Node {
        console.groupCollapsed('MediaConfiguration')
        console.info('STATE', this.state)
        console.log('PROPS', this.props)
        console.groupEnd()

        const connectionTools: {accessUserMedia: MixedFunction, initialize: MixedFunction, acceptOffer: MixedFunction} = {
            newPendingConnection: this.newPendingConnection,
            acceptOffer: this.acceptOffer,
            makeOffer: this.makeOffer,
            pendingConnections: this.state.pendingConnections,
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

