// @synet/vault-core/src/events/filesystem-emitter.ts
import { EventEmitter } from 'node:events';

export interface FileChangeEvent {
  filePath: string;
  type: 'write' | 'delete' | 'read';
}

export class FileSystemChangeEmitter extends EventEmitter {
  emitChange(event: FileChangeEvent): void {
    this.emit('fileChange', event);
  }

  onFileChange(listener: (event: FileChangeEvent) => void): void {
    this.on('fileChange', listener);
  }

  offFileChange(listener: (event: FileChangeEvent) => void): void {
    this.off('fileChange', listener);
  }
}

// Create singleton instance
export const fileSystemChangeEmitter = new FileSystemChangeEmitter();