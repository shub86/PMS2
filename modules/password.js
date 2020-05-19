var mongos= require('mongoose');
mongos.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true});
var con = mongos.connection;
mongos.set('useCreateIndex', true);
var password_Schema= new mongos.Schema({
    CategoryName:{
        type:String,
        required:true,   
    },
        ProjectName:{
            type:String,
            required:true,
           
        },
         passwordDetail:{
                type:String,
                required:true,
               
            },
         userName:{
                type:String,
                required:true,
                
            },
    date:{
            type:Date,
             default: Date.now,
        }
    
});

var password_Model=mongos.model('passwords',password_Schema);
module.exports=password_Model;