const express = require('express')
const router = new express.Router()
const Dealer = require('../models/Dealer.model')
const multer = require('multer')
const auth = require('../middleware/dealers_auth')
const upload = require('../db/upload')
const mongoose = require('mongoose')
const Crop = require('../models/Crop.model')
const Notification = require('../models/Notify.model')

router.post('/signup', async (req, res) => {

    const dealer_user = new Dealer(req.body)

    try{
        await dealer_user.save()
        const token = await dealer_user.generateAuthToken()
        res.status(201).send({user: dealer_user, token})
    }catch(e){
        res.status(400).send(e)
    }

})

router.post('/login', async (req, res) => {

    try{
        const dealer_user = await Dealer.findByCredentials(req.body.phone, req.body.password)
        const token = await dealer_user.generateAuthToken()
        res.send({dealer_user, token})
    }catch(e){
        res.status(400).send(e)
    }

})

router.post('/logout', auth, async (req, res) => {

    try{
        req.dealer_user.tokens = req.dealer_user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.dealer_user.save()
        res.send()

    }catch(e){
        res.status(400).send(e)
    }
})

router.patch('/update', auth, upload.single('prof_pic'), async (req, res) => {
    const updates = Object.keys(req.body)
    const dealer_user = req.dealer_user

    if(req.file){
        dealer_user.dp_url = req.file.filename
    }

    try{
        
        updates.forEach((update) => {
                dealer_user[update] = req.body[update]
        })

        await dealer_user.save()

        res.send(dealer_user)
    }catch(e){
        res.status(400).send(e)
    }

})

router.get('/view/me', auth, async(req, res) => {
    res.send(req.dealer_user.toMyProfile())
})

//dealers to get view of crops according to their bids
router.get('/view/bids', auth, async(req, res) => {
    try{
        let crops = []
        
        for(let i=0;i<req.dealer_user.bidcrops.length;i+=1){
            const crop = await Crop.findById(req.dealer_user.bidcrops[i])
            crops.push(crop)
        }

        if(crops.length===0) return res.status(404).send()
        crops = crops.filter((crop) => {
            let flag = false
            for(let i=0;i<crop.biddings.length;i+=1){
                if(crop.biddings[i].dealer.equals(req.dealer_user._id) && crop.biddings[i].status == req.query.bid_status){
                    flag = true
                    break
                }
            }
            return flag
        })

        if(crops.length===0) return res.status(404).send()
        res.send(crops)
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
    
})

router.get('/view/public/:id', async(req, res) => {
    try{
        const dealer = await Dealer.findById(req.params.id)
        if(!dealer) return res.status(404).send()
        res.send(dealer.toPublicProfile())
    }catch(e){
        res.status(400).send(e)
    }
})

//view notifications
router.get('/notifications/view', auth, async(req, res) => {
    try{
        await req.dealer_user.populate({
            path: 'notifications'   
        }).execPopulate()
        res.send(req.dealer_user.notifications)
    }catch(e){
        res.status(400).send(e)
    }
})

//delete notification
router.post('/notifications/delete/:id', auth, async(req, res) => {
    try{
        const not = await Notification.deleteOne({_id: req.params._id})
        req.dealer_user.notifications = req.dealer_user.notifications.filter((not) => {
            not._id !== req.params.id
        })
        await req.dealer_user.save()
        res.send({msg: "deleted notification"})
    }catch(e){
        res.status(400).send(e)
    }
})

module.exports = router