import React from 'react'
import socketIOClient from 'socket.io-client'

export type GeneralPromise = Promise<boolean> | Promise<string> | Promise<number> | null
export type UnknownFuction = (mixed) => mixed
// Type for RCTPeerConnection
type PeerConnection = {
    currentLocalDescription?: ?mixed,
    currentRemoteDescription?: ?mixed,
    iceConnectionState?: ?string,
    iceGatheringState?: ?string,
    localDescription?: ?string,
    onaddstream?: ?string,
    ondatachannel?: ?string,
    onicecandidate?: ?string,
    oniceconnectionstatechange?: ?string,
    onicegatheringstatechange?: ?string,
    onnegotiationneeded?: ?string,
    onremovestream?: ?string,
    onsignalingstatechange?: ?string,
    ontrack?: ?string,
    pendingLocalDescription?: ?string,
    pendingRemoteDescription?: ?string,
    remoteDescription?: ?string,
    signalingState?: ?string
}
// Type for socket declaration
type WebSocket = {
    acks: {},
    connected: boolean,
    disconnected: boolean,
    flags: {},
    id: string,
    ids: number,
    io: {},
    json: {},
    nsp: string,
    receiveBuffer: Array<mixed>,
    sendBuffer: Array<mixed>,
    subs: Array<{}>,
    _callbacks: {$connecting: Array<?UnknownFuction>, $connect: Array<?UnknownFuction>}
}
// Type for connectionStatus state object
type MediaStatus = { 
    active?: boolean,
    id?: string,
    onactive?: ?UnknownFuction,
    onaddtrack?: ?UnknownFuction,
    oninactive?: ?UnknownFuction,
    onremovetrack?: ?UnknownFuction,
    message?: string
} | null
type Props = {}
type State = {
    connectionStatus: MediaStatus
}

export default class Room extends React.Component<Props, State> {
    socket: WebSocket
    pc: PeerConnection
    
    constructor() {
        super()
        this.state = {
            connectionStatus: null
        }
    // Only need to specify server location for development since the app will be ran by the server once live.
        if(process.env.NODE_ENV === 'development') {
            this.socket = socketIOClient.connect('http://127.0.0.1:4020')
        } else {
            this.socket = socketIOClient.connect()
        }

        this.socket.emit("join", {
            data: this.state.connectionStatus
        })
    }

    componentDidMount() {
        this.accessUserMedia()
        this.init()
    }

    init() {
        this.pc = new RTCPeerConnection({iceServers: [{url: 'stun:stun.l.google.com:19302'}]})
        console.log('PC', this.pc)
    }

    async accessUserMedia() {
        let userMedia: GeneralPromise = navigator.mediaDevices ? await navigator.mediaDevices.getUserMedia({audio: true}) : null
        try {
            if(userMedia) {
                this.setState({
                    connectionStatus: userMedia
                })
            }
        } catch(error) {
            console.error(error)
        }
    }


    render() {
        console.info('STATE', this.state)
        console.log("SOCKET", this.socket)
        console.log(process.env.NODE_ENV)
        return (
            <div>
                Room
            </div>
        )
    }
}