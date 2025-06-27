// @synet/vault-core/src/events/vault-event-service.ts
import { EventEmitter } from "@synet/patterns";
import  {
    type  VaultEvent, 
    VaultEventType 
} from "./vault-events";
import type { Logger } from "@synet/logger";

/**
 * Centralized event service for vault operations
 */
export class VaultEventService {
  private static instance: VaultEventService;
  private eventEmitter: EventEmitter<VaultEvent>;
  private activeVaultId: string | null = null;
  
  private constructor(private logger?: Logger) {
    this.eventEmitter = new EventEmitter<VaultEvent>();
  }
  
  public static getInstance(logger?: Logger): VaultEventService {
    if (!VaultEventService.instance) {
      VaultEventService.instance = new VaultEventService(logger);
    }
    return VaultEventService.instance;
  }
  
  getEventEmitter(): EventEmitter<VaultEvent> {
    return this.eventEmitter;
  }
  
  getActiveVaultId(): string | null {
    return this.activeVaultId;
  }
  
  setActiveVault(vaultId: string): void {
    const previous = this.activeVaultId;
    this.activeVaultId = vaultId;
    
    this.eventEmitter.emit({
      type: VaultEventType.VAULT_CHANGED,
      payload: {
        previous, 
        current: vaultId
      }
    });
    
    this.logger?.debug(`Active vault changed: ${previous || 'none'} -> ${vaultId}`);
  }
  
  emitFileChanged(filePath: string, vaultId: string, operation: 'read' | 'write' | 'delete'): void {
    this.eventEmitter.emit({
      type: VaultEventType.FILE_CHANGED,
      payload: {
        filePath,
        vaultId,
        operation
      }
    });
  }
  
  // Other event emission methods as needed
}

// Export singleton
export const vaultEventService = VaultEventService.getInstance();