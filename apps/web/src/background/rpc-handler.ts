import { walletStore } from "./wallet-state";
import { walletUnlocked } from "./wallet-lock";
import { RPC_METHODS } from "../enums/rpc-methods-enum";

export async function handleWalletRequest(method: string, _params: any[]) {
    // const hashed = hashedStore.getState().hashed;
    switch (method) {
        case RPC_METHODS.ETH_REQUEST_ACCOUNTS:
            return requestAccounts();

        case RPC_METHODS.ETH_ACCOUNTS:
            return getAccounts();

        case RPC_METHODS.ETH_CHAIN_ID:
            //   return hashed?.getChainId?.() || "0x1";
            return "0x1";

        default:
            //   if (hashed && typeof hashed[method] === "function") {
            //     return await hashed[method](...params);
            //   }
            throw new Error(`Unsupported method: ${method}`);
    }
}

function requestAccounts(): string[] {
    if (!walletUnlocked()) throw new Error("Wallet locked");
    const address = walletStore.getState().hashed?.getSelectedAccount?.();
    if (!address) throw new Error("No accounts");
    //   return [address];
    return ["0x123456789abcdefghijklmnopqrstuvwxyz"]
}

function getAccounts(): string[] {
    if (!walletUnlocked()) return [];
    // const address = hashedStore.getState().hashed?.getSelectedAccount?.();
    //   return address ? [address] : [];
    return ["0x123456789abcdefghijklmnopqrstuvwxyz"]
}
