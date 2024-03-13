import crypto from 'crypto';

export const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: `uknonwn endpoint` });
  };
  
export const decryptData = (encryptedDataWithIv: Buffer, key: Buffer): string | null  => {
    const IV_LENGTH = 12; // For AES-256 GCM
    try {
        const iv = encryptedDataWithIv.subarray(0, IV_LENGTH);
        console.log("iv:", iv, iv.length);
        console.log("key", key, key.length);
        const encryptedData = encryptedDataWithIv.subarray(IV_LENGTH);
        console.log("encryptedData:", encryptedData);
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        console.log("decrypted:", decrypted);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}
