'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const keyTokenService = require('./keyToken.service');
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: 'ADMIN',
}
class AccessService {

    static signUp = async ({ name, email, password }) => {
        try {
            // step1: check email exits?

            const hodelShop = await shopModel.findOne({ email}).lean();
            if (hodelShop) {
                return {
                    code: 'xxx',
                    message: 'Shop already registered',
                }
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const newShop = await shopModel.create({
                name, 
                email, 
                password: passwordHash, 
                roles: [RoleShop.SHOP]
            })

            if (newShop) {
                // create privateKey, publicKey
                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    }
                })
                // Puclic key CryptoGraphy Standards

                console.log({privateKey, publicKey})// save collection keyStore

                const publicKeyString = await keyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                })

                if(!publicKeyString) {
                    return {
                        code: 'xxx',
                        message: 'publicKeyString error',
                    }
                }

                const publicKeyobject = crypto.createPublicKey( publicKeyString )
                // created token pair
                const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyString, privateKey)
                console.log(`Created Token Success::`, tokens)
                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: newShop }),
                        tokens
                    }
                }
                // 
            }
            
            return {
                code: 200,
                metadata: null
            }

        } catch (error) {
            return {
                code: 'xxx',
                message: error.message,
                status: 'error',
            }
        }
    }
}

module.exports = AccessService;