const Listing = require('../../db').Listing;
const route = require('express').Router();
const multer = require('multer');

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString() + file.originalname);
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits:{
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
});


// Check File Type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype){
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
}

route.get('/', (req, res) => {
    Listing.findAll()
        .then((listings) => {
            res.status(200).send(listings);
        })
        .catch((err) => {
            res.status(500).send({
                error: "Could not fetch book listings. Sorry :( "
            })
        })
});

route.get('/:id',(req,res) => {
    Listing.find({
        where: {
            id: req.params.id
        }
    }).then((listing) => {
        if(listing){
            return res.status(200).send(listing);
        }else{
            return res.status(404).send("No listing with such id exist!");
        }
    }).catch((err) => {
        return res.status(500).send({
            error: "Could not fetch book listings. Sorry :( "
        });
    })
});

route.post('/add', upload.single('bookImage'), (req,res, next) => {
   if(!req.session.user){
       return res.status(401).send("Please login to create listing.");
   }

   console.log("Request file: ", req.file);
   console.log("Request body: ", req.body);

   Listing.create({
       book_name: req.body.book_name,
       author_name: req.body.author_name,
       price: req.body.price,
       condition: req.body.condition,
       userId: req.session.user.id,
       book_image_url: req.file.path
   }).then((listing) => {
       res.status(201).send(listing);
   }).catch((err) => {
       console.log(err);
       res.status(500).send({
           error: "Could not create new listing. Sorry :("
       })
   })
});

route.get('/delete/:id', (req,res) => {

    if(!req.session.user){
        return res.status(401).send("Please login to delete listing.");
    }

    Listing.find({
        where: {
            id: req.params.id
        }
    }).then((listing) => {
        if(listing.userId === req.session.user.id){
            Listing.destroy({
                where: {
                    id: req.params.id
                }
            });
            return res.status(200).send("Listing removed successfully!");
        }else{
            return res.status(403).send("Only seller can delete a listing");
        }
    }).catch((err) => {
        return res.status(500).send("Listing can't be deleted!");
    })

});

module.exports = route;
