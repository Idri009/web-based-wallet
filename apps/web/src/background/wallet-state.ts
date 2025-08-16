import { createStore } from "zustand/vanilla";
import type { Hashed } from "../utils/hashed";

export interface WalletState {
    hashed: Hashed | null;
    setHashed: (val: Hashed | null) => void;

    lastUnlockedAt: number | null;
    unlocked: () => void;

    unlockDuration: number;
    setUnlockDuration: (duration: number) => void;
}

export const walletStore = createStore<WalletState>((set) => ({

    hashed: null,
    setHashed: (val) => set({ hashed: val }),

    lastUnlockedAt: null,
    unlocked: () => set({
        lastUnlockedAt: Date.now()
    }),

    unlockDuration: 15 * 60 * 1000,
    setUnlockDuration: (duration: number) => set({
        unlockDuration: duration
    }),
}));


// import { MESSAGE } from "../enums/message-enum";
// import { RPC_METHODS } from "../enums/rpc-methods-enum";
// import { walletStore } from "./wallet-state";

// export class BackgroundProvider {
//     // take hashed data input for using it further
//     constructor(
//         private getHashed: () => any,                                  // read current wallet impl
//         private requestApproval: (type: string, data: any) => Promise<boolean>, // UI approvals
//         private notifyChainChanged: (chainId: string) => void           // fire CHAIN_CHANGED to tabs
//     ) { }

//     //  <------------------ ENTRYPOINT ------------------>
//     public async handleMessage(
//         message: any,
//         _sender: chrome.runtime.MessageSender,
//         sendResponse: (response?: any) => void,
//     ) {
//         console.log("[BACKGROUND] handleMessage called: ", message);

//         try {
//             switch (message.type) {
//                 case MESSAGE.WALLET_REQUEST:
//                     await this.handleWalletRequest(
//                         {
//                             method: message.method,
//                             params: message.params ?? [],
//                             id: message.id,
//                         },
//                         sendResponse,
//                     );
//                     break;

//                 case MESSAGE.ENABLE_WALLET:
//                     // return { success, address? }
//                     sendResponse(await this.handleEnableWallet());
//                     break;

//                 case MESSAGE.ETH_REQUEST:
//                     // generic passthrough to hashed if exists
//                     sendResponse(await this.handleEthRequest(message));
//                     break;

//                 case MESSAGE.IS_WALLET_UNLOCKED:
//                     sendResponse({ unlocked: this.isWalletUnlocked() });
//                     break;

//                 case MESSAGE.UNLOCK_WALLET:
//                     // (you likely set walletStore.lastUnlockedAt elsewhere)
//                     sendResponse({ ok: true });
//                     break;

//                 default:
//                     sendResponse({ error: "UNKNOWN MESSAGE EVENT REQUEST" });
//                     break;
//             }
//         } catch (error: any) {
//             sendResponse({ error: error?.message ?? "Unknown error" });
//         }
//     }

//     private async handleWalletRequest(
//         message: { method: string; params: any[]; id: number },
//         sendResponse: (response?: any) => void,
//     ) {
//         try {
//             let result: any;

//             switch (message.method) {
//                 case RPC_METHODS.ETH_REQUEST_ACCOUNTS:
//                     result = await this.requestAccounts();
//                     break;

//                 case RPC_METHODS.ETH_ACCOUNTS:
//                     result = this.getAccounts();
//                     break;

//                 case RPC_METHODS.ETH_CHAIN_ID:
//                     result = this.getChainId();
//                     break;

//                 case RPC_METHODS.WALLET_IS_UNLOCKED:
//                     result = this.isWalletUnlocked();
//                     break;

//                 case RPC_METHODS.ETH_SEND_TRANSACTION:
//                     result = await this.sendTransaction(message.params[0]);
//                     break;

//                 case RPC_METHODS.PERSONAL_SIGN:
//                     result = await this.personalSign(message.params[0], message.params[1]);
//                     break;

//                 case RPC_METHODS.ETH_SIGN_TYPED_DATA_V4:
//                     result = await this.signTypedData(message.params[1], message.params[0]);
//                     break;

//                 case RPC_METHODS.WALLET_SWITCH_ETHEREUM_CHAIN:
//                     result = await this.switchChain(message.params?.[0]?.chainId);
//                     break;

//                 case RPC_METHODS.WALLET_ADD_ETHEREUM_CHAIN:
//                     result = await this.addChain(message.params?.[0]);
//                     break;

//                 // --- dapps (e.g., Uniswap) ask these early:
//                 case "wallet_requestPermissions":
//                     // minimalist: grant eth_accounts
//                     result = [{ parentCapability: "eth_accounts" }];
//                     break;

//                 case "wallet_getPermissions":
//                     result = [{ parentCapability: "eth_accounts" }];
//                     break;

//                 default:
//                     throw new Error(`Unsupported method: ${message.method}`);
//             }

//             // always include id so inject can match pending request
//             sendResponse({ id: message.id, result });
//         } catch (error: any) {
//             sendResponse({ id: message.id, error: error?.message ?? "Request failed" });
//         }
//     }

//     private isWalletUnlocked(): boolean {
//         const currentTimeStamp = Date.now();

//         const lastUnlockedAt = walletStore.getState().lastUnlockedAt;
//         const unlockDuration = walletStore.getState().unlockDuration;

//         return !!lastUnlockedAt && currentTimeStamp - lastUnlockedAt < unlockDuration;
//     }

//     // ---------- helpers used by RPCs ----------

//     private getChainId(): string {
//         const hashed = this.getHashed();
//         return hashed?.getChainId?.() || "0x1"; // Default to Ethereum mainnet
//     }

//     private async requestAccounts(): Promise<string[]> {
//         if (!this.isWalletUnlocked()) throw new Error("Wallet is locked");
//         const hashed = this.getHashed();
//         const address = hashed?.getSelectedAccount?.();
//         if (!address) throw new Error("No accounts available");
//         return [address];
//     }

//     private getAccounts(): string[] {
//         if (!this.isWalletUnlocked()) return [];
//         const hashed = this.getHashed();
//         const address = hashed?.getSelectedAccount?.();
//         return address ? [address] : [];
//     }

//     private async sendTransaction(txParams: any): Promise<string> {
//         if (!this.isWalletUnlocked()) throw new Error("Wallet is locked");
//         const approved = await this.requestApproval("transaction", txParams);
//         if (!approved) throw new Error("Transaction rejected by user");

//         const hashed = this.getHashed();
//         if (typeof hashed?.sendTransaction !== "function") {
//             throw new Error("Transaction method not available");
//         }
//         return await hashed.sendTransaction(txParams);
//     }

//     private async personalSign(message: string, address: string): Promise<string> {
//         if (!this.isWalletUnlocked()) throw new Error("Wallet is locked");
//         const approved = await this.requestApproval("sign", { message, address });
//         if (!approved) throw new Error("Signing rejected by user");

//         const hashed = this.getHashed();
//         if (typeof hashed?.personalSign !== "function") {
//             throw new Error("Personal sign method not available");
//         }
//         return await hashed.personalSign(message, address);
//     }

//     private async signTypedData(address: string, typedData: any): Promise<string> {
//         if (!this.isWalletUnlocked()) throw new Error("Wallet is locked");
//         const approved = await this.requestApproval("signTypedData", { address, typedData });
//         if (!approved) throw new Error("Signing rejected by user");

//         const hashed = this.getHashed();
//         if (typeof hashed?.signTypedData !== "function") {
//             throw new Error("Sign typed data method not available");
//         }
//         return await hashed.signTypedData(address, typedData);
//     }

//     private async switchChain(chainId: string): Promise<null> {
//         const hashed = this.getHashed();
//         if (typeof hashed?.switchChain === "function") {
//             await hashed.switchChain(chainId);
//         }
//         this.notifyChainChanged?.(chainId);
//         return null;
//     }

//     private async addChain(chainParams: any): Promise<null> {
//         const approved = await this.requestApproval("addChain", chainParams);
//         if (!approved) throw new Error("Chain addition rejected by user");

//         const hashed = this.getHashed();
//         if (typeof hashed?.addChain !== "function") {
//             throw new Error("Add chain not available");
//         }
//         await hashed.addChain(chainParams);
//         return null;
//     }

//     // generic passthrough (used by MESSAGE.ETH_REQUEST)
//     private async handleEthRequest(msg: { method: string; params?: any[] }) {
//         const { method, params = [] } = msg;
//         const hashed = this.getHashed();
//         if (!hashed || typeof hashed[method] !== "function") {
//             return { error: "Method not supported or wallet not connected" };
//         }
//         try {
//             const result = await hashed[method](...params);
//             return { result };
//         } catch (e: any) {
//             return { error: e?.message ?? "Request failed" };
//         }
//     }

//     // enable-wallet
//     private async handleEnableWallet() {
//         const address = this.getHashed()?.getSelectedAccount?.();
//         return address ? { success: true, address } : { success: false };
//     }
// }
