import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'

import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGO_URI)
const db = client.db('blogApp') //db comes from MongoClient class
const blogPosts = db.collection('blog-posts')
const users = db.collection('users')

client.connect()
console.log('Connected to Mongo')

//signup
app.post('/signup', async (req, res) => {
    const lookForUser = await users.findOne({ email: req.body.email })
    console.log("look for user ->", lookForUser)

    if (!lookForUser) { //if they're not already in, create new user
        const userAdded = await users.insertOne({ email: req.body.email, password: req.body.password })
        console.log("userAdded ---->", userAdded)
        res.send(userAdded)
    }
    else{ //if they're already an existing user, don't re-add
        res.json({ "message": "User already exists with this email" })
    }

})

//login
app.post('/', async (req, res) => {
    const userCreds = { email: req.body.email, password: req.body.password }
    const userFound = await users.findOne({ email: userCreds.email, password: userCreds.password })

    if (userFound && userFound.email === req.body.email) {
        res.status(201).send(userFound)
    } else {
        res.json({ "message": "Unsuccessful" })
    }
})

//get all posts
app.get('/home', async (req, res) => {
    const allPosts = await blogPosts.find({}).toArray()
    console.log('allPosts -->', allPosts)
    res.send(allPosts)
})

//add post
app.post('/post', async (req, res) => {
    const newBlogPost = { title: req.body.title, content: req.body.content }
    await blogPosts.insertOne(newBlogPost)

    const allPosts = await blogPosts.find().toArray()
    res.send(allPosts)
})

app.listen('8080', () => console.log('Api listening on port 8080 😎'))

