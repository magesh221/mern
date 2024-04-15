const db = require('../models/index')


exports.create = async(req,res)=>{
    const {name , email , password , phone} = req.body
    const check = await db.crud.find({email:email})
    if (check){

    }else{
        
    }
    const data ={
        name , email, password , phone 
    }
    db.crud.create(data)
    .then((result)=>{
        console.log('result: ', result);
        res.json(result)
    }).catch((err)=>{
        console.log('err: ', err);
        res.json(err)
    })
}

exports.login = async(req,res)=>{
    const {email , password } = req.body

db.crud.find({email:email})
.then((result)=>{
    console.log('result: ', result);
}).catch((err)=>{
    console.log('err: ', err);

})


}