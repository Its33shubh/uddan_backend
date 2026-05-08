const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name:{
            type : String,
            require:true
        },
        email:{
            type:String,
            require:true,
            unique : true
        },
        phone:{
            type:String,
            require:true
        },
        password:{
            type:String,
            require:true
        },
        role:{
            type:String,
            enum:["rider","driver","admin"],
            default:"rider"
        }   
    },
    {
        timestamps: true
    }
)
module.exports = mongoose.model("User",userSchema)
