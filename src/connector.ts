// WebSocketConnector, RESTConnector

import axios, { AxiosInstance } from 'axios';
import { AriaConnector, AriaConfig, TokenError } from './types';

export class RESTConnector extends AriaConnector {
    endpoint: string;
    private token: string;

    private _cli!: AxiosInstance;

    constructor(config: AriaConfig) {
        super();
        this.endpoint = config.restEndpoint;
        this.token = config.token;

        this._cli = axios.create({
            baseURL: this.endpoint,
            timeout: 10000,
            // TODO: support in Aria Core API 2.0
            // headers: {
            //     Authorization: `Bearer ${this.token}`
            // }
        });
    }

    async dispatch(op: string, data?: {}) {
        if (!this.token) {
            throw new TokenError("Token is missing.");
        }
        return await this._doRequest(op, data);
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
            await this._cli.post('', payload);
        } catch (e) {
            if (e.response?.status === 403) {
                throw new TokenError("Invalid token.");
            }
            throw e;
        }
    }
}
