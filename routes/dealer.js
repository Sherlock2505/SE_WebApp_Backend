const express = require('express')
const router = new express.Router()
const Dealer = require('../models/Dealer.model')
const multer = require('multer')
const auth = require('../middleware/dealers_auth')
const upload = require('../db/upload')
const mongoose = require('mongoose')

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

module.exports = router