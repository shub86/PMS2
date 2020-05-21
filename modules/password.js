var mongos= require('mongoose');
mongos.connect('mongodb://admin:shub%40123@172.30.32.234:27017/sampledb', {useNewUrlParser: true});
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