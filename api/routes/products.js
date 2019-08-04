const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');

const checkAuth = require("../middleware/check-auth");
const Product = require("../models/product");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, new Date() + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req, file, cb) => {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

router.get('/', (req, res, next) => {
    Product.find()
    .select('_id price name productImage')
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save()
    .then(result => {
        res.status(201).json({
            success: true,
            message: "Product has been created successfully"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('_id price name productImage')
    .exec()
    .then(doc => {
        if(doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({
                success: false,
                message: "No valid entry found for product ID"
            });
        }
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.update({_id: id}, {$set: req.body})
    .exec()
    .then(result => {
        res.status(200).json({
            success: true,
            message: "Product updated successfully"
        });
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

module.exports = router;