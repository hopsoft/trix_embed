const options = { name: 'AES-GCM', length: 256 } // encryption options
const extractable = true // makes it possible to export the key
const purposes = ['encrypt', 'decrypt']

// Generates a key for use with a symmetric encryption algorithm
//
// @returns {Promise<CryptoKey>} - The generated key
//
async function generateKey() {
  const extractable = true // makes it possible to export the key later
  const purposes = ['encrypt', 'decrypt']
  return await crypto.subtle.generateKey(options, extractable, purposes)
}

// Exports an encryption key
//
// @param {CryptoKey} key - The key to export
// @returns {Promise<String>} - The exported key as a JSON string
//
async function exportKey(key) {
  const exported = await crypto.subtle.exportKey('jwk', key)
  return JSON.stringify(exported)
}

// Imports an encryption key
//
// @param {String} key - The key to import as a string
// @returns {Promise<CryptoKey>} - The imported key
//
async function importKey(key) {
  const parsed = JSON.parse(key)
  return await crypto.subtle.importKey('jwk', parsed, options, extractable, purposes)
}

// Encrypts a value using a symmetric encryption algorithm
//
// @param {String} value - The value to encrypt
// @param {CryptoKey} key - The key to use for encryption
// @returns {Promise<String>} - Base64 encoded representation of the encrypted value
//
async function encrypt(value, key) {
  const encoded = new TextEncoder().encode(String(value))
  const iv = crypto.getRandomValues(new Uint8Array(12)) // initialization vector
  const buffer = await crypto.subtle.encrypt({ ...options, iv }, key, encoded) // ciphertext as an ArrayBuffer
  const data = {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(buffer))),
    iv: btoa(String.fromCharCode(...iv))
  }
  return btoa(JSON.stringify(data))
}

// Decrypts a value using a symmetric encryption algorithm
//
// @param {String} encrypted - The Base64 encoded encrypted value
// @param {CryptoKey} key - The key to use for decryption
// @returns {Promise<String>} - The decrypted value
//
async function decrypt(encrypted, key) {
  const data = JSON.parse(atob(encrypted))
  const ciphertextArray = new Uint8Array(
    atob(data.ciphertext)
      .split('')
      .map(char => char.charCodeAt(0))
  )
  const iv = new Uint8Array(
    atob(data.iv)
      .split('')
      .map(char => char.charCodeAt(0))
  )

  const buffer = await crypto.subtle.decrypt({ ...options, iv }, key, ciphertextArray)
  return new TextDecoder().decode(buffer)
}

// Generates a new encryption key
//
// @returns {Promise<Object>} - The encryption key and base64 encoded key
//
export async function generateEncryptionKey() {
  const key = await generateKey()
  const jsonKey = await exportKey(key)
  const base64Key = btoa(jsonKey)
  console.log({ key: base64Key })
  return { key, base64Key }
}

// Encrypts and logs a list of values
//
// @param {String} base64Key - The encryption key to use
// @param {Array} values - The values to encrypt
// @returns {Promise<Object>[]} - The encrypted values
//
export async function encryptValues(base64Key, values = []) {
  const key = await importKey(atob(base64Key))
  const encryptedValues = values.map(async value => {
    const encrypted = await encrypt(value, key)
    const data = { value, encrypted }
    console.log(data)
    return data
  })
  return encryptedValues
}

// Generates a new encryption key and encrypts a list of values
//
// @param {Array} values - The values to encrypt
// @returns {Promise<Object>} - The encryption key and encrypted values
//
export async function generateEncryptionKeyAndEncryptValues(values = []) {
  const keyData = await generateEncryptionKey()
  const encryptedValues = await encryptValues(keyData.base64Key, values)
  return { keyData, encryptedValues }
}
