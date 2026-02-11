import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestStore {
  nonce?: string;
}

export const requestStore = new AsyncLocalStorage<RequestStore>();
