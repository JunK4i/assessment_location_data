import crypto from 'crypto';

export const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: `uknonwn endpoint` });
  };
  
export const decryptData = (encryptedDataWithIvAndTag: Buffer, key: Buffer): string | null  => {
    const IV_LENGTH = 12; // For AES-256 GCM
    const TAG_LENGTH = 16; // 128 bits for the authentication tag

    try {
        const iv = encryptedDataWithIvAndTag.subarray(0, IV_LENGTH);
        const tag = encryptedDataWithIvAndTag.subarray(encryptedDataWithIvAndTag.length - TAG_LENGTH);
        const encryptedData = encryptedDataWithIvAndTag.subarray(IV_LENGTH, encryptedDataWithIvAndTag.length - TAG_LENGTH);
        console.log("iv:", iv, iv.length);
        console.log("key", key, key.length);
        console.log("encryptedData:", encryptedData);
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag); 
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        console.log("decrypted:", decrypted);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}
