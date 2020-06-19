// WebSocketConnector, RESTConnector

import axios, { AxiosInstance } from 'axios';
import { AriaConnector, AriaConfig, AriaEvent, TokenError } from './types';

export class RESTConnector implements AriaConnector {
    endpoint: string;
    private token: string;

    private cli!: AxiosInstance;

    constructor(config: AriaConfig) {
        this.endpoint = config.restEndpoint;
        this.token = config.token;

        this.cli = axios.create({
            baseURL: this.endpoint,
            timeout: 10000,
            // TODO: support in Aria Core API 2.0
            // headers: {
            //     Authorization: `Bearer ${this.token}`
            // }
        });
    }

    open() {}
    close() {}

    async dispatch(op: string, data?: {}) {
        if (!this.token) {
            throw new TokenError("Token is missing.");
        }
        return await this._doRequest(op, data);
    }

    registerCallback(callback: (event: AriaEvent) => void): () => void {
        return (() => {});
    }

    async _doRequest(op: string, data?: {}) {
        const payload: any = {
            token: this.token,
            op: op
        };
        if (data !== undefined) {
            payload.data = data;
        }
        try {
            await this.cli.post('', payload);
        } catch (e) {
            if (e.response?.status === 403) {
                throw new TokenError("Invalid token.");
            }
            throw e;
        }
    }
}
