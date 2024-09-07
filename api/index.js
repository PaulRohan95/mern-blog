const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


const salt = bcrypt.genSaltSync(10);
const secret = 'aefaefepghsesfkjbLE'

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json()); //parse the json from the request
app.use(cookieParser());

mongoose.connect('mongodb+srv://blogify:ZrgEdVZWuO8CsiEJ@cluster0.pc7cm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')


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

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    if (!userDoc) {
        return res.status(400).json('Incorrect credentials');
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        jwt.sign({username, id:userDoc._id}, secret, {}, (err,token) => {
            if (err) throw err;
            res.cookie('token', token).json('ok'); //setting the token to the real token when logged in
        })
    } else {
        res.status(400).json('Incorrect credentials');
    }
});

app.get('/profile', (req, res) => {
    const {token} = req.cookies; //grabbing token from req.cookies
    jwt.verify(token, secret, {}, (err, info) => { //the token can only be read/verified on the backend side with the secret (defined on line 12)
        //iat is the time when the jwt is issued on. it is not mandatory to be included, but good to have should you choose to invaldate a token after a particular period of time
        if (err) throw err;
        res.json(info);
    });
})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok'); //setting the token to an empty string and the json as ok
})

app.listen(4000, () => {
    console.log(`Server is running on port http://localhost:4000`)
});