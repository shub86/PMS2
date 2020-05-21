var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var userModel = require('../modules/user');
var categoryModel = require('../modules/category');
var passwordModel = require('../modules/password');
var bcrypt = require('bcryptjs');// packaege for Encript pass
var jwt = require('jsonwebtoken'); // package for create token

// here we call a method for find all detials form category model tabel
var getCategory = categoryModel.find({});

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}


/* GET home page. */
// this is a middleware funtion for check user Token created or not
// all function have 3 parameter (req,res,next) the order must be like this 
function checkUserLogin(req, res, next) {
  var userToken = localStorage.getItem('userToken');
  try {
    if (req.session.userName) {
      var decoded = jwt.verify(userToken, 'LoginToken');
    }
    else {
      res.redirect('login');
    }
  } catch (err) {
    // res.redirect('login');
  }
  next();
}
// this is a middleware funtion for check Email
function checkEmail(req, res, next) {
  var email = req.body.email;
  var userEmail = userModel.findOne({ email: email })
  userEmail.exec((err, data) => {
    if (err) throw err;
    if (data) {
      return res.render('index', { title: 'Express', msg: 'The Email is already Registered' });
    }
    next();
  });

}
// this is a middleware funtion for check user name
function checkUserName(req, res, next) {

  var user = req.body.user;
  var userEmail = userModel.findOne({ userName: user })
  userEmail.exec((err, data) => {
    if (err) throw err;
    if (data) {
      return res.render('index', { title: 'Express', msg: 'The user Name is already Registered' });
    }
    next();
  });

}


router.get('/help', function (req, res, next) {
  var user = req.session.userName;
    res.render('help',{msg:user});
  
});
//The route is used for get method to open the home directory index page
router.get('/', function (req, res, next) {

  if (req.session.userName) {
    res.redirect('userDash');
  }
  else {
    res.render('index', { title: 'Express', msg: '' });
  }
});
/*The route is used for post method to open the home directory index page
  index page is work ad sing up page the route is register the user */
router.post('/', checkEmail, checkUserName, function (req, res, next) {
  var userName = req.body.user;
  var Email = req.body.email;
  var password = req.body.pass;

  var newPass = bcrypt.hashSync(password, 10);

  var userDetails = new userModel({
    userName: userName,
    email: Email,
    password: newPass,
  });
  userDetails.save((err, res1) => {
    if (err) throw err;
    res.render('index', { title: 'Express', msg: 'You have  Successfuly Register Please Login !' });
  });
});
//The route is used for get method to open the login page
router.get('/login', function (req, res, next) {

  if (req.session.userName) {
    res.redirect('userDash');
  }
  else {
    res.render('login', { title: 'User Login', msg2: '' });
  }
});
/*The route is used for post method to open the login page 
and check the userName and pass is valid or not*/
router.post('/login', function (req, res, next) {
  var userName = req.body.user;
  var password = req.body.pass;
  // find and match user name in data base
  var CheckUser = userModel.findOne({ userName: userName });
  CheckUser.exec((err, data) => {
    if (err) throw err;
    var getPass = data.password;
    var getUserId = data._id;

    if (bcrypt.compareSync(password, getPass)) // match the value of current pass and data base pass  using Bcrypt
    {
      // here we create a web token
      var token = jwt.sign({ userId: getUserId }, 'LoginToken');
      //Store token value into local storage it work as a session 
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginUser', userName);
      req.session.userName = userName;
      res.redirect('userDash');

    } else {
      res.render('login', { title: 'User Login', msg2: 'login falids' });
    }

  });

});

router.get('/userDash', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var getUserPassDetail = passwordModel.countDocuments({ userName: user });
  getUserPassDetail.exec((err, count) => {
    categoryModel.countDocuments({}).exec((err, countCate) => {
      res.render('userDash', { title: 'All password Details', title2: 'All Category Details ', record: count, msg: user, record2: countCate });

    });
  });
});
// the route for logout the user
router.get('/logout', checkUserLogin, function (req, res, next) {

  req.session.destroy(function (err) {
    if (err) {
      res.redirect('login');
    }
  });

});
// The route for add new category  get mehtod
router.get('/NewCategory', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  res.render('NewCategory', { title: 'Add New password category', msg: user, success: '', faild: '' });
});
// The route for add new category  for post mehtod
router.post('/NewCategory', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var NewCat = req.body.newCat;
  var cateCheck = getCategory.find({ CategoryName: NewCat });
  cateCheck.exec((err, data) => {
    if (err) throw err;
    if (data) {

      res.render('NewCategory', { title: 'Add New password category', msg: user, success: '', faild: 'The category Name is already exist use different' });
    }
    else {
      //here we create a object of category model
      var categoryDetail = new categoryModel({
        CategoryName: NewCat,
        userName: user,
      });
      categoryDetail.save((err, res1) => {
        if (err) throw err;
        res.render('NewCategory', { title: 'Add New password category', msg: user, success: 'Category Added Successfully ' });
      });
    }
  });
});
// The route for  view all category  get mehtod
router.get('/passwordCategory', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var getCategoryUser = categoryModel.find({ userName: user })
  getCategory.exec((err, data) => {
    if (err) throw err;
    getCategoryUser.exec((err, data1) => {
      if (err) throw err;
      res.render('passwordCategory', { title: 'Category you have created', msg: user, record: data, record1: data1, delMsg: '', editMsg: '' });

    });

  });

});
// The route for  Delete category  get mehtod
router.get('/deleteCate/:id', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var id = req.params.id;

  var deletCate = categoryModel.findByIdAndDelete(id);

  deletCate.exec((err, res1) => {
    if (err) throw err;
    getCategory.exec((err, data) => {
      if (err) throw err;
      res.render('passwordCategory', { title: 'All password category', msg: user, editMsg: '', record: data, delMsg: 'Deleted Successfully' });
    });
  });

});
// The route for add update category  get mehtod
router.get('/updateCate/:id', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var id = req.params.id;

  var updateCate = categoryModel.findById(id);
  updateCate.exec((err, data) => {
    if (err) throw err;
    if (data) {
      res.render('updateCate', { title: 'All password category', msg: user, record: data, editMsg: '' });
    }

  })

});
// The route for  update category  post mehtod
router.post('/updateCate', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var id = req.body.id;
  var editCate = req.body.newCate;

  var newCate = categoryModel.findByIdAndUpdate(id, {
    CategoryName: editCate,
  });

  newCate.exec((err, res1) => {
    if (err) throw err;
    getCategory.exec((err, data) => {
      if (err) throw err;
      res.render('passwordCategory', { title: 'All password category', msg: user, record: data, delMsg: '', editMsg: 'Category Updated Successfully' });
    });
  });

});
// the route for view all password details
router.get('/passwordDetails', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var key = "8545%%key" + user;
  var dec = [];
  var i = 0;
  var perPage = 3;
  var page = 1;
  // fetch data from database for panigation
  var getUserPassDetail = passwordModel.find({ userName: user }).skip((perPage * page) - perPage)
    .limit(perPage);
  getUserPassDetail.exec((err, data) => {
    if (err) throw err;
    data.forEach(function (row) {
      // create a array and store the decrepted value in array
      dec[i] = [crypto.createDecipher("aes-256-ctr", key).update(row.passwordDetail, "hex", "utf-8")];
      i++;
    });

    passwordModel.countDocuments({ userName: user }).exec((err, count) => {
      res.render('passwordDetails', {
        title: 'All password Details', passdata: dec, record: data,
        current: page,
        pages: Math.ceil(count / perPage), msg: user, editMsg: '', delMsg: ''
      });
    });
  });
});
//the route is used for page number in panigation
router.get('/passwordDetails/:page', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var key = "8545%%key" + user;
  var dec = [];
  var i = 0;
  var perPage = 3;
  var page = req.params.page || 1;
  var getUserPassDetail = passwordModel.find({ userName: user }).skip((perPage * page) - perPage)
    .limit(perPage);
  getUserPassDetail.exec((err, data) => {
    if (err) throw err;
    data.forEach(function (row) {

      dec[i] = [crypto.createDecipher("aes-256-ctr", key).update(row.passwordDetail, "hex", "utf-8")];
      i++;
    });
    //  dec.forEach(function(row){
    //    console.log(row);
    //  });
    passwordModel.countDocuments({ userName: user }).exec((err, count) => {
      res.render('passwordDetails', {
        title: 'All password Details', passdata: dec, record: data,
        current: page,
        pages: Math.ceil(count / perPage), msg: user, editMsg: '', delMsg: ''
      });
    });
  });
});

// the route for add New password details
router.get('/NewDetails', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  getCategory.exec((err, data) => {
    if (err) throw err;
    res.render('NewDetails', { title: 'Add New password Details', msg: user, record: data, success: '' });
  });

});
// Add new pass details using this route
router.post('/NewDetails', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;

  var categoryName = req.body.cateName;
  var projectName = req.body.projectName;
  var passDetails = req.body.passDetails;
  // create a key for encript the Pass details
  var key = "8545%%key" + user;
  console.log(key);
  // function for upate the encript pass details
  var EncriptPass = crypto.createCipher("aes-256-ctr", key).update(passDetails, "utf-8", "hex");
  console.log(EncriptPass);

  var NewPassDetail = new passwordModel({
    CategoryName: categoryName,
    userName: user,
    ProjectName: projectName,
    passwordDetail: EncriptPass,
  });

  NewPassDetail.save((err, res1) => {
    if (err) throw err;
    getCategory.exec((err, data) => {
      if (err) throw err;
      res.render('NewDetails', { title: 'Add New password Details', msg: user, record: data, success: 'Password Inserted Successfully' });
    });
  });

});
// Delete Password Details 
router.get('/deletePass/:id', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var id = req.params.id;
  var key = "8545%%key" + user;
  var dec = [];
  var i = 0;
  var perPage = 3;
  var page = 1;
  var deletPass = passwordModel.findByIdAndDelete(id);
  // find details 
  var getUserPassDetail = passwordModel.find({ userName: user }).skip((perPage * page) - perPage)
    .limit(perPage);
  deletPass.exec((err, res1) => {
    if (err) throw err;
    getUserPassDetail.exec((err, data) => {
      if (err) throw err;
      data.forEach(function (row) {
        // create a array and store the decrepted value in array
        dec[i] = [crypto.createDecipher("aes-256-ctr", key).update(row.passwordDetail, "hex", "utf-8")];
        i++;
      });

      passwordModel.countDocuments({ userName: user }).exec((err, count) => {
        res.render('passwordDetails', {
          title: 'All password Details', passdata: dec, record: data,
          current: page,
          pages: Math.ceil(count / perPage), msg: user, editMsg: '', delMsg: 'Deleted Successfully'
        });
      });
    });

  });

});
// edit Password Details 
router.get('/editPass/:id', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var id = req.params.id;
  var key = "8545%%key" + user;
  var dec;
  var i = 0;
  var perPage = 3;
  var page = 1;
  var editPass = passwordModel.findById(id);
  editPass.exec((err, data1) => {
    if (err) throw err;

    // create a array and store the decrepted value in array
    console.log(data1.passwordDetail);
    dec = crypto.createDecipher("aes-256-ctr", key).update(data1.passwordDetail, "hex", "utf-8");


    getCategory.exec((err, data) => {
      if (err) throw err;
      res.render('editPass', { title: 'All password Details', msg: user, record: data, record1: data1, DcrptPass: dec, success: '' });
    });
  });
});


// edit Password Details 
router.post('/editPass', checkUserLogin, function (req, res, next) {
  var user = req.session.userName;
  var id = req.body.id;
  var cateName = req.body.cateName;
  var projectName = req.body.projectName;
  var passDetail = req.body.passDetails;
  var key = "8545%%key" + user;
  var dec = [];
  var i = 0;
  var perPage = 3;
  var page = 1;
  console.log(key);
  // function for upate the encript pass details
  var EncriptPass = crypto.createCipher("aes-256-ctr", key).update(passDetail, "utf-8", "hex");
  var getUserPassDetail = passwordModel.find({ userName: user }).skip((perPage * page) - perPage)
    .limit(perPage);
  var NewEditPass = passwordModel.findByIdAndUpdate(id, {
    CategoryName: cateName,
    ProjectName: projectName,
    passwordDetail: EncriptPass,
  });
  // update pass details
  NewEditPass.exec((err, res1) => {
    if (err) throw err;
    // fetch stored details
    getUserPassDetail.exec((err, data) => {
      if (err) throw err;
      data.forEach(function (row) {
        // create a array and store the decrepted value in array
        dec[i] = [crypto.createDecipher("aes-256-ctr", key).update(row.passwordDetail, "hex", "utf-8")];
        i++;
      });

      passwordModel.countDocuments({ userName: user }).exec((err, count) => {
        res.render('passwordDetails', {
          title: 'All password Details', passdata: dec, record: data,
          current: page,
          pages: Math.ceil(count / perPage), msg: user, editMsg: 'Password updated successfully', delMsg: ''
        });
      });

    });
  });
});

module.exports = router;
