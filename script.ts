import { error } from 'console';
import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
const express = require('express');
const app = express();

var bodyParser = require('body-parser');

const mongoose = require('mongoose');
const APP_DB_NAME = 'mongodb://localhost/test';


mongoose.connect(APP_DB_NAME);
main().catch(err => console.log(err));

const ProductSchema = {
    'name': {
      type: String,
      required: true
    },
    'price': {
      type: Number,
      required: true
    },
    'maker': {
      type: String,
      required: false
    }
};

const PasswordSchema = {
    'y_password': {
        type: String,
        required: true
    }
};

const Product = mongoose.model('products', new mongoose.Schema(ProductSchema));
const Password = mongoose.model('passwords', new mongoose.Schema(PasswordSchema));

insertProduct();
insertPassword();

async function insertProduct() {
    const phone = new Product({
        name: 'Iphone',
        price: 2000,
        maker: 'Apple'
    });
    await phone.save()
}

async function insertPassword() {
    const newPassword = new Password ({
        y_password: 'BoscoTestPassword'
    })
    await newPassword.save()
}

const updateProductPrice = async (id, newPrice) => {
    newPrice = parseFloat(newPrice);
    const product = await Product.findById(id);
    product.price = newPrice.toFixed(2);
    await product.save();
    return product;
};

const deleteProduct = async (id) => {
    const product = await Product.findById(id);
    await product.deleteOne();
    return product; 
};


async function main() {
    try {

        app.listen(3000, () => {
            console.log('Сервер працює на порту 3000');
        });

        app.get('/products',  async (req, res) => {
            try {
                const products = await Product.find();
                res.json(products);
            } catch (error) {
                res.status(500).json({ message: 'Error', error });
            }
        });

        app.get('/products/:id', async (req, res) => {
            try {
                const product = await Product.findById(req.params.id);
                res.json(product);
            } catch (error) {
                res.status(500).json({ message: 'Error', error });
            }
        });

        app.patch('/product/:id/:newprice', async (req, res) =>{
            try {
                const data = await updateProductPrice(req.params.id, req.params.newprice)
                res.json(data);
            } catch (error) {
                res.status(500).json({ message: 'Error', error });
            }
        })

        app.delete('/product/:id', async (req, res) => {
            try {
                const data = await deleteProduct(req.params.id);
                res.json({ message: 'Product deleted', data });
            } catch (error) {
                res.status(500).json({ message: 'Error', error: error.message });
            }
        });

        app.get('/auntification/:x_password', async (req, res) => {
            try {
                const db_pass = await Password.findById("6707a8f2b396b8c3855ba0b7", 'y_password');
                if (db_pass.y_password === req.params.x_password) {
                    return res.json({ message: 'Password correct, auntification complete' });
                } else {
                    return res.status(403).json({ message: 'Forbidden: Incorrect password' });
                }
            } catch (error) {
                return res.status(500).json({ message: 'Error', error: error.message });
            }
        });
    }
    catch (err) {
        console.error(err);
    }
  
}

