export interface AriaConfig {
    restEndpoint: string;
    wsEndpoint: string;
    token: string;
}

export abstract class AriaConnector {
    open() {};
    close() {};
    dispatch(op: string, data?: {}): Promise<any> {
        return new Promise(() => {});
    };
    registerCallback(callback: (event: AriaEvent) => void) {};
}

export interface AriaEvent {
    event: string;
    data: {};
}

export class TokenError implements Error {
    name = "TokenError";
    constructor(public message: string) {}
}
