const express = require('express')
const router = new express.Router()
const Crop = require('../models/Crop.model')
const Dealer = require('../models/Dealer.model')
const Farmer = require('../models/Farmer.model')
const multer = require('multer')
const dealer_auth = require('../middleware/dealers_auth')
const farmer_auth = require('../middleware/farmer_auth')
const upload = require('../db/upload')
const mongoose = require('mongoose')
const Notification = require('../models/Notify.model')

router.post('/sell',farmer_auth, upload.fields([{name:'thumbnail', maxCount:1},{name:'gallery', maxCount:8}]), async (req, res)=>{
    const crop = new Crop({
        ...req.body,
        owner: req.farmer_user._id,
        location: req.farmer_user.location,
        pincode: req.farmer_user.pincode,
        sold: false
    })

    try{
        if(req.files){
            let all_file = req.files['gallery']
            if(!req.files['thumbnail']){
                throw new Error('Thumbnail pic is required')
            }
            const thumbnail_pic = req.files['thumbnail'][0].filename
            if(all_file){
                pics_url = all_file.map((file) => {return file.filename})
                crop.snapshots = pics_url
            }
            crop.thumbnail = thumbnail_pic
        }else{
            throw new Error('Something went wrong please try again')
        }

        await crop.save()
        res.send(crop)
    }catch(e){
        res.status(400).send(e)
    }

})

//on-sale or sold out list for farmers ?sold=true
router.get('/view', farmer_auth, async(req, res) => {
    
    try{
        const crop_list = await Crop.find({ owner: req.farmer_user._id, sold: req.query.sold || false})

        if(crop_list.length===0){
            return res.status(404).send()
        }

        res.send(crop_list)

    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }

})

router.get('/view/:id', async(req, res)=> {
    
    try{
        const crop = await Crop.findOne({_id:req.params.id})

        if(!crop){
            return res.status(404).send()
        }

        res.send(crop)

    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }

})

//selling the crops or making sold=true
router.post('/sold/:id', farmer_auth, async(req, res) => {
    
    try{
        const crop = await Crop.findOne({_id: req.params.id, owner: req.farmer_user._id})

        if(!crop) return res.status(404).send()

        crop.sold = true

        crop.biddings.forEach((bid) => {
            bid.status = 'sold'
        })

        await crop.save()
        res.send({msg: "sold out successfully"})
    }catch(e){
        // console.log(e)
        res.status(400).send(e)
    }

})

//view biddings on particular crop
router.get('/bids/:id', farmer_auth, async(req, res)=>{

    try{
        const crop = await Crop.findOne({_id:req.params.id, owner: req.farmer_user._id})

        if(!crop){
            return res.status(404).send()
        }

        const bids = crop.biddings
        res.send(bids)

    }catch(e){
        res.status(400).send(e)
    }

})

//edit the crop info
router.patch('/update/:id', farmer_auth, async(req, res) => {
    
    try{
        const crop = await Crop.findOne({_id: req.params.id, owner: req.farmer_user.id})

        if(!crop){
            return res.status(404).send()
        }

        const updates = Object.keys(req.body)

        updates.forEach((update) => {
            crop[update] = req.body[update]
        })

        await crop.save()
        res.send(crop)
    }catch(e){
        res.status(400).send(e)
    }

})

//dealers to bid on crop
router.post('/bid/:id', dealer_auth, async(req, res)=>{

    try{

        const crop = await Crop.findById(req.params.id)

        if(!crop || crop.sold){
            res.status(404).send()
        }

        const owner = await Farmer.findById(crop.owner)

        const bid = {
            dealer: req.dealer_user._id,
            bid_val: req.body.value,
            status: 'active'
        }

        const not = new Notification({
            type: "Bid Placed",
            msg: `A new bid is placed on crop ${crop.name}`,
            url: crop._id,
            subject: req.dealer_user._id
        })

        await not.save()
        owner.notifications.push(not._id)
        await owner.save() 
        crop.biddings.push(bid)
        await crop.save()
        if(!req.dealer_user.bidcrops.includes(crop._id)) req.dealer_user.bidcrops.push(crop._id)
        await req.dealer_user.save()
        res.status(200).send({msg:"bidded successfully"})
    }catch(e){
        // console.log(e)
        res.status(400).send(e)
    }

})

//farmers accepting the bids from available bids
router.post('/bid/accept/:crop_id/:bid_id', farmer_auth, async (req, res)=> {

    try{
        const crop = await Crop.findOne({_id: req.params.crop_id, owner: req.farmer_user._id})

        if(!crop) return res.status(404).send()
        
        let bidder;
        crop.biddings.forEach((bid) => {
            if(bid._id.equals(req.params.bid_id)){
                bid.status = 'accepted'
                bidder = bid.dealer
                return
            }
        })

        const dealer = await Dealer.findById(bidder)
        
        const not = new Notification({
            type: "Bid Accepted",
            msg: `Your bid has been accepted for ${crop.name}`,
            url: crop._id,
            subject: req.farmer_user._id
        })

        await not.save()
        dealer.notifications.push(not._id)
        await dealer.save()
        await crop.save()
        res.status(200).send({msg: "successfully accepted the bid."})
        
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

//view crops using filters
router.get('/filter', async (req, res) => {
    
    let {crop_type, crop_variety, price_min, price_max, qty_min, qty_max, pincode, sold} = req.query
    
    let query = {}
    query.sold = false
    if(crop_type) query.type = crop_type
    if(crop_variety) query.variety = crop_variety
    query.MSP = { $lte: price_max || 1000000000, $gte: price_min || 0 }
    query.quantity = { $lte: qty_max || 1000000000, $gte: qty_min || 0}
    if(pincode) query.pincode = pincode
    if(sold) query.sold = sold
    
    console.log(query)
    try{
        const results = await Crop.find(query)

        if(results.length === 0){
            return res.status(404).send()
        }

        res.send(results)
    }catch(e){
        // console.log(e)
        res.status(400).send(e)
    }
    
})

//viewing search query results using search term
router.get('/search', async(req, res) => {

    try{
        let crops

        if(!req.query.term){
            crops = await Crop.find()
        }else{
            crops = await Crop.find({ $text: {$search: req.query.term}})
        }
        
        if(crops.length===0) return res.status(404).send()
        res.send(crops)

    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

//Route for asking query regarding product
router.post('/ask/:crop_id', dealer_auth, async(req, res) => {
    try{
        const crop = await Crop.findById(req.params.crop_id)
        const faq = {
            question: req.body.question,
            owner: req.dealer_user._id,
            name: req.dealer_user.name 
        }
        crop.faqs.push(faq)
        await crop.save()
        res.status(201).send({msg:"Successfully created"})
    }catch(e){
        // console.log(e)
        res.status(400).send(e)
    }
})

//Route for answering question
router.post('/answer/:crop_id/:faq_id', farmer_auth, async(req,res) => {
    
    try{
        const crop = await Crop.findOne({_id: req.params.crop_id, owner: req.farmer_user._id})
        if(!crop){
            return res.status(404).send()
        }
        crop.faqs.find((faq) => faq._id.equals(req.params.faq_id)).answer = req.body.answer
        await crop.save()
        res.send({msg:"Successfully answered the query"})
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }

})


module.exports = router
