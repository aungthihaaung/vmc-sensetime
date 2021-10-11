import crypto from "crypto";

class Encryptor {
  BLOCK_CIPHER;
  AUTH_TAG_BYTE_LEN;
  IV_BYTE_LEN;
  KEY_BYTE_LEN;
  SALT_BYTE_LEN;
  DEFAULT_IV;
  key;

  constructor(encryptionKey) {
    /**
     * GCM is an authenticated encryption mode that
     * not only provides confidentiality but also
     * provides integrity in a secured way
     * */
    (this.BLOCK_CIPHER = "aes-256-gcm"),
      /**
       * 128 bit auth tag is recommended for GCM
       */
      (this.AUTH_TAG_BYTE_LEN = 16),
      /**
       * NIST recommends 96 bits or 12 bytes IV for GCM
       * to promote interoperability, efficiency, and
       * simplicity of design
       */
      (this.IV_BYTE_LEN = 12);

    /**
     * Note: 256 (in algorithm name) is key size.
     * Block size for AES is always 128
     */
    this.KEY_BYTE_LEN = 32;

    /**
     * To prevent rainbow table attacks
     * */
    this.SALT_BYTE_LEN = 16;

    // according to business logic , same text need to get same hex
    this.DEFAULT_IV = Buffer.from("3038a57d8803ab665028084b", "hex");
    this.key = crypto.scryptSync(encryptionKey, "salt", this.KEY_BYTE_LEN);
  }

  encrypt(clearText) {
    // don't want dynamic iv
    //const iv = crypto.randomBytes(this.IV_BYTE_LEN);
    const iv = this.DEFAULT_IV;
    const cipher = crypto.createCipheriv(this.BLOCK_CIPHER, this.key, iv, {
      authTagLength: this.AUTH_TAG_BYTE_LEN,
    });
    const encrypted = cipher.update(clearText);
    const bufferEncryptedMessage = Buffer.concat([encrypted, cipher.final()]);
    return Buffer.concat([
      iv,
      bufferEncryptedMessage,
      cipher.getAuthTag(),
    ]).toString("hex");
  }

  decrypt(encryptedText) {
    try {
      const bufferEncryptedText = Buffer.from(encryptedText, "hex");
      const authTag = bufferEncryptedText.slice(-16);
      const iv = bufferEncryptedText.slice(0, 12);
      const encryptedMessage = bufferEncryptedText.slice(12, -16);

      if (!iv) throw new Error("IV not found");
      if (!authTag) throw new Error("authTag not found");
      if (!encryptedMessage) throw new Error("encryptedMessage not found");

      const decipher = crypto.createDecipheriv(
        this.BLOCK_CIPHER,
        this.key,
        iv,
        { authTagLength: this.AUTH_TAG_BYTE_LEN }
      );
      decipher.setAuthTag(authTag);
      const messageText = decipher.update(encryptedMessage);
      const bufferMessageText = Buffer.concat([messageText, decipher.final()]);
      return bufferMessageText.toString("utf8");
    } catch (Err) {
      return encryptedText;
    }
  }
}

const encryptor = new Encryptor("1&J%k#$sdfs#f()(2");

export default encryptor;
// 3038a57d8803ab665028084b191c2fb335517bccc6f1a6cb9475ccfadae45a4a1ea852263c	3038a57d8803ab665028084b671a2eb13a5c7fca82b7f463037b87be55f6760b0a299c40
