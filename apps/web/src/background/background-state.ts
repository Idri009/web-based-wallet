import { createStore } from "zustand/vanilla";
import type { Hashed } from "../utils/hashed";

export interface HashedState {
  hashed: Hashed | null;
  setHashed: (val: Hashed | null) => void;
}

export const hashedStore = createStore<HashedState>((set) => ({
  hashed: null,
  setHashed: (val) => set({ hashed: val }),
}));
