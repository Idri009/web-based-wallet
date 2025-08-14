import { WALLET_EVENT } from "../enums/inject-wallet-event-enum";

console.log("[CONTENT] script loaded");

// Dynamically inject inject.js into page
const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject/inject.js");
script.onload = function () {
    (this as HTMLScriptElement).remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from inject.js
window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    if (!event.data || !event.data.type) return;

    if (event.data.type === WALLET_EVENT.WALLET_REQUEST) {
        console.log("[CONTENT] Received WALLET_REQUEST from inject", event.data);

        chrome.runtime.sendMessage(
            {
                type: WALLET_EVENT.WALLET_REQUEST,
                method: event.data.method,
                params: event.data.params,
                id: event.data.id
            },
            (res) => {
                console.log("[CONTENT] Got response from background:", res);
                window.postMessage(
                    { type: WALLET_EVENT.WALLET_RESPONSE, ...res },
                    "*"
                );
            }
        );
    }
});
