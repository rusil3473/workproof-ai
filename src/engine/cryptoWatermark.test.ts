import { describe, it, expect } from 'vitest';
import { computeSha256 } from './cryptoWatermark';

describe('cryptoWatermark engine', () => {
  it('computes deterministic SHA-256 hash for photo payload', async () => {
    const testPayload = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...sampledata';
    const hash1 = await computeSha256(testPayload);
    const hash2 = await computeSha256(testPayload);

    expect(hash1).toBeDefined();
    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
  });

  it('produces distinct hashes for different input data', async () => {
    const hashA = await computeSha256('job-before-photo-payload-alpha');
    const hashB = await computeSha256('job-before-photo-payload-beta');

    expect(hashA).not.toBe(hashB);
  });
});
