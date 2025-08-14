import { WALLET_EVENT } from "../enums/inject-wallet-event-enum";

console.log("[BACKGROUND] script loaded");

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    console.log("[BACKGROUND] received message:", msg);

    if (msg.type === WALLET_EVENT.WALLET_REQUEST) {
        // do wallet logic here
        sendResponse({ result: "Some wallet response", id: msg.id });
    } else {
        sendResponse({ echo: msg });
    }

    return true; // keep channel open
});
