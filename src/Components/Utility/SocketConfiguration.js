import * as React from 'react'
import socketIOClient from 'socket.io-client'
import type {MixedFunction} from '../../FlowTypes'

// Type for socket declaration
export type WebSocket = {
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
    _callbacks: {$connecting: Array<?MixedFunction>, $connect: Array<?MixedFunction>},
    send: MixedFunction
}

// Component Props type
type Props = {
    children?: React.ChildrenArray<*>,
}


export default class SocketConfiguration extends React.Component<Props> {
    socket: WebSocket

    constructor() {
        super()

    // Only need to specify server location for development since the app will be ran by the server once live.
        if(process.env.NODE_ENV === 'development') {
            this.socket = socketIOClient.connect('http://127.0.0.1:4020')
        } else {
            this.socket = socketIOClient.connect()
        } 

        this.socket.emit("join", {
            data: 'Joined!'
        })
    }

    render(): React.Node {
        console.groupCollapsed('SocketConfiguration')
        console.log('------------ this.socket', this.socket)
        console.groupEnd()

        const { children } = this.props
        const { socket } = this

        const childrenWithProps: Array<React.Node> = React.Children.map(children, (child: React.Element<any>, index: number): React.Node => React.cloneElement(child, { socket }))

        return (
            <>
                {childrenWithProps}
            </>
        )
    }
}