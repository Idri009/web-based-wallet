import { BackgroundProvider } from "./background-abstraction";
import { walletStore } from "./wallet-state";

const backgroundProvider = new BackgroundProvider(walletStore.getState().hashed!);

console.log("hashed data: ", walletStore.getState().hashed);
console.log("backgroundProvider: ", backgroundProvider);

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {

    console.log("[BACKGROUND] got message: ", msg);

        (async () => {

            await backgroundProvider.handleMessage(msg, _sender, sendResponse);

        })();
    return true;
});
