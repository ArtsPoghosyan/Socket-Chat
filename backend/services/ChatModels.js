const mongoose = require("mongoose");
const {ChatModel} = require("./db");


class ChatModels{
    static async getChats(){
        try{
            return await ChatModel.find({});
        }catch(err){
            console.log(err);
        }
    }

    static async getChat(query){
        try{
            return await ChatModel.findOne(query);
        }catch(err){
            console.log(err);
        }
    }

    static async createChat(state){
        try{
            await ChatModel.insertMany(state);
            return await ChatModels.getChats();
        }catch(err){
            console.log(err);
        }
    }

    static async addMessage(query, message){
        try{
            return await ChatModel.findOneAndUpdate(query, {$push: {data: message}}, {new: true});
        }catch(err){
            console.log(err);
        }
    }
    
    static async changeOnline(query, countOnline){
        try{
            return await ChatModel.findOneAndUpdate(query, {online: countOnline}, {new:true});
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = ChatModels;