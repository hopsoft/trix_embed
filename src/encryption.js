const options = { name: 'AES-GCM', length: 256 } // encryption options
const extractable = true // makes it possible to export the key
const purposes = ['encrypt', 'decrypt']

// Generates a key for use with a symmetric encryption algorithm
//
// @returns {CryptoKey} - The generated key
//
async function generateKey() {
  const extractable = true // makes it possible to export the key later
  const purposes = ['encrypt', 'decrypt']
  return await crypto.subtle.generateKey(options, extractable, purposes)
}

// Exports an encryption key
//
// @param {CryptoKey} key - The key to export
// @returns {String} - The exported key as a string
//
async function exportKey(key) {
  const exported = await crypto.subtle.exportKey('jwk', key)
  return JSON.stringify(exported)
}

// Imports an encryption key
//
// @param {String} key - The key to import as a string
// @returns {CryptoKey} - The imported key
//
async function importKey(key) {
  const parsed = JSON.parse(key)
  return await crypto.subtle.importKey('jwk', parsed, options, extractable, purposes)
}

// Encrypts a value using a symmetric encryption algorithm
//
// @param {String} value - The value to encrypt
// @param {CryptoKey} key - The key to use for encryption
// @returns {String} - Base64 encoded representation of the encrypted value
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
// @returns {String} - The decrypted value
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

// Generates and logs a new encryption key
//
// @returns {void}
//
export function generateAndLogEncryptionKey() {
  generateKey()
    .then(key => exportKey(key))
    .then(key => console.log(btoa(key)))
}

// Encrypts and logs a list of values
//
// @param {String} key - The Base64 encoded encryption key to use
// @param {String[]} values - The clear text values to encrypt
// @returns {void}
//
export function encryptAndLogValues(key, values = []) {
  importKey(atob(key)).then(key => {
    values.forEach(value =>
      encrypt(value, key).then(encrypted =>
        decrypt(encrypted, key).then(decrypted => console.log({ input: value, encrypted, decrypted }))
      )
    )
  })
}
