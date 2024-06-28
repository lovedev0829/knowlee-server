// crypto module
import crypto from 'node:crypto'

const algorithm = "aes-256-cbc";

const secret_iv = process.env.SECRET_IV!
const secret_key = process.env.SECRET_KEY!

// Generate secret hash with crypto to use for encryption and decryption
const key = crypto
  .createHash('sha512')
  .update(secret_key)
  .digest('hex')
  .substring(0, 32)
const initVector = crypto
  .createHash('sha512')
  .update(secret_iv)
  .digest('hex')
  .substring(0, 16)

// the cipher function
export const encryptData = (message: string): string => {
  const cipher = crypto.createCipheriv(algorithm, key, initVector);
  let encryptedData = cipher.update(message, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData
}

// the decipher function
export const decryptData = (encryptedData: string): string => {
  const decipher = crypto.createDecipheriv(algorithm, key, initVector);
  let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
  decryptedData += decipher.final("utf8");
  return decryptedData
}

export type CryptoEncryptionKey = {
  secret_key: crypto.BinaryLike;
  secret_iv: crypto.BinaryLike;
};

export const encryptDataWithKey = (
  { secret_key, secret_iv }: CryptoEncryptionKey,
  data: string
) => {
  const key = crypto
    .createHash("sha512")
    .update(secret_key)
    .digest("hex")
    .substring(0, 32);

  const initVector = crypto
    .createHash("sha512")
    .update(secret_iv)
    .digest("hex")
    .substring(0, 16);
  const cipher = crypto.createCipheriv(algorithm, key, initVector);
  let encryptedData = cipher.update(data, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData;
};

export const decryptDataWithKey = (
  { secret_key, secret_iv }: CryptoEncryptionKey,
  data: string
): string => {
  const key = crypto
    .createHash("sha512")
    .update(secret_key)
    .digest("hex")
    .substring(0, 32);

  const initVector = crypto
    .createHash("sha512")
    .update(secret_iv)
    .digest("hex")
    .substring(0, 16);

  const decipher = crypto.createDecipheriv(algorithm, key, initVector);
  let decryptedData = decipher.update(data, "hex", "utf-8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
};
