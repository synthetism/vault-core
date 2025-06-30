import { Result } from '@synet/patterns';
import { ValueObject } from '@synet/patterns';
interface VaultIdProps {
    value: string;
}
/**
 * VaultId Value Object
 *
 * Represents a unique vault identifier with validation rules
 */
export declare class VaultId extends ValueObject<VaultIdProps> {
    private constructor();
    /**
     * Create a new VaultId with validation
     */
    static create(id: string): Result<VaultId>;
    get value(): string;
    toString(): string;
}
export {};
