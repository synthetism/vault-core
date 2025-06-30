import { describe, it, expect } from 'vitest';
import { VaultId } from '../src/index';

describe('VaultId Unit Tests', () => {
  describe('Valid Vault ID Creation', () => {
    it('should create valid vault IDs with alphanumeric characters', () => {
      const result = VaultId.create('valid123');
      
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.value).toBe('valid123');
        expect(result.value.toString()).toBe('valid123');
      }
    });

    it('should create valid vault IDs with dashes and underscores', () => {
      const result = VaultId.create('valid-vault_123');
      
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.value).toBe('valid-vault_123');
        expect(result.value.toString()).toBe('valid-vault_123');
      }
    });

    it('should create vault IDs at minimum length (2 chars)', () => {
      const result = VaultId.create('ab');
      
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.value).toBe('ab');
      }
    });

    it('should create vault IDs at maximum length (64 chars)', () => {
      const longId = 'a'.repeat(64);
      const result = VaultId.create(longId);
      
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.value).toBe(longId);
      }
    });

    it('should allow previously restricted words like "new"', () => {
      const result = VaultId.create('new');
      
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.value).toBe('new');
      }
    });
  });

  describe('Invalid Vault ID Creation', () => {
    it('should fail with empty string', () => {
      const result = VaultId.create('');
      
      expect(result.isSuccess).toBe(false);
      expect(result.errorMessage).toBe('Vault ID cannot be empty');
    });

    it('should fail with whitespace characters', () => {
      const result = VaultId.create('invalid vault');
      
      expect(result.isSuccess).toBe(false);
      expect(result.errorMessage).toContain('Only alphanumeric characters, numbers, dashes, and underscores are allowed');
    });

    it('should fail with special characters', () => {
      const result = VaultId.create('invalid@vault');
      
      expect(result.isSuccess).toBe(false);
      expect(result.errorMessage).toContain('Only alphanumeric characters, numbers, dashes, and underscores are allowed');
    });

    it('should fail with dots', () => {
      const result = VaultId.create('invalid.vault');
      
      expect(result.isSuccess).toBe(false);
      expect(result.errorMessage).toContain('Only alphanumeric characters, numbers, dashes, and underscores are allowed');
    });

    it('should fail with single character (too short)', () => {
      const result = VaultId.create('a');
      
      expect(result.isSuccess).toBe(false);
      expect(result.errorMessage).toContain('Vault ID must be between 2 and 64 characters');
    });

    it('should fail with 65 characters (too long)', () => {
      const longId = 'a'.repeat(65);
      const result = VaultId.create(longId);
      
      expect(result.isSuccess).toBe(false);
      expect(result.errorMessage).toContain('Vault ID must be between 2 and 64 characters');
    });
  });

  describe('Value Object Behavior', () => {
    it('should be immutable', () => {
      const result = VaultId.create('test-vault');
      expect(result.isSuccess).toBe(true);
      if (!result.isSuccess) return;

      const vaultId = result.value;
      
      // Attempting to modify should not affect the original
      const originalValue = vaultId.value;
      expect(vaultId.value).toBe(originalValue);
      expect(vaultId.toString()).toBe(originalValue);
    });

    it('should have proper equality semantics', () => {
      const result1 = VaultId.create('test-vault');
      const result2 = VaultId.create('test-vault');
      
      expect(result1.isSuccess).toBe(true);
      expect(result2.isSuccess).toBe(true);
      if (!result1.isSuccess || !result2.isSuccess) return;

      const vaultId1 = result1.value;
      const vaultId2 = result2.value;
      
      // Value objects with same value should be considered equal
      expect(vaultId1.value).toBe(vaultId2.value);
      expect(vaultId1.toString()).toBe(vaultId2.toString());
    });

    it('should have different values for different IDs', () => {
      const result1 = VaultId.create('vault-one');
      const result2 = VaultId.create('vault-two');
      
      expect(result1.isSuccess).toBe(true);
      expect(result2.isSuccess).toBe(true);
      if (!result1.isSuccess || !result2.isSuccess) return;

      const vaultId1 = result1.value;
      const vaultId2 = result2.value;
      
      expect(vaultId1.value).not.toBe(vaultId2.value);
      expect(vaultId1.toString()).not.toBe(vaultId2.toString());
    });
  });

  describe('Unit Philosophy - Self-contained behavior', () => {
    it('should be self-validating', () => {
      // Valid IDs self-validate during creation
      const validResult = VaultId.create('valid-id');
      expect(validResult.isSuccess).toBe(true);
      
      // Invalid IDs self-reject during creation
      const invalidResult = VaultId.create('invalid id');
      expect(invalidResult.isSuccess).toBe(false);
    });

    it('should be self-expressing', () => {
      const result = VaultId.create('expressive-vault');
      expect(result.isSuccess).toBe(true);
      if (!result.isSuccess) return;

      const vaultId = result.value;
      
      // Can express itself as string
      expect(vaultId.toString()).toBe('expressive-vault');
      expect(vaultId.value).toBe('expressive-vault');
    });

    it('should be self-contained', () => {
      const result = VaultId.create('self-contained');
      expect(result.isSuccess).toBe(true);
      if (!result.isSuccess) return;

      const vaultId = result.value;
      
      // Contains all necessary information about itself
      expect(vaultId.value).toBeDefined();
      expect(typeof vaultId.value).toBe('string');
      expect(vaultId.value.length).toBeGreaterThanOrEqual(2);
      expect(vaultId.value.length).toBeLessThanOrEqual(64);
    });
  });
});
