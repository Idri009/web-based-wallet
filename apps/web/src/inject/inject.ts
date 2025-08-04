// inject.ts - Injected script with debugging

import { hashedInfo } from "./hashed-info";
import { EthereumProviderImpl } from "./inject-abstraction";

// import type { WalletRequest } from "../types/inject-type";

// import { EthereumProviderImpl } from "./inject-abstraction";
// import { hashedInfo } from "./hashed-info";

console.log('Inject script starting...');


// Implementation
(function () {

    // Create and inject the provider
    const provider = new EthereumProviderImpl();

    // Make it available globally
    window.ethereum = provider;

    // Announce the provider (EIP-1193)
    window.dispatchEvent(new Event('ethereum#initialized'));

    // EIP-6963 - Multi Injector Discovery
    const providerInfo = hashedInfo;

    // Announce provider for EIP-6963 discovery
    const announceEvent = new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({ info: providerInfo, provider })
    });

    window.dispatchEvent(announceEvent);

    // Listen for EIP-6963 discovery requests
    window.addEventListener('eip6963:requestProvider', () => {
        window.dispatchEvent(announceEvent);
    });

})();