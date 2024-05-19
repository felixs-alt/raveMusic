const express = require('express');
const mongoose = require('mongoose');

const app = express();
const ytdlp = require('ytdlp-nodejs')
const {createWriteStream} = require('fs')

app.use(express.json());

app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
});

app.post(“/ytwav”, (request, response) => {
    const url = req.body.url;
    ytdlp.stream(url: url,{filter: "extractaudio",quality: 10, format: "wav"}):stream
    
 });