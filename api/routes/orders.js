const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const checkAuth = require("../middleware/check-auth");
const Product = require('../models/product');
const Order = require('../models/order');

router.get('/', checkAuth, (req, res, next) => {
    Order.find()
    .select('product quantity _id')
    .populate('product', '_id name')
    .exec()
    .then(docs => {
        res.status(200).json(docs);
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

router.post('/', checkAuth, (req, res, next) => {
    Product.findById(req.body.productId)
    .exec()
    .then(product => {
        if(!product) {
            res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }
        const order = new Order({
            _id: new mongoose.Types.ObjectId(),
            product: req.body.productId,
            quantity: req.body.quantity
        });
        return order.save();
    })
    .then(result => {
        res.status(201).json({
            success: true,
            message: "Order placed"
        });
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

router.get('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
    .populate('product')
    .exec()
    .then(doc => {
        if(doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({
                success: false,
                message: "No valid entry found for order ID"
            });
        }
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

router.patch('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.update({_id: id}, {$set: req.body})
    .exec()
    .then(result => {
        res.status(200).json({
            success: true,
            message: "Order updated successfully"
        });
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    })
    .catch(err => {
        res.status(500).json(err);
    });
});

module.exports = router;