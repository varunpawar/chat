var express = require('express');

const bodyParser =require('body-parser');
const mongoose=require('mongoose');


var chatRouter  = express.Router();
chatRouter.use(bodyParser.json());

chatRouter.get('/',(req,res)=>{
    console.log('hello get');
    res.render('chat');
});

chatRouter.post('/',(req,res)=>{
    console.log('hello post');
});

module.exports=chatRouter;