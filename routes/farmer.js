const express = require('express')
const router = new express.Router()
const Farmer = require('../models/Farmer.model')
const multer = require('multer')
const auth = require('../middleware/farmer_auth')
const upload = require('../db/upload')
const mongoose = require('mongoose')

router.post('/signup', async (req, res) => {

    const farmer_user = new Farmer(req.body)

    try{
        await farmer_user.save()
        const token = await farmer_user.generateAuthToken()
        res.status(201).send({farmer_user, token})
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

module.exports = router