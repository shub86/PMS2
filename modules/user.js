var mongos= require('mongoose');
mongos.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true});
var con = mongos.connection;

var UserSchema = new mongos.Schema({

    userName:{
        type:String,
        required:true,
        index:{
            unique:true,
        }
    },
    email:{
        type:String,
        required:true,
        index:{
            unique:true,
        }
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
         default: Date.now,
    }


});
var userModel= mongos.model('user',UserSchema);
module.exports=userModel;