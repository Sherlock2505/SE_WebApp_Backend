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

router.post('/sell',farmer_auth, upload.fields([{name:'thumbnail', maxCount:1},{name:'gallery', maxCount:8}]), async (req, res)=>{
    const crop = new Crop({
        ...req.body,
        owner: req.farmer_user._id,
        location: req.farmer_user.location,
        pincode: req.farmer_user.pincode
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
        // console.log(e)
        res.status(400).send(e)
    }

})

//on-sale list for farmers
router.get('/view/all', farmer_auth, async(req, res) => {
    
    try{
        const crop_list = await Crop.find({ owner: req.farmer_user._id})

        if(crop_list.length===0){
            return res.status(404).send(e)
        }

        res.send(crop_list)

    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }

})

router.get('/view/:id',farmer_auth, async(req, res)=> {
    
    try{
        const crop = await Crop.findOne({_id:req.params.id, owner: req.farmer_user._id})

        if(!crop){
            return res.status(404).send()
        }

        res.send(crop)

    }catch(e){
        console.log(e)
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

        if(!crop){
            res.status(404).send()
        }

        const bid = {
            dealer: req.dealer_user._id,
            bid_val: req.body.value
        }

        crop.biddings.push(bid)
        await crop.save()
        res.status(200).send({msg:"bidded successfully"})
    }catch(e){
        // console.log(e)
        res.status(400).send(e)
    }

})

//view crops using filters
router.get('/filter', async (req, res) => {
    
    let {crop_type, crop_variety, price_min, price_max, qty_min, qty_max, pincode} = req.query

    let query = {}
    if(crop_type) query.type = crop_type
    if(crop_variety) query.variety = crop_variety
    query.MSP = { $lte: price_max || 1000000000, $gte: price_min || 0 }
    query.qty = { $lte: qty_max || 1000000000, $gte: qty_min || 0}
    if(pincode) query.pincode = pincode
    
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
router.post('/ask/:id', dealer_auth, async(req, res) => {
    try{
        const crop = await Crop.findById(req.params.id)
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
router.post('/answer/:id', farmer_auth, async(req,res) => {
    
    try{
        const crop = await Crop.findOne({_id: req.params.id, owner: req.farmer_user._id})
        if(!crop){
            return res.status(404).send()
        }
        crop.faqs.find((faq) => faq._id.equals(req.body.id)).answer = req.body.answer
        await crop.save()
        res.send({msg:"Successfully answered the query"})
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }

})


module.exports = router
