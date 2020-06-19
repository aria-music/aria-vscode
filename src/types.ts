export interface AriaConfig {
    restEndpoint: string;
    wsEndpoint: string;
    token: string;
}

// TODO: class is more suitable for this case i think
export interface AriaConnector {
    // open prepares Connector, then open connection
    // throws Exception if failed to open
    open(): void;
    close(): void;
    dispatch(op: string, data?: {}): Promise<any>;
    registerCallback(callback: (event: AriaEvent) => void): () => void;
}

export interface AriaEvent {
    event: string;
    data: {};
}

export class TokenError implements Error {
    name = "TokenError";
    constructor(public message: string) {}
}
