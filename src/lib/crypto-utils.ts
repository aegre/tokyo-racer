/**
 * Crypto utilities that work in Cloudflare Pages/Workers
 * Uses Web Crypto API instead of node:crypto
 */

/**
 * Generate random bytes using Web Crypto API
 * Compatible with Cloudflare Workers/Pages
 */
export async function randomBytes(length: number): Promise<Uint8Array> {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return array;
}

/**
 * Generate a random hex string (like crypto.randomBytes().toString('hex'))
 */
export async function randomBytesHex(length: number): Promise<string> {
	const bytes = await randomBytes(length);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Synchronous version for compatibility
 * Note: This still uses crypto.getRandomValues which is synchronous
 */
export function randomBytesSync(length: number): Uint8Array {
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	return array;
}

/**
 * Synchronous hex string generation
 */
export function randomBytesHexSync(length: number): string {
	const bytes = randomBytesSync(length);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}
