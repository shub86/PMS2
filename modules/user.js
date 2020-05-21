var mongos= require('mongoose');
mongos.connect('mongodb://admin:shub%40123@172.30.32.234:27017/sampledb', {useNewUrlParser: true});
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