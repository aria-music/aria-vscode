import * as vscode from 'vscode';
import { AriaConnector, TokenError, AriaConfig } from './types';
import { RESTConnector } from './connector';

export class AriaMusic implements vscode.Disposable {
    connector?: AriaConnector;

    constructor(private context: vscode.ExtensionContext) {
        this.registerVSCode();
        this.updateConnector();
    }

    registerVSCode() {
        // register config update handler
        this.context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => this.onConfigUpdate(e)));

        // register commands
        this.registerCommands();
    }

    registerCommands() {
        // TODO: use mappings?
        this.context.subscriptions.push(
            vscode.commands.registerCommand("aria-vscode.skip", () => this.cmdSkip()),
            vscode.commands.registerCommand("aria-vscode.pause", () => this.cmdPause()),
            vscode.commands.registerCommand("aria-vscode.resume", () => this.cmdResume())
        );
    }

    updateConnector() {
        this.dispose();
        const config = this.getConfig();

        // determine connecter to use
        // TODO: support WebSocket connector
        console.log('updating connector...');
        this.connector = new RESTConnector(config);
    }

    async dispatchAria(op: string, data?: {}) {
        console.log('start dispatch');
        if (!this.connector) {
            console.log('No connector. Ingore.');
            return;
        }

        try {
            console.log(`dispatch: ${op}, ${data}`);
            await this.connector.dispatch(op, data);
        } catch (e) {
            console.log(`dispatch failed: ${e.name}: ${e.message}`);
            if (e instanceof TokenError) {
                const selected = await vscode.window.showErrorMessage(
                    `Failed to authorize: ${e.message}`,
                    "Set Token",
                );
                if (selected) {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'aria-vscode.token');
                };
            } else {
                await vscode.window.showErrorMessage(`Failed to dispatch event: ${e.message}`);
            }
        }
    }

    onConfigUpdate(e: vscode.ConfigurationChangeEvent) {
        if (!e.affectsConfiguration('aria-vscode')) {
            return;
        }

        console.log('config updated for aria-vscode!');
        this.updateConnector();
    }

    getConfig(): AriaConfig {
        const rawConfig = vscode.workspace.getConfiguration('aria-vscode');
        return {
            restEndpoint: rawConfig.get('Endpoint') || '',
            wsEndpoint: rawConfig.get('websocketEndpoint') || '',
            token: rawConfig.get('token') || ''
        };
    }

    cmdSkip() {
        this.dispatchAria('skip');
    }

    cmdPause() {
        this.dispatchAria('pause');
    }

    cmdResume() {
        this.dispatchAria('resume');
    }

    dispose() {
        if (this.connector) {
            this.connector.close();
            this.connector = undefined;
        }
    }
}