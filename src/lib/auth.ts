import bcrypt from 'bcryptjs';
import { randomBytesHexSync } from './crypto-utils';

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}

export function generateVerificationToken(): string {
	return randomBytesHexSync(32);
}

export function getVerificationExpiry(): number {
	// Token expires in 24 hours
	return Math.floor(Date.now() / 1000) + 60 * 60 * 24;
}
