const express = require('express');
const mongoose = require('mongoose');
const ytdlp = require('ytdlp-nodejs')
const {createWriteStream} = require('fs')

const app = express();
const crypto = require('crypto');
app.use(express.json());
app.use(express.static('files'))
app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
});

app.post("/ytwav", (request, response) => {
    let uuid = crypto.randomUUID();
    const file = createWriteStream("files/"+uuid+".wav")
    const url = request.body.url;
    const stream = ytdlp.stream(url,{filter: "audioonly", quality: 10, format: "wav"}).pipe(file);
    response.send(uuid+".wav");
 });