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
const Tag = require('../models/tags.model')
const Comment = require('../models/comment.model')

//create blogs
router.post('/create', editor_auth, upload.single('thumbnail'), async(req, res) => {
    if(!req.file){
        return res.status(404).send({error: "Thumbnail pic is required"})
    }

    if(!req.body.tags) req.body.tags = []
    if(req.body.custom_tags){
        for(let i=0;i<req.body.custom_tags.length;i+=1){
            try{
                name = req.body.custom_tags[i]
                const tag = new Tag({name: name})
                await tag.save()
                req.body.tags.push(tag._id)
            }catch(e){
                continue
            }
        }
    }

    delete req.body.custom_tags
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

//return all tags
router.get('/tags/all', async(req, res) => {
    
    try{
        const tags = await Tag.find({})
        res.send(tags)
    }catch(e){
        res.status(400).send(e)
    }

})

//return tag by id
router.get('/tags/:id', async(req, res) => {
    try{
        const tag = await Tag.findById(req.params.id)
        res.send(tag)
    }catch(e){
        res.status(400).send(e)
    }
})

//view blog
router.get('/single/:id', async(req, res) => {
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

//filter blogs by tag names associated
router.get('/filter/:id', async(req, res) => {
    try{
        const tag = await Tag.findById(req.params.id)
        await tag.populate({
            path: 'blogs',
        }).execPopulate()
        res.send(tag.blogs)
    }catch(e){
        res.status(400).send(e)
    }
})

// send all blogs to frontend
router.get('/view/all', async(req, res) => {
    res.send(Blog)
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

//remove the blog from favs
router.post('/unfavs/:id', farmer_auth, async(req, res) => {

    const blog = await Blog.findById(req.params.id)

    if(!blog){
        return res.status(404).send(e)
    }

    try{
        blog.meta.favs -= 1
        if(!req.farmer_user.fav_blogs.includes(req.params.id)) throw new Error({msg: "blogs should be in favs."})
        else{
            req.farmer_user.fav_blogs = req.farmer_user.fav_blogs.filter((blog_id) => {
                return blog_id !== blog._id
            })
        }
        await blog.save()
        await req.farmer_user.save()
        res.send({msg: "removed from favourites successfully."})
    }catch(e){
        res.status(400).send(e)
    }

})

//fetch comment data using id
router.get('/view/comment/:id', farmer_auth, async (req, res) => {
    
    try{
        const comm = await Comment.findById(req.params.id)
        if(!comm) return res.status(404).send()

        comm.populate({
            path: 'children'
        }).execPopulate()

        res.send(comm)
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

        const comment = new Comment({
            body: req.body.body,
            owner: req.farmer_user._id,
            name: req.farmer_user.name
        })

        await comment.save()
        blog.comments.push(comment._id)
        await blog.save()
        res.send({msg: "commented successfully"})

    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

//Reply to someone's comment
router.post('/comment/reply/:parent_id', farmer_auth, async (req, res) => {
    try{
        const comment = await Comment.findById(req.params.parent_id)

        const reply = new Comment({
            body: req.body.body,
            owner: req.farmer_user._id,
            name: req.farmer_user.name
        })

        await reply.save()
        comment.children.push(reply._id)
        await comment.save()
        res.send({msg: "commented successfully"})
    }catch(e){
        res.status(400).send(e)
    }
})

module.exports = router