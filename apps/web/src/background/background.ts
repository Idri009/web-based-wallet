import { WALLET_EVENT } from "../enums/inject-wallet-event-enum";

// console.log("[BACKGROUND] script loaded");

// chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
//     console.log("[BACKGROUND] received message:", msg);

//     if (msg.type === WALLET_EVENT.WALLET_REQUEST) {
//         // do wallet logic here
//         sendResponse({ result: "Some wallet response", id: msg.id });
//     } else {
//         sendResponse({ echo: msg });
//     }

//     return true; // keep channel open
// });

import { handleWalletRequest } from "./rpc-handler";
import { unlockWallet, walletUnlocked } from "./wallet-lock";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {

    console.log("[BACKGROUND] got message: ", msg);

    (async () => {
        try {
            if (msg.type === "WALLET_REQUEST") {
                const result = await handleWalletRequest(msg.method, msg.params || []);
                sendResponse({ result });
            }
            else if (msg.type === "UNLOCK_WALLET") {
                unlockWallet(msg.hashed);
                sendResponse({ success: true });
            }
            else if (msg.type === "IS_WALLET_UNLOCKED") {
                sendResponse({ unlocked: walletUnlocked() });
            }
        } catch (err: any) {
            sendResponse({ error: err.message || "Unknown error" });
        }
    })();
    return true;
});
