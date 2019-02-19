declare type PrimitivePromise = Promise<boolean> | Promise<string> | Promise<number> | null
declare type MixedFunction = (mixed, ?mixed) => mixed
declare type WebSocket = {
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
    send: MixedFunction,
    emit: MixedFunction,
    on: MixedFunction
}
declare type MediaStatus = { 
    active?: boolean,
    id?: string,
    onactive?: ?MixedFunction,
    onaddtrack?: ?MixedFunction,
    oninactive?: ?MixedFunction,
    onremovetrack?: ?MixedFunction,
    message?: string
} | null

// Types for WebRTC configs
declare type MediaArray = () =>  Array<{stop: MixedFunction, enabled: mixed}>
declare type StreamObject = { getVideoTracks: MediaArray }
declare type ConnectionTools = { accessUserMedia: MixedFunction, call: MixedFunction, answer: MixedFunction }