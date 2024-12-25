'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const keyTokenService = require('./keyToken.service');
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: 'ADMIN',
}
class AccessService {
    static logout = async( keyStore ) => {
        const delKey = await keyTokenService.removeKeyById(keyStore._id)
        return delKey
    }
    
    // 1 - check email in dbs
    // 2 - match password
    // 3 - create AT vs RT and save
    // 4 - get data return login
    static login = async({ email, password, refreshToken = null }) => {

        // 1.
        const foundShop = await findByEmail({ email })
        if(!foundShop) throw new BadRequestError('Shop not registered')
        
        // 2.
        const match = bcrypt.compare( password, foundShop.password )
        if(!match) throw new AuthFailureError('Authentication error')

        // 3.
        // create privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        // 4. generate tokens
        const { _id: userId } = foundShop
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

        await keyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey, userId
        })
        return {
            shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }

    static signUp = async ({ name, email, password }) => {

        // step1: check email exits?
        const hodelShop = await shopModel.findOne({ email}).lean();
        if (hodelShop) {
            throw new BadRequestError('Error: Shop already registered!')
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
            const privateKey = crypto.randomBytes(64).toString('hex');
            const publicKey = crypto.randomBytes(64).toString('hex');

            // Puclic key CryptoGraphy Standards

            console.log({privateKey, publicKey})// save collection keyStore

            const keyStore = await keyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            if(!keyStore) {
                return {
                    code: 'xxx',
                    message: 'keyStore error',
                }
            }

            // created token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
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
    }
}

module.exports = AccessService;