import React, { Component } from 'react';
import hark from 'hark'

export default class PeerAudio extends Component {
    constructor() {
        super()
        this.state = {
            speaking: false
        }
    }

    componentDidMount() {
        const { stream } = this.props.media
        this.audio.srcObject = stream
        const speech = hark(stream)
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
        console.log('------------ this.audio', this.audio)
    }

    render() {
        return (
            <>
                <audio key={this.props.media.participantid} id={`audio-track ${this.props.media.participantid}`} autoPlay ref={audio => {this.audio = audio}} controls volume='true'></audio>
                {this.state.speaking && <div style={{ width: '200px', height: '200px', background: 'green' }}></div>}
            </>
        );
    }
}