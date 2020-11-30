const express = require('express')
const router = new express.Router()
const Farmer = require('../models/Farmer.model')
const multer = require('multer')
const auth = require('../middleware/farmer_auth')
const upload = require('../db/upload')
const mongoose = require('mongoose')
const Notification = require('../models/Notify.model')

router.post('/signup', async (req, res) => {

    const farmer_user = new Farmer(req.body)

    try{
        await farmer_user.save()
        const token = await farmer_user.generateAuthToken()
        res.status(201).send({user: farmer_user, token})
    }catch(e){
        res.status(400).send(e)
    }

})

router.post('/login', async (req, res) => {

    try{
        const farmer_user = await Farmer.findByCredentials(req.body.phone, req.body.password)
        const token = await farmer_user.generateAuthToken()
        res.send({farmer_user, token})
    }catch(e){
        res.status(400).send(e)
    }

})

router.post('/logout', auth, async (req, res) => {

    try{
        req.farmer_user.tokens = req.farmer_user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.farmer_user.save()
        res.send()

    }catch(e){
        res.status(400).send(e)
    }
})

router.patch('/update', auth, upload.single('prof_pic'), async (req, res) => {
    const updates = Object.keys(req.body)
    const farmer_user = req.farmer_user

    if(req.file){
        farmer_user.dp_url = req.file.filename
    }

    try{
        
        updates.forEach((update) => {
                farmer_user[update] = req.body[update]
        })

        await farmer_user.save()

        res.send(farmer_user)
    }catch(e){
        res.status(400).send(e)
    }

})

router.get('/view/me', auth, async(req, res) => {
    res.send(req.farmer_user.toMyProfile())
})

router.get('/view/public/:id', async(req, res) => {
    try{
        const farmer = await Farmer.findById(req.params.id)
        if(!farmer) return res.status(404).send()
        res.send(farmer.toPublicProfile())
    }catch(e){
        res.status(400).send(e)
    }
})

//view notifications
router.get('/notifications/view', auth, async(req, res) => {
    try{
        await req.farmer_user.populate({
            path: 'notifications'   
        }).execPopulate()
        res.send(req.farmer_user.notifications)
    }catch(e){
        res.status(400).send(e)
    }
})

//delete notification
router.post('/notifications/delete/:id', auth, async(req, res) => {
    try{
        const not = await Notification.deleteOne({_id: req.params._id})
        req.farmer_user.notifications = req.farmer_user.notifications.filter((not) => {
            not._id !== req.params.id
        })
        await req.farmer_user.save()
        res.send({msg: "deleted notification"})
    }catch(e){
        res.status(400).send(e)
    }
})

module.exports = router