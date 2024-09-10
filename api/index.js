const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/'});
const fs = require('fs');


const salt = bcrypt.genSaltSync(10);
const secret = 'aefaefepghsesfkjbLE'

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json()); //parse the json from the request
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect('mongodb+srv://blogify:ZrgEdVZWuO8CsiEJ@cluster0.pc7cm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

//Register endpoint

app.post('/register', async (req, res) => {
    const {username, password} = req.body; 
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password,salt),
        })
        res.json(userDoc)
    } catch (e) {
        res.status(400).json(e)
    }
});


//Login endpoint

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        jwt.sign({username, id:userDoc._id}, secret, {}, (err,token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username,
            }); //setting the token to the real token when logged in
        });
    } else {
        res.status(400).json('Incorrect credentials');
    }
});

//Profile endpoint

app.get('/profile', (req, res) => {
    const { token } = req.cookies; //grabbing token from req.cookies
    if (!token) {
        return res.status(401).json({ message: 'JWT must be provided' });
      };
    jwt.verify(token, secret, {}, (err, info) => { //the token can only be read/verified on the backend side with the secret (defined on line 12)
        //iat is the time when the jwt is issued on. it is not mandatory to be included, but good to have should you choose to invaldate a token after a particular period of time
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        res.json(info);
    });
})

//Logout endpoint

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok'); //setting the token to an empty string and the json as ok
});


//Create post endpoint

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => { 
        if (err) throw err;
        const {title, summary, content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover:newPath,
            author:info.id,
        })
        res.json(postDoc);
    });
});

app.put('/post', uploadMiddleware.single('file'), async(req, res) => {
    let newPath = null;
    if (req.file) {
        const {originalname, path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => { 
        if (err) throw err;
        const {id, title, summary, content} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if(!isAuthor) {
            return res.status(400).json('You are not the author');
        }
        await postDoc.updateOne({
            title, 
            summary, 
            content,
            cover: newPath ? newPath : postDoc.cover,
        });
        res.json(postDoc);
    });
})

app.get('/post', async (req, res) =>{
   res.json(
    await Post.find()
    .populate('author', ['username'])
    .sort({createdAt: -1})
    .limit(20)
);
})

app.get('/post/:id', async(req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc)
})

// app.listen(4000, () => {
//     console.log(`Server is running on port http://localhost:4000`)
// });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
