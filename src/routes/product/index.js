'use strict'

const express = require('express')
const router = express.Router()
const ProductController = require('../../controllers/product.controller')
const { asyncHandler } = require('../../auth/checkAuth')
const { authenticationV2 } = require('../../auth/authUtils')

router.get('/search/:keySearch', asyncHandler(ProductController.getListSearchProduct))

router.get('', asyncHandler(ProductController.findAllProducts))
router.get('/:product_id', asyncHandler(ProductController.findProduct))


// -----
router.use(authenticationV2)

router.post('', asyncHandler(ProductController.createProduct))
router.patch('/:productId', asyncHandler(ProductController.updateProduct))

router.post('/publish/:id', asyncHandler(ProductController.publishProductByShop))

router.post('/unpublish/:id', asyncHandler(ProductController.unPublishProductByShop))

// QUERY
router.get('/drafts/all', asyncHandler(ProductController.getAllDraftsForShop))

router.get('/published/all', asyncHandler(ProductController.getAllPublishForShop))

module.exports = router