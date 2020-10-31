const express = require('express')
const router = new express.Router()
const Editor = require('../models/Editor.model')
const Farmer = require('../models/Farmer.model')
const multer = require('multer')
const editor_auth = require('../middleware/editor_auth')
const farmer_auth = require('../middleware/farmer_auth')
const upload = require('../db/upload')
const mongoose = require('mongoose')
const Blog = require('../models/Blog.model')

router.post('/create', editor_auth, upload.single('thummbnail'), async(req, res) => {
    if(!req.file){
        return res.status(404).send({error: "Thumbnail pic is required"})
    }

    const blog = new Blog({
        ...req.body,
        owner: req.editor_user._id,
        thumbnail: req.file.filename
    })

    try{
        await blog.save()
        res.send(blog)
    }catch(e){
        res.status(400).send(e)
    }

})