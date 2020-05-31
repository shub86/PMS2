var mongos= require('mongoose');
mongos.connect('mongodb+srv://dbuser:saini123@cluster0-7yapm.mongodb.net/test?retryWrites=true&w=majority',{ useNewUrlParser: true }).then(() => console.log('MongoDB Connected...'))
.catch((err) => console.log(err));

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

var Category_Model=mongos.model('category',category_Schema);
module.exports=Category_Model;
