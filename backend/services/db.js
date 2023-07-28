const mongoose = require("mongoose");

async function start(){
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("MongoDB Connected");
    }catch(err){
        console.log(err);
    }
}

const ChatSchema = new mongoose.Schema({
    idRoom: {type: String, required: true},
    name: {type: String, required: true},
    online: {type: Number, required:true, default: 0},
    author: {type: Object, required:true},
    data: {type: Array, required: true, default: []}
});

const ChatModel = mongoose.model("chat", ChatSchema);

module.exports = {start, ChatModel};