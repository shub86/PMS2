var mongos= require('mongoose');
mongos.connect('mongodb://admin:shub%40123@172.30.32.234:27017/sampledb', {useNewUrlParser: true});
var con = mongos.connection;

var category_Schema= new mongos.Schema({
    CategoryName:{
        type:String,
        required:true,
        index:{
            unique:true,
        }
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

var Category_Model=mongos.model('Newcategory',category_Schema);
module.exports=Category_Model;