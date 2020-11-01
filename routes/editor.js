const express = require('express')
const router = new express.Router()
const Editor = require('../models/Editor.model')
const multer = require('multer')
const auth = require('../middleware/editor_auth')
const upload = require('../db/upload')
const mongoose = require('mongoose')

router.post('/signup', upload.single('verification'), async (req, res) => {

    if(req.file){
        req.body.verification_url = req.file.filename
    }else{
        return res.status(400).send({error: "Verfification image or document is necessary."})
    }

    const editor_user = new Editor(req.body)

    try{
        await editor_user.save()
        const token = await editor_user.generateAuthToken()
        res.status(201).send({user: editor_user, token})
    }catch(e){
        res.status(400).send(e)
    }

})

router.post('/login', async (req, res) => {

    try{
        const editor_user = await Editor.findByCredentials(req.body.phone, req.body.password)
        const token = await editor_user.generateAuthToken()
        res.send({editor_user, token})
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }

})

router.post('/logout', auth, async (req, res) => {

    try{
        req.editor_user.tokens = req.editor_user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.editor_user.save()
        res.send()

    }catch(e){
        res.status(400).send(e)
    }
})

router.patch('/update', auth, upload.single('prof_pic'), async (req, res) => {
    const updates = Object.keys(req.body)
    const editor_user = req.editor_user

    if(req.file){
        editor_user.dp_url = req.file.filename
    }

    try{
        
        updates.forEach((update) => {
                editor_user[update] = req.body[update]
        })

        await editor_user.save()

        res.send(editor_user)
    }catch(e){
        res.status(400).send(e)
    }

})

router.get('/view/me', auth, async(req, res) => {
    res.send(req.editor_user.toMyProfile())
})

module.exports = router