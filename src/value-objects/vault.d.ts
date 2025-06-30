import { Result } from '@synet/patterns';
import { ValueObject } from '@synet/patterns';
import type { SynetVerifiableCredential, BaseCredentialSubject } from '@synet/credentials';
import type { Identity, ManagedPrivateKey, IIdentifier, IKey, IWGKey } from '@synet/identity-core';
import { VaultId } from './vault-id';
import type { AdapterData, EncryptionAlgorithm } from '../vault-types';
export interface VaultOptions {
    encryption?: {
        enabled: boolean;
        algorithm: EncryptionAlgorithm;
    };
    privateKeysStorage?: 'local' | 'kms';
}
export interface IIdentityVault {
    id: VaultId;
    identity?: Identity | undefined;
    didStore?: IIdentifier[];
    keyStore?: IKey[];
    privateKeyStore?: ManagedPrivateKey[];
    vcStore?: SynetVerifiableCredential<BaseCredentialSubject>[];
    wgKeyStore?: IWGKey[];
    options?: VaultOptions;
    createdAt: Date;
}
/**
 *
 *
 *
 */
export declare class IdentityVault extends ValueObject<IIdentityVault> {
    private constructor();
    static createNew(props: {
        id: string;
    }): Result<IdentityVault>;
    /**
     * Create a new VaultId with validation
     */
    static create(props: {
        id: string;
        identity?: Identity;
        didStore?: IIdentifier[];
        keyStore?: IKey[];
        privateKeyStore?: ManagedPrivateKey[];
        vcStore?: SynetVerifiableCredential<BaseCredentialSubject>[];
        wgKeyStore?: IWGKey[];
        options?: {
            encryption?: {
                enabled: boolean;
                algorithm: EncryptionAlgorithm;
            };
            privateKeysStorage?: 'local' | 'kms';
        };
        createdAt?: Date;
    }): Result<IdentityVault>;
    toString(): string;
    get id(): VaultId;
    get identity(): Identity | undefined;
    get didStore(): IIdentifier[];
    get keyStore(): IKey[];
    get privateKeyStore(): ManagedPrivateKey[];
    get vcStore(): SynetVerifiableCredential<BaseCredentialSubject>[];
    get wgKeyStore(): IWGKey[];
    get options(): VaultOptions;
    get createdAt(): Date;
    toAdapters(): AdapterData;
    toJSON(): {
        id: string;
        identity: Identity | undefined;
        didStore: IIdentifier[];
        keyStore: IKey[];
        privateKeyStore: ManagedPrivateKey[];
        vcStore: SynetVerifiableCredential<BaseCredentialSubject>[];
        wgKeyStore: IWGKey[];
        createdAt: Date;
        options: VaultOptions;
    };
    /**
    * SELF-AWARE: Creates itself from JSON, understanding its nature
    */
    static fromJSON(json: string): Result<IdentityVault>;
}
