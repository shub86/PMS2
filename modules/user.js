var mongos= require('mongoose');
mongos.connect('mongodb+srv://dbuser:saini123@cluster0-7yapm.mongodb.net/test?retryWrites=true&w=majority',{ useNewUrlParser: true ,useUnifiedTopology: true}).then(() => console.log('MongoDB Connected...'))
.catch((err) => console.log(err));
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