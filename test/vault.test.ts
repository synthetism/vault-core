import { describe, it, expect, beforeEach } from 'vitest';
import { IdentityVault, VaultId } from '../src/index';
import type { IIdentifier, IKey, ManagedPrivateKey } from '@synet/identity-core';
import type { SynetVerifiableCredential, BaseCredentialSubject } from '@synet/credentials';
import type { AdapterData } from '../src/vault-types';

describe('IdentityVault Unit Tests', () => {
  // Sample test data based on the example storage files
  const sampleDID: IIdentifier = {
    did: "did:key:z6MkttjNynPdkYY7vcnBvwsRJEgNe6ei1SoPxh4u7dFuVWsx",
    controllerKeyId: "d68a0b4ecc7e9317510a3f64a6f659547e27f325b0feba5d95bcdc3175d114ff",
    keys: [
      {
        type: "Ed25519",
        kid: "d68a0b4ecc7e9317510a3f64a6f659547e27f325b0feba5d95bcdc3175d114ff",
        publicKeyHex: "d68a0b4ecc7e9317510a3f64a6f659547e27f325b0feba5d95bcdc3175d114ff",
        meta: {
          algorithms: ["EdDSA", "Ed25519"]
        },
        kms: "local"
      }
    ],
    services: [],
    provider: "did:key"
  };

  const sampleKey: IKey = {
    type: "Ed25519",
    kid: "d68a0b4ecc7e9317510a3f64a6f659547e27f325b0feba5d95bcdc3175d114ff",
    publicKeyHex: "d68a0b4ecc7e9317510a3f64a6f659547e27f325b0feba5d95bcdc3175d114ff",
    meta: {
      algorithms: ["EdDSA", "Ed25519"]
    },
    kms: "local"
  };

  const samplePrivateKey: ManagedPrivateKey = {
    alias: "d68a0b4ecc7e9317510a3f64a6f659547e27f325b0feba5d95bcdc3175d114ff",
    type: "Ed25519",
    privateKeyHex: "755984826f8ba909ec60579daf429333e7add8caa3216023f1507a9fd1ae8904d68a0b4ecc7e9317510a3f64a6f659547e27f325b0feba5d95bcdc3175d114ff"
  };

  const sampleVC: SynetVerifiableCredential<BaseCredentialSubject> = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: 'urn:uuid:123e4567-e89b-12d3-a456-426614174000',
    type: ['VerifiableCredential', 'IdentityCredential'],
    issuer: { id: sampleDID.did },
    issuanceDate: '2023-01-01T00:00:00Z',
    credentialSubject: {
      id: sampleDID.did,
      type: 'Person',
      holder: {
        id: sampleDID.did,
        type: 'Person'
      }
    },
    proof: {
      type: 'JwtProof2020',
      jwt: 'eyJhbGciOiJFZERTQSJ9...'
    }
  };

  describe('Vault Creation', () => {
    it('should create a new empty vault', () => {
      const result = IdentityVault.createNew({ id: 'test-vault' });
      
      expect(result.isSuccess).toBe(true);
      
      if (result.isSuccess) {
        const vault = result.value;
        expect(vault.id.toString()).toBe('test-vault');
        expect(vault.didStore).toEqual([]);
        expect(vault.keyStore).toEqual([]);
        expect(vault.privateKeyStore).toEqual([]);
        expect(vault.vcStore).toEqual([]);
        expect(vault.wgKeyStore).toEqual([]);
        expect(vault.identity).toBeUndefined();
        expect(vault.createdAt).toBeInstanceOf(Date);
      }
    });

    it('should create a vault with existing data', () => {
      const result = IdentityVault.create({
        id: 'test-vault-with-data',
        didStore: [sampleDID],
        keyStore: [sampleKey],
        privateKeyStore: [samplePrivateKey],
        vcStore: [sampleVC]
      });

      expect(result.isSuccess).toBe(true);
      
      if (result.isSuccess) {
        const vault = result.value;
        expect(vault.didStore).toHaveLength(1);
        expect(vault.keyStore).toHaveLength(1);
        expect(vault.privateKeyStore).toHaveLength(1);
        expect(vault.vcStore).toHaveLength(1);
      }
    });

    it('should fail with invalid vault ID', () => {
      const result = IdentityVault.createNew({ id: '' });
      
      expect(result.isSuccess).toBe(false);
      expect(result.errorMessage).toContain('Invalid vault ID');
    });

    it('should fail with invalid characters in vault ID', () => {
      const result = IdentityVault.createNew({ id: 'test vault with spaces' });
      
      expect(result.isSuccess).toBe(false);
      expect(result.errorMessage).toContain('Invalid vault ID');
    });
  });

  describe('toAdapters conversion', () => {
    it('should convert vault data to adapter format correctly', () => {
      const vaultResult = IdentityVault.create({
        id: 'test-vault',
        didStore: [sampleDID],
        keyStore: [sampleKey],
        privateKeyStore: [samplePrivateKey],
        vcStore: [sampleVC]
      });

      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;
      const adapterData = vault.toAdapters();

      // Check DIDs are keyed by DID
      expect(adapterData.dids).toHaveProperty(sampleDID.did);
      expect(adapterData.dids[sampleDID.did]).toEqual(sampleDID);

      // Check keys are keyed by publicKeyHex
      expect(adapterData.keys).toHaveProperty(sampleKey.publicKeyHex);
      expect(adapterData.keys[sampleKey.publicKeyHex]).toEqual(sampleKey);

      // Check private keys are keyed by alias (publicKeyHex)
      expect(adapterData.privateKeys).toHaveProperty(samplePrivateKey.alias);
      expect(adapterData.privateKeys[samplePrivateKey.alias]).toEqual(samplePrivateKey);

      // Check VCs are keyed by VC ID
      expect(adapterData.vcs).toHaveProperty(sampleVC.id);
      expect(adapterData.vcs[sampleVC.id]).toEqual(sampleVC);
    });

    it('should handle empty stores', () => {
      const vaultResult = IdentityVault.createNew({ id: 'empty-vault' });
      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;
      const adapterData = vault.toAdapters();

      expect(adapterData.dids).toEqual({});
      expect(adapterData.keys).toEqual({});
      expect(adapterData.privateKeys).toEqual({});
      expect(adapterData.vcs).toEqual({});
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to JSON correctly', () => {
      const vaultResult = IdentityVault.create({
        id: 'json-test-vault',
        didStore: [sampleDID],
        keyStore: [sampleKey],
        privateKeyStore: [samplePrivateKey],
        vcStore: [sampleVC]
      });

      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;
      const json = vault.toJSON();

      expect(json.id).toBe('json-test-vault');
      expect(json.didStore).toEqual([sampleDID]);
      expect(json.keyStore).toEqual([sampleKey]);
      expect(json.privateKeyStore).toEqual([samplePrivateKey]);
      expect(json.vcStore).toEqual([sampleVC]);
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.options).toBeDefined();
    });

    it('should handle undefined identity', () => {
      const vaultResult = IdentityVault.createNew({ id: 'no-identity-vault' });
      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;
      const json = vault.toJSON();

      expect(json.identity).toBeUndefined();
    });
  });

  describe('fromJSON deserialization', () => {
    it('should create vault from JSON string', () => {
      const originalVaultResult = IdentityVault.create({
        id: 'json-roundtrip-vault',
        didStore: [sampleDID],
        keyStore: [sampleKey],
        privateKeyStore: [samplePrivateKey],
        vcStore: [sampleVC]
      });

      expect(originalVaultResult.isSuccess).toBe(true);
      if (!originalVaultResult.isSuccess) return;

      const originalVault = originalVaultResult.value;
      const jsonString = JSON.stringify(originalVault.toJSON());
      const result = IdentityVault.fromJSON(jsonString);

      expect(result.isSuccess).toBe(true);
      
      if (result.isSuccess) {
        const deserializedVault = result.value;
        expect(deserializedVault.id.toString()).toBe('json-roundtrip-vault');
        expect(deserializedVault.didStore).toEqual([sampleDID]);
        expect(deserializedVault.keyStore).toEqual([sampleKey]);
        expect(deserializedVault.privateKeyStore).toEqual([samplePrivateKey]);
        expect(deserializedVault.vcStore).toEqual([sampleVC]);
      }
    });

    it('should fail with invalid JSON', () => {
      const result = IdentityVault.fromJSON('invalid json');
      
      expect(result.isSuccess).toBe(false);
      expect(result.errorMessage).toContain('Invalid JSON');
    });
  });

  describe('Vault Options', () => {
    it('should use default options when none provided', () => {
      const vaultResult = IdentityVault.createNew({ id: 'default-options-vault' });
      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;
      const options = vault.options;

      expect(options.encryption?.enabled).toBe(false);
      expect(options.encryption?.algorithm).toBe('aes-256-gcm');
      expect(options.privateKeysStorage).toBe('local');
    });

    it('should accept custom options', () => {
      const customOptions = {
        encryption: {
          enabled: true,
          algorithm: 'chacha20-poly1305' as const
        },
        privateKeysStorage: 'kms' as const
      };

      const vaultResult = IdentityVault.create({
        id: 'custom-options-vault',
        options: customOptions
      });

      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;

      expect(vault.options.encryption?.enabled).toBe(true);
      expect(vault.options.encryption?.algorithm).toBe('chacha20-poly1305');
      expect(vault.options.privateKeysStorage).toBe('kms');
    });
  });

  describe('Unit Philosophy - Self-contained behavior', () => {
    it('should be self-aware of its contents', () => {
      const vaultResult = IdentityVault.create({
        id: 'self-aware-vault',
        didStore: [sampleDID],
        keyStore: [sampleKey],
        privateKeyStore: [samplePrivateKey],
        vcStore: [sampleVC]
      });

      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;

      // The vault knows exactly what it contains
      expect(vault.didStore.length).toBe(1);
      expect(vault.keyStore.length).toBe(1);
      expect(vault.privateKeyStore.length).toBe(1);
      expect(vault.vcStore.length).toBe(1);
      
      // It can express itself completely
      const json = vault.toJSON();
      expect(json).toBeDefined();
      
      // It can recreate itself from its expression
      const recreated = IdentityVault.fromJSON(JSON.stringify(json));
      expect(recreated.isSuccess).toBe(true);
    });

    it('should maintain its integrity across transformations', () => {
      const originalVaultResult = IdentityVault.create({
        id: 'integrity-test-vault',
        didStore: [sampleDID],
        keyStore: [sampleKey],
        privateKeyStore: [samplePrivateKey],
        vcStore: [sampleVC]
      });

      expect(originalVaultResult.isSuccess).toBe(true);
      if (!originalVaultResult.isSuccess) return;

      const originalVault = originalVaultResult.value;

      // Transform to adapter format and back
      const adapterData = originalVault.toAdapters();
      
      // Verify the transformation preserves all data
      expect(Object.keys(adapterData.dids)).toHaveLength(1);
      expect(Object.keys(adapterData.keys)).toHaveLength(1);
      expect(Object.keys(adapterData.privateKeys)).toHaveLength(1);
      expect(Object.keys(adapterData.vcs)).toHaveLength(1);
      
      // Verify specific data integrity
      expect(adapterData.dids[sampleDID.did]).toEqual(sampleDID);
      expect(adapterData.keys[sampleKey.publicKeyHex]).toEqual(sampleKey);
      expect(adapterData.privateKeys[samplePrivateKey.alias]).toEqual(samplePrivateKey);
      expect(adapterData.vcs[sampleVC.id]).toEqual(sampleVC);
    });
  });

  describe('Vault Statistics and Self-Awareness', () => {
    it('should provide accurate statistics about its contents', () => {
      const vaultResult = IdentityVault.create({
        id: 'stats-vault',
        didStore: [sampleDID],
        keyStore: [sampleKey],
        privateKeyStore: [samplePrivateKey],
        vcStore: [sampleVC]
      });

      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;
      const stats = vault.getStats();

      expect(stats.dids).toBe(1);
      expect(stats.keys).toBe(1);
      expect(stats.privateKeys).toBe(1);
      expect(stats.vcs).toBe(1);
      expect(stats.wgKeys).toBe(0);
      expect(stats.hasIdentity).toBe(false);
      expect(stats.isEmpty).toBe(false);
      expect(stats.createdAt).toBeInstanceOf(Date);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should detect empty vaults', () => {
      const vaultResult = IdentityVault.createNew({ id: 'empty-vault' });
      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;
      expect(vault.isEmpty()).toBe(true);
      expect(vault.getStats().isEmpty).toBe(true);
    });

    it('should validate its own integrity', () => {
      const vaultResult = IdentityVault.create({
        id: 'valid-vault',
        didStore: [sampleDID],
        keyStore: [sampleKey],
        privateKeyStore: [samplePrivateKey],
        vcStore: [sampleVC]
      });

      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;
      const integrityResult = vault.validateIntegrity();
      
      expect(integrityResult.isSuccess).toBe(true);
      if (integrityResult.isSuccess) {
        expect(integrityResult.value).toBe(true);
      }
    });
  });

  describe('Vault Evolution (Self-Evolving behavior)', () => {
    it('should support evolution through version-aware data handling', () => {
      // Evolution is now achieved through creating new instances with new data
      // This preserves the historical vs current code dilemma you mentioned
      const originalVaultResult = IdentityVault.createNew({ id: 'evolution-vault' });
      expect(originalVaultResult.isSuccess).toBe(true);
      if (!originalVaultResult.isSuccess) return;

      const originalVault = originalVaultResult.value;
      
      // Evolution happens by creating new vault instances with updated data
      const evolvedVaultResult = IdentityVault.create({
        id: 'evolution-vault',
        didStore: [sampleDID], // New data state
        vcStore: [sampleVC],    // New data state
        createdAt: originalVault.createdAt // Preserve creation time
      });
      
      expect(evolvedVaultResult.isSuccess).toBe(true);
      if (!evolvedVaultResult.isSuccess) return;

      const evolvedVault = evolvedVaultResult.value;
      expect(evolvedVault.didStore.length).toBe(1);
      expect(evolvedVault.vcStore.length).toBe(1);
      // Original vault remains unchanged (immutable)
      expect(originalVault.didStore.length).toBe(0);
    });
  });

  describe('Vault Search and Query (Self-Aware behavior)', () => {
    it('should find VCs within itself', () => {
      const vaultResult = IdentityVault.create({
        id: 'search-vault',
        vcStore: [sampleVC]
      });

      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;

      // Find existing VC
      expect(vault.findVC(sampleVC.id)).toEqual(sampleVC);

      // Non-existent VC should return undefined
      expect(vault.findVC('non-existent-vc')).toBeUndefined();
    });
  });

  describe('Adapter Data Conversion', () => {
    it('should create vault from adapter data format', () => {
      const adapterData: AdapterData = {
        dids: { [sampleDID.did]: sampleDID },
        keys: { [sampleKey.publicKeyHex]: sampleKey },
        privateKeys: { [samplePrivateKey.alias]: samplePrivateKey },
        vcs: { [sampleVC.id]: sampleVC }
      };

      const vaultResult = IdentityVault.fromAdapters('adapter-vault', adapterData);
      
      expect(vaultResult.isSuccess).toBe(true);
      if (!vaultResult.isSuccess) return;

      const vault = vaultResult.value;
      expect(vault.didStore).toEqual([sampleDID]);
      expect(vault.keyStore).toEqual([sampleKey]);
      expect(vault.privateKeyStore).toEqual([samplePrivateKey]);
      expect(vault.vcStore).toEqual([sampleVC]);
    });

    it('should round-trip between vault and adapter formats', () => {
      const originalVaultResult = IdentityVault.create({
        id: 'roundtrip-vault',
        didStore: [sampleDID],
        keyStore: [sampleKey],
        privateKeyStore: [samplePrivateKey],
        vcStore: [sampleVC]
      });

      expect(originalVaultResult.isSuccess).toBe(true);
      if (!originalVaultResult.isSuccess) return;

      const originalVault = originalVaultResult.value;
      
      // Convert to adapter format
      const adapterData = originalVault.toAdapters();
      
      // Convert back to vault
      const reconstructedVaultResult = IdentityVault.fromAdapters(
        originalVault.id.toString(), 
        adapterData
      );
      
      expect(reconstructedVaultResult.isSuccess).toBe(true);
      if (!reconstructedVaultResult.isSuccess) return;

      const reconstructedVault = reconstructedVaultResult.value;
      
      // Should have the same data
      expect(reconstructedVault.didStore).toEqual(originalVault.didStore);
      expect(reconstructedVault.keyStore).toEqual(originalVault.keyStore);
      expect(reconstructedVault.privateKeyStore).toEqual(originalVault.privateKeyStore);
      expect(reconstructedVault.vcStore).toEqual(originalVault.vcStore);
    });
  });
});
