// @synet/vault-core/src/vault-context.ts
import { EventEmitter } from 'node:events';

export class VaultContext extends EventEmitter {
  private _activeVaultId: string | null = null;
  
  get activeVaultId(): string | null {
    return this._activeVaultId;
  }
  
  setActiveVault(vaultId: string | null): void {
    const previous = this._activeVaultId;
    this._activeVaultId = vaultId;
    
    // Emit change event so subscribers can react
    this.emit('vaultChanged', { 
      previous, 
      current: vaultId 
    });
  }
  
  // Subscribe to changes
  onVaultChange(listener: (data: { previous: string | null, current: string | null }) => void): void {
    this.on('vaultChanged', listener);
  }
  
  // Unsubscribe
  offVaultChange(listener: (data: { previous: string | null, current: string | null }) => void): void {
    this.off('vaultChanged', listener);
  }
}

// Create a singleton instance
export const vaultContext = new VaultContext();