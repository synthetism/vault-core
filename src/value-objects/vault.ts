import { Result, Guard } from '@synet/patterns';
import { ValueObject } from '@synet/patterns';
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

export interface IVaultChild {
  parentDNA: Partial<IIdentityVault>;
  specialization: string;
  generation: number;
  birthData?: unknown;
  capabilities: Set<string>;
}

/**
 * Child Unit for specialized vault evolution
 */
export class VaultChild {
  constructor(private props: IVaultChild) {}

  get specialization(): string { return this.props.specialization; }
  get generation(): number { return this.props.generation; }
  get capabilities(): Set<string> { return this.props.capabilities; }

  canHandle(operation: string, data?: unknown): boolean {
    return this.capabilities.has(operation);
  }

  execute<T>(operation: string, data: unknown): Result<T> {
    // Child-specific processing logic
    // For now, just return success - implement specializations as needed
    return Result.success(data as T);
  }
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
 * IdentityVault - A Unit that embodies the vault architecture philosophy
 * 
 * SELF-CONTAINED: Contains all identity data and operations
 * SELF-AWARE: Knows its contents and can report on its state
 * SELF-DEFENDING: Validates its own integrity and enforces policies
 * SELF-EXPRESSING: Can serialize/deserialize itself completely
 * SELF-EVOLVING: Can create new versions of itself with modifications
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
   * Create a new IdentityVault with validation
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
      
      return IdentityVault.create({
        id: data.id,
        identity: data.identity,
        didStore: data.didStore,
        keyStore: data.keyStore,
        privateKeyStore: data.privateKeyStore,
        vcStore: data.vcStore,
        wgKeyStore: data.wgKeyStore,
        options: data.options,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined
      });
    } catch (error) {
      return Result.fail(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * SELF-AWARE: Knows what it contains and can report on its state
   */
  public getStats() {
    return {
      dids: this.didStore.length,
      keys: this.keyStore.length,
      privateKeys: this.privateKeyStore.length,
      vcs: this.vcStore.length,
      wgKeys: this.wgKeyStore.length,
      hasIdentity: !!this.identity,
      isEmpty: this.isEmpty(),
      createdAt: this.createdAt,
      size: this.estimateSize()
    };
  }

  /**
   * SELF-AWARE: Knows if it's empty
   */
  public isEmpty(): boolean {
    return this.didStore.length === 0 && 
           this.keyStore.length === 0 && 
           this.privateKeyStore.length === 0 && 
           this.vcStore.length === 0 && 
           this.wgKeyStore.length === 0 &&
           !this.identity;
  }

  /**
   * SELF-AWARE: Can estimate its own size
   */
  public estimateSize(): number {
    const jsonString = JSON.stringify(this.toJSON());
    return new Blob([jsonString]).size;
  }

  /**
   * SELF-DEFENDING: Uses GUARD pattern for clean validation
   */
  public validateIntegrity(): Result<boolean> {
    const validations: Result<unknown>[] = [
      // Validate DIDs
      ...this.didStore.map(did => 
        Guard.assert(
          !!did.did?.startsWith('did:'), 
          `Invalid DID format: ${did.did}`
        )
      ),
      
      // Validate Keys  
      ...this.keyStore.map(key => 
        Guard.combine([
          Guard.defined(key.kid, 'key.kid'),
          Guard.defined(key.publicKeyHex, 'key.publicKeyHex'),
          Guard.defined(key.type, 'key.type')
        ])
      ),
      
      // Validate Private Keys
      ...this.privateKeyStore.map(privateKey => 
        Guard.combine([
          Guard.defined(privateKey.alias, 'privateKey.alias'),
          Guard.defined(privateKey.privateKeyHex, 'privateKey.privateKeyHex'),
          Guard.defined(privateKey.type, 'privateKey.type')
        ])
      ),
      
      // Validate VCs
      ...this.vcStore.map(vc => 
        Guard.combine([
          Guard.defined(vc.id, 'vc.id'),
          Guard.defined(vc.type, 'vc.type'),
          Guard.defined(vc.issuer, 'vc.issuer')
        ])
      )
    ];

    const combinedResult = Guard.combine(validations);
    return combinedResult.isSuccess ? Result.success(true) : Result.fail(combinedResult.errorMessage || 'Validation failed');
  }

  /**
   * SELF-EVOLVING: Evolution happens through versioning and historical data preservation
   * For now, evolution is achieved by creating new instances through .create() and .fromJSON()
   * Future: Implement version-aware units that can handle historical data alongside latest code
   */

  /**
   * SELF-CONTAINED: Can create adapter data from storage format
   * This is the reverse of toAdapters() - it takes storage format and creates vault data
   */
  public static fromAdapters(vaultId: string, adapterData: AdapterData, options?: VaultOptions): Result<IdentityVault> {
    return IdentityVault.create({
      id: vaultId,
      didStore: Object.values(adapterData.dids),
      keyStore: Object.values(adapterData.keys),
      privateKeyStore: Object.values(adapterData.privateKeys),
      vcStore: Object.values(adapterData.vcs),
      options
    });
  }

  /**
   * SELF-AWARE: Can find VCs - the only search we need for now
   * Other items are accessed through their adapters when needed
   */
  public findVC(vcId: string): SynetVerifiableCredential<BaseCredentialSubject> | undefined {
    return this.vcStore.find(vc => vc.id === vcId);
  }

  /**
   * BIOLOGICAL MODEL: Child Units for evolutionary data handling
   */
  protected children: VaultChild[] = [];
  protected generation = 0;
  protected parentDNA?: Partial<IIdentityVault>;

  /**
   * FRACTAL EVOLUTION: Creates specialized children for new data types
   */
  protected findOrCreateSpecializedChild(dataType: string, data?: unknown): VaultChild {
    // Look for existing specialized child
    let child = this.children.find(c => c.canHandle(dataType, data));
    
    if (!child) {
      // Birth new child with specialized capabilities
      child = this.birthChild(dataType, data);
      this.children.push(child);
    }
    
    return child;
  }

  protected birthChild(specialization: string, data?: unknown): VaultChild {
    return new VaultChild({
      parentDNA: this.props,
      specialization,
      generation: this.generation + 1,
      birthData: data,
      capabilities: new Set([specialization]) // Start with basic specialization
    });
  }

  /**
   * DELEGATION: When parent doesn't understand, ask the children
   */
  protected delegateToChildren<T>(operation: string, data: unknown): Result<T> | undefined {
    for (const child of this.children) {
      if (child.canHandle(operation, data)) {
        return child.execute(operation, data);
      }
    }
    return undefined;
  }
}