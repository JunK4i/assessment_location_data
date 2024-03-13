import crypto from 'crypto';

export const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: `uknonwn endpoint` });
  };
  
export const decryptData = async (encryptedDataWithIvAndTag: Buffer, key: Buffer): Promise<string>  => {
    const IV_LENGTH = 12; // For AES-256 GCM
    const TAG_LENGTH = 16; // 128 bits for the authentication tag

    try {
        const iv = encryptedDataWithIvAndTag.subarray(0, IV_LENGTH);
        const tag = encryptedDataWithIvAndTag.subarray(encryptedDataWithIvAndTag.length - TAG_LENGTH);
        const encryptedData = encryptedDataWithIvAndTag.subarray(IV_LENGTH, encryptedDataWithIvAndTag.length - TAG_LENGTH);
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag); 
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}
