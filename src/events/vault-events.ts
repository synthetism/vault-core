// @synet/vault-core/src/events/vault-events.ts
import type { Event } from "@synet/patterns";

export enum VaultEventType {
  VAULT_CHANGED = 'vault.changed',
  FILE_CHANGED = 'file.changed',
  DID_CHANGED = 'did.changed',
  KEY_CHANGED = 'key.changed',
  VC_CHANGED = 'vc.changed'
}

export interface VaultChangedEvent extends Event {
  type: VaultEventType.VAULT_CHANGED;
  payload: {
    previous: string | null;
    current: string;
  }
}

export interface FileChangedEvent extends Event {
  type: VaultEventType.FILE_CHANGED;
  payload: {
    filePath: string;
    vaultId: string;
    operation: 'read' | 'write' | 'delete';
  }
}

export interface DidChangedEvent extends Event {
  type: VaultEventType.DID_CHANGED;
  payload: {
    did: string;
    vaultId: string;
  }
}

export interface KeyChangedEvent extends Event {
  type: VaultEventType.KEY_CHANGED;
  payload: {
    keyId: string;
    vaultId: string;
  }
}

export interface VcChangedEvent extends Event {
  type: VaultEventType.VC_CHANGED;
  payload: {
    vcId: string;
    vaultId: string;
  }
}

export type VaultEvent = 
  | VaultChangedEvent
  | FileChangedEvent
  | DidChangedEvent
  | KeyChangedEvent
  | VcChangedEvent;