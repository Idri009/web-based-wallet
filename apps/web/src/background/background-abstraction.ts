import { MESSAGE } from "../enums/message-enum";
import { RPC_METHODS } from "../enums/rpc-methods-enum";
import { Hashed } from "../utils/hashed";
import { walletStore } from "./wallet-state";

// type response = 
//     | {  }
//     | {  }

export class BackgroundProvider {

    private hashed: Hashed;

    // take hashed data input for using it further
    constructor(hashedData: Hashed) {
        this.hashed = new Hashed();
        this.hashed.initHashedWithData(hashedData);
    }

    //  <------------------ ENTRYPOINT ------------------>

    public async handleMessage(
        message: any,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void,
    ) {
        console.log("[BACKGROUND] handleMessage called: ", message);
        let response: any;
        try {

            switch (message.type) {
                case MESSAGE.WALLET_REQUEST:
                    this.handleWalletRequest(
                        {
                            method: message.method,
                            params: message.params,
                            id: message.id
                        },
                        sendResponse);
                    break;

                case MESSAGE.ENABLE_WALLET:
                    response = 'enable-wallet';
                    break;

                case MESSAGE.ETH_REQUEST:
                    response = 'eth-request';
                    break;

                case MESSAGE.IS_WALLET_UNLOCKED:
                    response = 'is-wallet-unlocked';
                    break;

                case MESSAGE.UNLOCK_WALLET:
                    response = 'unlock-wallet';
                    break;

                default:
                    response = 'UNKNOWN MESSAGE EVENT REQUEST';
                    this.sendResponse(response, sendResponse);
                    break;
            }

        } catch (error: unknown) {
            response = error instanceof Error ? error.message : 'Unknown error';
            this.sendResponse(response, sendResponse);
        }
    }

    private async handleWalletRequest(
        message: { method: string, params: any[], id: number },
        sendResponse: (response?: any) => void
    ) {

        let response: any;

        try {

            switch (message.method) {
                case RPC_METHODS.ETH_REQUEST_ACCOUNTS:
                    response = this.requestAccounts();
                    break;

                case RPC_METHODS.ETH_ACCOUNTS:
                    response = this.getAccounts();
                    break;

                case RPC_METHODS.ETH_CHAIN_ID:
                    response = this.getChainId();
                    break;

                case RPC_METHODS.WALLET_IS_UNLOCKED:
                    response = this.isWalletUnlocked();
                    break;

                case RPC_METHODS.ETH_SEND_TRANSACTION:
                    response = await this.sendTransaction(message.params[0]);
                    break;

                case RPC_METHODS.PERSONAL_SIGN:
                    response = 'personal-sign';
                    break;

                case RPC_METHODS.ETH_SIGN_TYPED_DATA_V4:
                    response = 'eth-sign-typed-data-v4';
                    break;

                case RPC_METHODS.WALLET_SWITCH_ETHEREUM_CHAIN:
                    response = 'wallet-switch-ethereum-chain';
                    break;

                case RPC_METHODS.WALLET_ADD_ETHEREUM_CHAIN:
                    response = 'wallet-add-ethereum-chain';
                    break;

                default:
                    response = 'UNKNOWN RPC METHOD';
                    break;
            }

        } catch (error: unknown) {
            response = error instanceof Error ? error.message : 'Unknown error';
        } finally {
            this.sendResponse(response, sendResponse);
        }

    }

    private requestAccounts(): string[] {
        if (!this.isWalletUnlocked()) {
            throw new Error("Wallet is locked");
        }
        return [this.hashed.getSelectedAccount().publicKey];
    }

    private getAccounts(): string[] {
        if (!this.isWalletUnlocked()) {
            throw new Error("Wallet is locked");
        }

        return [this.hashed.getSelectedAccount().publicKey];
    }

    private getChainId(): string {
        return this.hashed.getChainId();
    }

    private isWalletUnlocked(): boolean {
        const currentTimeStamp = Date.now();

        const lastUnlockedAt = walletStore.getState().lastUnlockedAt;
        const unlockDuration = walletStore.getState().unlockDuration;

        return (
            !!lastUnlockedAt &&
            currentTimeStamp - lastUnlockedAt < unlockDuration
        );
    }

    private async sendTransaction(txParams: any): Promise<string> {
        if (!this.isWalletUnlocked()) {
            throw new Error('Wallet is locked');
            // instead of throwing error pop a html tab to unlock then ask for approval for transaction
        }

        const approval = await this.requestApproval('transaction', txParams);

        if(!approval) {
            throw new Error('Transaction rejected by user');
        }

        return this.hashed.signTransaction(txParams, txParams).toString();

    }

    // private async personalSign(message: string, address: string): Promise<string> {

    // }

    // private async signTypedData(address: string, typedData: any): Promise<string> {

    // }

    // private async switchChain(chainId: string): Promise<null> {

    // }

    // private async addChain(chainParams: any): Promise<null> {

    // }

    // private async handleEthRequest(msg: { method: string, params?: any[] }) {

    // }

    private async requestApproval(type: string, data: any): Promise<boolean> {
        await chrome.storage.local.set({
            pendingRequest: { type, data, timestamp: Date.now() }
        });

        await this.popup();

        return new Promise<boolean>((resolve) => {
            const checkResponse = async () => {
                const result = await chrome.storage.local.get('requestResponse');
                if (!result.requestResponse) {
                    setTimeout(checkResponse, 100);
                }

                await chrome.storage.local.remove([
                    'requestResponse',
                    'pendingRequest'
                ]);
                resolve(result.requestResponse.approved);
            };
            checkResponse();
        })
    }

    private async popup() {
        return new Promise<void>((resolve) => {
            chrome.windows.create({
                url: "index.html",
                type: "popup",
                width: 357,
                height: 600,
            }),
                () => resolve()
        })
    }

    private sendResponse(response: any, sendResponse: (response?: any) => void) {
        sendResponse(response);
    }

}