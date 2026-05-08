const mongoose = require('mongoose')

const connectDB=async ()=>{
    try {
        console.time("mongodb connect time")
        await mongoose.connect(process.env.MONGO_URL)

        console.log("MongoDB connected successfully");
        
        console.timeEnd("mongodb connect time")
    } catch (error) {
        console.log("mongoDB connection error",error.message);
        process.exit(1)
        
    }
}
module.exports = connectDB