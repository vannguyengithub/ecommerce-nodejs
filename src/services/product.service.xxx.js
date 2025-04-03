'use strict'

const { product, clothing, electronic, furniture } = require('../models/product.model')
const { BadRequestError } = require('../core/error.response')
const { 
    findAllDraftsForShop,
    findAllPublishForShop,
    publishProductByShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById
} = require('../models/repositories/product.repo')
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils')

// define Facetory class to create product
class ProductFactory {
    /*
        type: 'Clothing' | 'Electronic'
        payload
    */
    static productregistry = {} // key-class-name, value-class

    static registerProductType(type, classRef) {
        ProductFactory.productregistry[type] = classRef
    }

    static async createProduct(type, payload) {

        const productClass = ProductFactory.productregistry[type]
        if (!productClass) throw new BadRequestError(`Invalid product type: ${type}`)

        return new productClass(payload).createProduct();
    }

    static async updateProduct(type, productId, payload) {

        const productClass = ProductFactory.productregistry[type]
        if (!productClass) throw new BadRequestError(`Invalid product type: ${type}`)

        return new productClass(payload).updateProduct(productId);
    }

    // PUT
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id })
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id })
    }

    // query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true }
        return await findAllDraftsForShop({ query, limit, skip })
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isPublished: true }
        return await findAllPublishForShop({ query, limit, skip })
    }

    static async searchProduct( {keySearch} ) {
        return await searchProductByUser({ keySearch })
    }

    static async findAllProducts( {limit = 50, sort = 'ctime', page = 1, filter = {isPublished: true}} ) {
        return await findAllProducts({ 
            limit, 
            sort, 
            page, 
            filter, 
            select: ['product_name', 'product_price', 'product_thumd'] 
        })
    }

    static async findProduct( {product_id} ) {
        return await findProduct({ product_id, unSelect: ['__v'] })
    }
}

// define base product class
class Product {
    constructor({ product_name, product_thumb, product_description, product_price, product_quantity, product_type, product_shop, product_attributes }) {
        this.product_name = product_name
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
        this.product_thumb = product_thumb
        this.product_description = product_description
    }

    // create new product
    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id })
    }

    // update Product
    async updateProduct(productId, bodyUpdate) {
        return await updateProductById({ productId, bodyUpdate, model: product })
    }
}

// define sub-class for different product types Clothing
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes)
        if (!newClothing) throw new BadRequestError('Create new clothing error')
        const newProduct = await super.createProduct()
        if (!newProduct) throw new BadRequestError('Create new product error')
            
        return newProduct
    }

    async updateProduct( productId ) {
        /*
            {
                a: underfined
                b: null
            }
        */
        // 1. remove attr has underfined, null    
        console.log(`[1]::`, this)
        const objectParams = removeUndefinedObject(this)
        console.log(`[2]::`, objectParams)
        // 2. check xem update o cho nao?
        if(objectParams.product_attributes) {
            // update child
            await updateProductById({ 
                productId, 
                bodyUpdate: updateNestedObjectParser(objectParams.product_attributes), 
                model: clothing 
            })
        }
        const updateProduct = await super.updateProduct(
            productId, 
            updateNestedObjectParser(objectParams)
        ) 
        return updateProduct
    }
}

// define sub-class for different product types Electronic
class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newElectronic) throw new BadRequestError('Create new electronic error')
            
        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError('Create new product error')

        return newProduct
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newFurniture) throw new BadRequestError('Create new furniture error')
            
        const newProduct = await super.createProduct(newFurniture._id)
        if (!newProduct) throw new BadRequestError('Create new product error')

        return newProduct
    }
}

// register product types
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Electronic', Electronic)
ProductFactory.registerProductType('Furniture', Furniture)
// end register product types

module.exports = ProductFactory;