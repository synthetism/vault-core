// @synet/vault-core/src/interfaces.ts
import type { SynetVerifiableCredential, BaseCredentialSubject} from '@synet/credentials';
import type { Result} from '@synet/patterns';
import type { VaultId } from './value-objects/vault-id';
import type { Identity, ManagedPrivateKey, IIdentifier, IKey, IWGKey  } from '@synet/identity-core';
import type { 
    AbstractDIDStore, 
    AbstractKeyStore, 
    AbstractPrivateKeyStore, 
    AbstractVCStore
} from './interfaces';

import type { IdentityVault } from './value-objects/vault';

export interface IVaultManager {
  use(vaultId: string): Promise<Result<void>>

  getCurrentVaultId(): string;
  hasActiveVault(): boolean;
  saveSection<T>(sectionKey: keyof IdentityVault, data: T): Promise<void>;
  saveKeys(keys: Record<string, IKey>): Promise<void> 
  
  loadKeys(): Promise<Record<string, IKey>>
  savePrivateKeys(keys: Record<string, ManagedPrivateKey>): Promise<void> 

  loadPrivateKeys(): Promise<Record<string, ManagedPrivateKey>> 
  saveVCs(vcs: Record<string, SynetVerifiableCredential<BaseCredentialSubject>>): Promise<void>;
  loadVCs(): Promise<Record<string, SynetVerifiableCredential<BaseCredentialSubject>>>;

  saveDIDs(dids: Record<string, IIdentifier>): Promise<void>;
  loadDIDs(): Promise<Record<string, IIdentifier>> ;

}

export interface IVaultOperator {

  use(vaultId: string): Promise<Result<void>>;
  createNew(id: string): Promise<Result<void>>;
  deleteVault(id: string): Promise<Result<void>>;
  getVault(id: string): Promise<Result<IdentityVault>>;
  updateVault(vault: IdentityVault): Promise<Result<void>>; // Update vault data
  listVaults(): Promise<Result<IdentityVault[]>>;
 
}

export interface IVaultStorage {
   exists (vaultId: string): Promise<boolean>
   create(vaultId:string,vault:IdentityVault): Promise<void>;
   get(vaultId: string): Promise<IdentityVault>;
   delete(vaultId: string): Promise<void>;
   update(vaultId: string, vaultData: IdentityVault): Promise<void>;
   list (): Promise<IdentityVault[]>;
   exists(vaultId: string): Promise<boolean>;
}
    // Additional methods as needed for managing vaults


export interface IVault {
  operator: IVaultOperator;
  adapters: IStorageAdapters;
  manager: IVaultManager;
}

export interface IStorageAdapters {
  didStore: AbstractDIDStore;
  keyStore: AbstractKeyStore;
  privateKeyStore: AbstractPrivateKeyStore;
  vcStore: AbstractVCStore;
}


export type EncryptionAlgorithm = 'aes-256-gcm' | 'chacha20-poly1305';


export interface AdapterData {
  dids: Record<string, IIdentifier>;
  keys: Record<string, IKey>;
  privateKeys: Record<string, ManagedPrivateKey>;
  vcs: Record<string, SynetVerifiableCredential<BaseCredentialSubject>>;
}



