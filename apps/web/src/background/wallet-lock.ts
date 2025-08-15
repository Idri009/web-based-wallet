import { hashedStore } from "./background-state";

let isUnlocked = false;
let unlockTimestamp: number | null = null;
const UNLOCK_DURATION = 15 * 60 * 1000; // 15 min

export function unlockWallet(hashed: any) {
  isUnlocked = true;
  unlockTimestamp = Date.now();
  hashedStore.getState().setHashed(hashed);
}

export function lockWallet() {
  isUnlocked = false;
  unlockTimestamp = null;
  hashedStore.getState().setHashed(null);
}

export function walletUnlocked() {
  return (
    isUnlocked &&
    unlockTimestamp !== null &&
    Date.now() - unlockTimestamp < UNLOCK_DURATION
  );
}

export function checkAndExpireUnlock() {
  if (isUnlocked && unlockTimestamp && Date.now() - unlockTimestamp >= UNLOCK_DURATION) {
    lockWallet();
  }
}
