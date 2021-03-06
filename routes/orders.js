const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const mongoose = require('mongoose');
mongoose.connect('mongodb://admin:admin123@ds135433.mlab.com:35433/adminlte');
var ObjectId = require('mongodb').ObjectId
const { isEmpty } = require('lodash');
const Validator = require('is_js');
// router.get('/orders', (req, res) => {
//     res.render('orders', {title: 'orders'});
// });
function ensureAuthenticated(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect('/Auth/login');
}
router.get('/',ensureAuthenticated,(req, res) =>{
   Order.find()
    .select(" products categories price name email contactnumber address date")
    .exec()
    .then(orders => { console.log(orders) 
        res.render('orders/list', { orders })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
 })

router.get('/add', (req, res)=>{
    res.render('orders/add',{
        title: 'Add'
    })
})

router.post('/add', (req, res)=>{
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
    if (!isValid) {
		res.render('orders/add', {
            err: errors,
            order: { products: req.body.products, categories: req.body.categories, name: req.body.name, 
                email: req.body.email, contactnumber: req.body.contactnumber, 
                address: req.body.address, date: req.body.date}
        });
    } else
    {
    var order = new Order({
        _id: new mongoose.Types.ObjectId(),
        products: req.body.products,
        categories: req.body.categories,
        price: req.body.price,
        name: req.body.name,
        email: req.body.email,
        contactnumber: req.body.contactnumber,
        address: req.body.address, 
        date: req.body.date
    });
       order
        .save()
        .then(result => {
           console.log(result);
          res.redirect('/invoices/add'),
           req.flash('Orders Created');
        })
           .catch(err =>{
               console.log(err);
               res.redirect('/orders/add')
           });
        }  
})

router.get('/edit/:id', async (req, res)=>{
    const orders = await getOrder(req.params.id);
    res.render('orders/edit',{
        title: 'Edit',
        orders
    })
});

async function getOrder(id) {
    try{
        const order = await Order.findOne({ _id: id }).exec();
        return order;
    } catch(err) {
        throw err;
    }
}

router.put('/edit/:id', (req, res)=>{
    let { isValid, errors} = validator(req.body);
    console.log(isValid, errors)
  
    if (!isValid) {

		res.render('orders/edit', {
            err: errors,
            order: { products: req.body.products, categories: req.body.categories, name: req.body.name, 
                email: req.body.email, contactnumber: req.body.contactnumber, 
                address: req.body.address, date: req.body.date}
        });
    } else
    {
   Order.update({_id: req.params.id},
        { $set:{ 
            products: req.body.products,
            categories: req.body.categories,
            price: req.body.price,
            name: req.body.name,
            email: req.body.email,
            contactnumber: req.body.contactnumber,
            address: req.body.address, 
            date: req.body.date
            
        }
    })
    .exec()
    .then(res => {
        res.redirect('/invoices/add');
        req.flash('Order Updated');
    })
    .catch(err => {
        res.redirect('/orders');
    })
}
})


router.get('/delete/:id', (req,res)=>{
    Order.remove({ _id: req.params.id})
    .exec()
    .then(result => {
        res.redirect('/orders')
    })
    .catch(err => {
        console.log(err);
        res.redirect('order/list')
    });
})

//Validation function//
function validator(data) {
    let errors = {};
    
    if (Validator.empty(data.products)) {
        errors.products = "Products is required!"
    }

    if (Validator.empty(data.categories)) {
        errors.categories = "Categories is required!"
    }

    if(Validator.empty(data.price) && !parseInt(data.price)) {
        errors.price = "Price should be in numeric form!"
    }

    if (Validator.empty(data.name)) {
        errors.name = "Name is required!"
    }

    if(Validator.empty(data.email)) {
        errors.email = "Email is required!  "
    }

    if(data.email && !Validator.email(data.email)) {
        errors.email = "Email does not appear valid!"
    }

    if(Validator.empty(data.contactnumber)){
        errors.contactnumber = "Contact number is required!"
    }
    
    if(data.contactnumber && !parseInt(data.contactnumber)) {
        errors.contactnumber = "Contact number should be in numeric form!"
    }

    if (Validator.empty(data.address)) {
        errors.address = "Address is required!"
    }

    if (Validator.empty(data.date)) {
        errors.date = "Date is required!"
    }

    return{
        isValid: isEmpty(errors),
        errors
    }
}
module.exports = router;