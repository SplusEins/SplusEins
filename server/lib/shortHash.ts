import { createHash } from 'crypto';

/**
 * @returns a short, URL-safe SHA1 hash of the text
 */
export function shortHash(text: string, length: number): string {
  return createHash('sha1')
    .update(text)
    .digest('base64')
    .replace(/\W/g, '')
    .slice(0, length);
}
