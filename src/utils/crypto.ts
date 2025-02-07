import CryptoJS from 'crypto-js'

const userCryptoManager = wx.getUserCryptoManager()

export const readWxEncryptedVector = (): Promise<{
  iv: CryptoJS.lib.WordArray,
  encryptKey: CryptoJS.lib.WordArray
}> => {
  return new Promise((resolve) => {
    userCryptoManager.getLatestUserKey({
      success({ encryptKey, iv }) {
        resolve({
          iv: CryptoJS.enc.Utf8.parse(iv),
          encryptKey: CryptoJS.enc.Utf8.parse(encryptKey),
        })
      }
    })
  })
}

/**
 * 加密方法
 * @param data
 * @returns {string}
 */
export async function encrypt(data: Record<string, any> | string) {
  if (typeof data === "object") {
    try {
      // eslint-disable-next-line no-param-reassign
      data = JSON.stringify(data);
    } catch (error) {
      console.log("encrypt error:", error);
    }
  }
  const dataHex = CryptoJS.enc.Utf8.parse(data as string);
  const { iv, encryptKey } = await readWxEncryptedVector()

  const encrypted = CryptoJS.AES.encrypt(dataHex, encryptKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.ciphertext.toString();
}

/**
 * 解密方法
 * @param ciphertext
 * @returns {string}
 */
export async function decrypt(ciphertext: string) {
  const { iv, encryptKey } = await readWxEncryptedVector()
  return CryptoJS.AES.decrypt(
    CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(ciphertext)),
    encryptKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }
  )
    .toString(CryptoJS.enc.Utf8);
}

export function sha256(params: Record<string, any>): string {
  return CryptoJS.SHA256(JSON.stringify(params)).toString()
}