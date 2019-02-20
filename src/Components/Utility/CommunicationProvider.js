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
    accessUserMedia: (connection: {}) => Promise<mixed> | void

    constructor(props: Props) {
        super(props)
        this.state = {
            connectionStatus: null,
            rtcConnection: null
        }
        this.accessUserMedia = this.accessUserMedia.bind(this)
    }

    componentDidMount() {
    }

    answer = (userid: string): void => {
        this.answerConnection = new PeerConnection(this.props.socket)

                this.answerConnection.onStreamAdded = (element: {mediaElement: mixed}):void => {
            console.log('------------ element', element)
        } 
        this.answerConnection.sendParticipationRequest(userid)
    }

    initialize = (username, room): void => {
        const webRtcConnection = new PeerConnection(this.props.socket)
        this.setState({
            rtcConnection: webRtcConnection
        })
        // webRtcConnection.onStreamAdded = (element: {mediaElement: mixed}):void => {
        //     console.log('------------ element', element)
        // }
        this.accessUserMedia(webRtcConnection).then(() => {
            const streamData = {
                username,
                room,
                stream: this.state.connectionStatus,
                rtcConnection: this.state.rtcConnection
            }
            this.props.socket.emit('join', streamData)
        })
        // this.offerConnection.startBroadcasting()
    }

    async accessUserMedia(username, room): Promise<mixed> | void {
        let userMedia: PrimitivePromise = navigator.mediaDevices ? await navigator.mediaDevices.getUserMedia({audio: true}) : null
        const webRtcConnection = new PeerConnection(this.props.socket)
        console.log('------------ webRtcConnection', webRtcConnection)
        try {
            if(userMedia) {
                webRtcConnection.addStream(userMedia)
                this.setState({
                    connectionStatus: userMedia,
                    rtcConnection: webRtcConnection
                }, () => {
                    const streamData = {
                        username,
                        room,
                        stream: this.state.connectionStatus,
                        rtcConnection: this.state.rtcConnection
                    }
                    this.props.socket.emit('join', streamData)
                })
                return userMedia
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

        const connectionTools: {accessUserMedia: MixedFunction, initialize: MixedFunction, answer: MixedFunction} = {
            accessUserMedia: this.accessUserMedia,
            initialize: this.initialize,
            answer: this.answer,
            connectionStatus: this.state.connectionStatus,
            rtcConnection: this.state.rtcConnection
        }

        const { children, socket } = this.props

        const childrenWithProps: Array<React.Node> = React.Children.map(children, (child: React.Element<any>, index: number): React.Node => React.cloneElement(child, { socket, connectionTools }))
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

