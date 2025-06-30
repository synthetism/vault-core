import { Result } from '@synet/patterns';
import { ValueObject } from '@synet/patterns';
//import type { IIdentity } from '@synet/identity-core/dist/identity-types';
import type {SynetVerifiableCredential, BaseCredentialSubject} from '@synet/credentials';
import type { Identity, ManagedPrivateKey, IIdentifier, IKey, IWGKey  } from '@synet/identity-core';
import { VaultId } from './vault-id';
import type { AdapterData, EncryptionAlgorithm } from '../vault-types';


export interface VaultOptions { 
    encryption?: {
        enabled: boolean
        algorithm: EncryptionAlgorithm
    },
    privateKeysStorage?: 'local' | 'kms'
}

export interface IIdentityVault {
  id: VaultId,  
  identity?: Identity | undefined,
  didStore?:  IIdentifier[],
  keyStore?: IKey[],
  privateKeyStore?: ManagedPrivateKey[],
  vcStore?: SynetVerifiableCredential<BaseCredentialSubject>[],
  wgKeyStore?: IWGKey[], // WireGuard keys
  options?: VaultOptions  
  createdAt: Date // Optional creation date for the vault
}

/**
 *  
 *
 * 
 */
export class IdentityVault extends ValueObject<IIdentityVault> {
  private constructor(props: IIdentityVault) {
    super(props);
  }

  public static createNew(props: { id: string }): Result<IdentityVault> {

     const vaultIdResult = VaultId.create(props.id);

     if( !vaultIdResult.isSuccess) {
       return Result.fail(`Invalid vault ID: ${vaultIdResult.errorMessage}`);
     }

     const vaultId = vaultIdResult.value;

     return Result.success( new IdentityVault({

      id: vaultId,
      identity: undefined,
      didStore: [],
      keyStore: [],
      privateKeyStore: [],
      vcStore: [],
      wgKeyStore: [],
      options: {
        encryption: {
          enabled: false,
          algorithm: 'aes-256-gcm'
        },
        privateKeysStorage: 'local'
      },
      createdAt: new Date()

     }));

  }

  /**
   * Create a new VaultId with validation
   */
  public static create(props: {

      id: string,
      identity?: Identity,
      didStore?:  IIdentifier[],
      keyStore?: IKey[],
      privateKeyStore?: ManagedPrivateKey[],
      vcStore?: SynetVerifiableCredential<BaseCredentialSubject>[],
      wgKeyStore?: IWGKey[],
      options?: {
        encryption?: {
          enabled: boolean
          algorithm: EncryptionAlgorithm
        }
        privateKeysStorage?: 'local' | 'kms'
      },
      createdAt?: Date
  }

  ): Result<IdentityVault> {

    
     const vaultIdResult = VaultId.create(props.id);

     if( !vaultIdResult.isSuccess) {
       return Result.fail(`Invalid vault ID: ${vaultIdResult.errorMessage}`);
     }


     const createdAt = props.createdAt || new Date();

    return Result.success(new IdentityVault({
     
      id: VaultId.create(props.id).value,
      identity: props.identity || undefined,
      didStore: props.didStore || [],
      keyStore: props.keyStore || [],
      privateKeyStore: props.privateKeyStore || [],
      vcStore: props.vcStore || [],
      wgKeyStore: props.wgKeyStore || [],
      options: props.options || {
        encryption: {
          enabled: false,
          algorithm: 'aes-256-gcm'
        },
        privateKeysStorage: 'local'
      },
      createdAt
    }));
  }
  
  toString(): string {
    return JSON.stringify(this.props);
  }

  get id(): VaultId {
    return this.props.id;
  }
  get identity(): Identity | undefined {
    return this.props.identity;
  }
  get didStore(): IIdentifier[] {
    return this.props.didStore || [];
  }
  get keyStore(): IKey[] {
    return this.props.keyStore || [];
  }
  get privateKeyStore(): ManagedPrivateKey[] {  
    return this.props.privateKeyStore || [];
  }
  get vcStore(): SynetVerifiableCredential<BaseCredentialSubject>[] {
    return this.props.vcStore || [];
  }
  get wgKeyStore(): IWGKey[] {
    return this.props.wgKeyStore || [];
  } 

  get options(): VaultOptions {
    return this.props.options || {
      encryption: {
        enabled: false,
        algorithm: 'aes-256-gcm'
      },
      privateKeysStorage: 'local'
    };
  }
  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  toAdapters(): AdapterData {

    return {
      dids: this.didStore.reduce((acc, did) => {
        acc[did.did] = did;
        return acc;
      }, {} as Record<string, IIdentifier>),
      keys: this.keyStore.reduce((acc, key) => {
        acc[key.publicKeyHex] = key;
        return acc;
      }, {} as Record<string, IKey>),
      privateKeys: this.privateKeyStore.reduce((acc, pk) => {
        acc[pk.alias] = pk;
        return acc;
      }, {} as Record<string, ManagedPrivateKey>),
      vcs: this.vcStore.reduce((acc, vc) => {
        acc[vc.id] = vc;
        return acc;
      }, {} as Record<string, SynetVerifiableCredential<BaseCredentialSubject>>)
    };


  }

  toJSON() {
 
    return {
      id: this.props.id.toString(),
      identity: this.identity,
      didStore: this.didStore,
      keyStore: this.keyStore,
      privateKeyStore: this.privateKeyStore,
      vcStore: this.vcStore,
      wgKeyStore: this.wgKeyStore,
      createdAt: this.createdAt,
      options: this.options,

    };
  }

   /**
   * SELF-AWARE: Creates itself from JSON, understanding its nature
   */
  public static fromJSON(json: string): Result<IdentityVault> {
    try {
      const data = JSON.parse(json);
      
      // Validate required encryption metadata
      if (!data.encryptionMetadata || !data.encryptedFields) {
        return Result.fail('Invalid encrypted unit: missing encryption metadata');
      }

      return IdentityVault.create({
        id: data.id,
        identity: data.identity,
        didStore: data.didStore,
        keyStore: data.keyStore,
        privateKeyStore: data.privateKeyStore,
        vcStore: data.vcStore,
        wgKeyStore: data.wgKeyStore,
        options: data.options,
        createdAt: data.createdAt
      });
    } catch (error) {
      return Result.fail(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}