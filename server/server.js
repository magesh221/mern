const express = require('express')
const cors = require('cors')
// const mongoose = require('mongoose')


const port = process.env.PORT || 4682
const app = express()
const user =require('./routes/routes')
const db = require('./config/db')

// mongoose.connect()


app.use(cors())
app.use(express.json())
app.use('/user',user)

app.get('/',(req,res)=>{
    res.send('welcome to server <<<<<<<<<  $  >>>>>>>>>> !!!  ')
})

app.listen(port,function(){
    console.log(`This server is running in this url : http://localhost:${port}`);
})