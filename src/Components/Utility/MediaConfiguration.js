import * as React from 'react'
import PropTypes from 'prop-types'

// Component props and state go here
type Props = {
    socket: WebSocket,
    children?: React.ChildrenArray<*>
}
type State = {
    connectionStatus: MediaStatus,
    bridgeStatus: string
}

class MediaConfiguration extends React.Component<Props, State> {
    pc: RTCPeerConnection
    dc: RTCDataChannel
    remoteStream: StreamObject
    remoteVideo: { ...StreamObject, srcObject: {} }
    socket: WebSocket

    constructor() {
        super()
        this.state = {
            connectionStatus: null,
            bridgeStatus: 'none'
        }

        this.pc = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]})
        this.dc = this.pc.createDataChannel('chat')
        // this.stream = this.
    }

    componentDidMount(): void {
        this.accessUserMedia()
        this.props.socket.on('chat', this.onMessage)
    }

      onMessage = (message) => {
      if (message.type === 'offer') {
          // set remote description and answer
          this.pc.setRemoteDescription(new RTCSessionDescription(message));
          this.pc.createAnswer()
            .then(this.setDescription)
            .then(this.sendDescription)
            // .catch(this.handleError); // An error occurred, so handle the failure to connect

      } else if (message.type === 'answer') {
          // set remote description
          this.pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate') {
          // add ice candidate
          this.pc.addIceCandidate(
              new RTCIceCandidate({
                  sdpMLineIndex: message.mlineindex,
                  candidate: message.candidate
              })
          );
      }
  }

    setupDataHandlers = (): void => {
        this.dc.onmessage = (e: { data?: ?mixed }): void => {
            var msg = typeof e.data === 'string' ? JSON.parse(e.data) : 'No message!';
            console.log(`Received message over data channel: ${msg}`);
        };
        this.dc.onclose = (): void => {
            this.remoteStream.getVideoTracks()[0].stop();
            console.log('The Data Channel is Closed');
        };
    }

    setDescription = (description: RTCSessionDescriptionInit): void => {
        this.pc.setLocalDescription(description);
    }

    sendDescription = (): void => {
        this.props.socket.send(this.pc.localDescription);
    }

    sendData = (message: string) => {
        this.dc.send(JSON.stringify(message))
    }

    init = (): void => {
        const attachMediaIfReady = (): void => {
            this.dc = this.pc.createDataChannel('chat');
            this.setupDataHandlers();
            console.log('attachMediaIfReady')
            this.pc.createOffer()
                .then(this.setDescription)
                .then(this.sendDescription)
                .catch((error: mixed): void => console.error('Error trying to connect!', error)); // An error occurred, so handle the failure to connect
        }

        this.pc.onicecandidate = (e: { stream?: ?{ getVideoTracks: MediaArray } }) => {
            console.log('------------ on ice add stream', e)
            if(e.stream) {
                this.remoteStream = e.stream
                this.remoteVideo.srcObject = this.remoteStream = e.stream
                this.setState({
                    bridgeStatus: 'established'
                })
            }
        }

        this.pc.ondatachannel = (e: {channel: RTCDataChannel}) => {
            this.dc = e.channel
            this.setupDataHandlers() 
            this.dc.send(JSON.stringify(({
                peerMediaStream: {
                    audio: this.localStream.getVideoTracks()[0].enabled
                }
            })))
        }
    }


    async accessUserMedia(): Promise<mixed> | void {
        let userMedia: PrimitivePromise = navigator.mediaDevices ? await navigator.mediaDevices.getUserMedia({audio: true}) : null
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

    render(): React.Node {
        console.groupCollapsed('MediaConfiguration')
        console.info('STATE', this.state)
        console.log("SOCKET", this.socket)
        console.log('PC', this.pc)
        console.log('PROPS', this.props)
        console.groupEnd()

        const { children, socket } = this.props

        const childrenWithProps: Array<React.Node> = React.Children.map(children, (child: React.Element<any>, index: number): React.Node => React.cloneElement(child, { ...this.props }))
        return (
            <>
                {childrenWithProps}
            </>
        )
    }
}

MediaConfiguration.propTypes = {
    socket: PropTypes.object.isRequired
}

export default MediaConfiguration

