import React from 'react'
import io from 'socket.io-client'
import SimpleWebRTC from 'simplewebrtc'

export type GeneralPromise = Promise<boolean> | Promise<string> | Promise<number> | null
export type UnknownFuction = (mixed) => mixed
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
    constructor() {
        super()
        this.state = {
            connectionStatus: null
        }
    this.socket = io.connect()
    }

    componentDidMount() {
        this.accessUserMedia()
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
        console.info(this.state)
        return (
            <div>
                Room
            </div>
        )
    }
}