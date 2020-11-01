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

router.post('/create', editor_auth, upload.single('thumbnail'), async(req, res) => {
    if(!req.file){
        return res.status(404).send({error: "Thumbnail pic is required"})
    }

    const blog = new Blog({
        ...req.body,
        owner: req.editor_user._id,
        thumbnail: req.file.filename,
        meta: {
            upv: 0,
            favs: 0
        }
    })

    try{
        await blog.save()
        res.send(blog)
    }catch(e){
        res.status(400).send(e)
    }

})

//view blog
router.get('/single/:id', farmer_auth, async(req, res) => {
    try{
        const blog = await Blog.findById(req.params.id)
    
        if(!blog){
            res.status(404).send()
        }

        res.send(blog)
    }catch(e){
        res.status(400).send(e)
    }
})

//view all blogs posted by editor
router.get('/all', editor_auth, async(req, res) => {
    try{
        const blogs  = await Blog.find({owner: req.editor_user._id})

        if(blog.length===0) return res.status(404).send()

        res.send(blogs)
    }catch(e){
        res.status(400).send(e)
    }
})

//upvote a blog by farmers
router.post('/upvote/:id', farmer_auth, async(req, res) => {

    const blog = await Blog.findById(req.params.id)

    if(!blog){
        return res.status(404).send(e)
    }

    try{
        blog.meta.upv += 1
        await blog.save()
        res.send({msg: "upvoted successfully"})
    }catch(e){
        res.status(400).send(e)
    }
    
})

//add blog to favs
router.post('/favs/:id', farmer_auth, async(req, res) => {

    const blog = await Blog.findById(req.params.id)

    if(!blog){
        return res.status(404).send(e)
    }

    try{
        blog.meta.favs += 1
        req.farmer_user.fav_blogs.push(req.params.id)
        await blog.save()
        await req.farmer_user.save()
        res.send({msg: "added to favourites successfully."})
    }catch(e){
        res.status(400).send(e)
    }

})

//Comment on the blog
router.post('/comment/:id', farmer_auth, async(req, res) => {

    try{
        const blog = await Blog.findById(req.params.id)

        if(!blog){
            return res.status(404).send()
        }

        const comment = {
            body: req.body.body,
            owner: req.farmer_user._id,
            name: req.farmer_user.name
        }

        blog.comments.push(comment)
        await blog.save()
        res.send({msg: "commented successfully"})

    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

module.exports = router