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
        owner: req.farmer_user._id
    })

    try{
        if(req.files){
            let all_file = req.files['gallery']
            if(!req.files['thumbnail']){
                throw new Error('Thumbnail pic is required')
            }
            const thumbnail_pic = req.files['thumbnail'][0].filename
            pics_url = all_file.map((file) => {return file.filename})
            crop.snapshots = pics_url
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

router.get('/view/:id',farmer_auth, async(req, res)=> {
    
    try{
        const crop = await Crop.findOne({_id:req.params.id, owner: req.farmer_auth._id})

        if(!crop){
            res.status(404).send()
        }

        res.send(crop)

    }catch(e){
        res.status(400).send(e)
    }

})


