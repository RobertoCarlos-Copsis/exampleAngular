/**
 * Formatea un número de la forma (XX) XXXX-XXXX para México
 */
export function formatMexicanPhone(value: string): string {
    const numbers = value.replaceAll(/\D/g, '');
    const char: { [key: number]: string } = { 0: '(', 2: ') ', 6: '-' };
    let formatted = '';
    for (let i = 0; i < numbers.length && i < 10; i++) {
        formatted += (char[i] || '') + numbers[i];
    }
    return formatted;
}

/**
 * Limpia un string de todo lo que no sea dígito
 */
export function cleanDigits(value: string): string {
    return value.replaceAll(/\D/g, '');
}
