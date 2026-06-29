/**
 * CPF validation utility — official Brazilian algorithm.
 * Reusable across all screens. No external dependencies.
 */

/**
 * Strips any non-digit characters and validates the CPF
 * using the official two-digit verification algorithm.
 *
 * Rejects:
 *  - Sequences shorter or longer than 11 digits
 *  - Known trivial sequences (00000000000 … 99999999999)
 *  - CPFs with invalid check digits
 */
export function isValidCpf(value: string): boolean {
    const digits = value.replace(/\D/g, "");

    if (digits.length !== 11) return false;

    // Reject sequences like 00000000000, 11111111111, …
    if (/^(\d)\1{10}$/.test(digits)) return false;

    // First check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(digits[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits[9])) return false;

    // Second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(digits[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits[10])) return false;

    return true;
}
