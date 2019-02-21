import React, { Component } from 'react';

export default class PeerAudio extends Component {
    constructor() {
        super()
        this.state = {
            speaking: false
        }
    }

    componentDidMount() {
        this.audio.srcObject = this.props.media.stream
        console.log('------------ this.audio', this.audio)
    }

    render() {
        console.log('------------ this.props PEERAUDIO', this.props)
        return (
            <audio key={this.props.media.participantid} id={`audio-track ${this.props.media.participantid}`} autoPlay ref={audio => {this.audio = audio}} controls volume='true'></audio>
        );
    }
}