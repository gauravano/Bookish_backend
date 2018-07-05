const route = require('express').Router();
const Message = require('../../db').Message;
const Listing = require('../../db').Listing;

route.get('/', (req,res) => {
  if(!req.session.user){
      return res.status(400).send("Please login to see the messages.");
  }

  Message.findAll({
    include: [{
      model: Listing,
      where: { userId: req.session.user.id }
    }]
  }).then((items) => {
        res.status(200).send(items);
  }).catch((err) => {
      res.status(500).send("Couldn't fetch wishlist ");
  })
});


route.get('/:id', (req,res) => {
  console.log("Messages");

    if(!req.session.user){
        return res.status(400).send("Please login to see the messages.");
    }

    Message.findAll({
        where: {
            listingId: req.params.id
        }
    }).then((messages) => {
        return res.status(200).send(messages);
    }).catch((err) => {
        return res.status(400).send("Invalid listing Id");
    });

  //   Listing.find({
  //     where: {
  //       listingId: req.params.id
  //     }
  //   }).then((item) => {
  //     if(req.session.user.id != item.userId) {
  //         isSeller = false;
  //     }else {
  //         isSeller = true;
  //     }
  //   })
  //
  //   if(isSeller){
  //     Message.findAll({
  //         where: {
  //             listingId: req.params.id
  //         }
  //     }).then((messages) => {
  //         res.status(200).send(messages);
  //     }).catch((err) => {
  //         error: "Can't fetch messages!"
  //     })
  // } else {
  //   Message.findAll({
  //       where: {
  //           listingId: req.params.id,
  //           senderId: req.session.user.id
  //       }
  //   }).then((messages) => {
  //       res.status(200).send(messages);
  //   }).catch((err) => {
  //       error: "Can't fetch messages!"
  //   })
  // }
});

route.post('/create', (req,res) => {
    if(!req.session.user){
        return res.status(400).send("Please login to send message to the book owner.");
    }

    console.log("Message: ",req.body);

    Message.create({
        senderId: req.session.user.id,
        listingId: req.body.listingId,
        content: req.body.content
    }).then((message) => {
        res.status(201).send(message);
    }).catch((err) => {
        console.log(err);
        res.status(500).send("Couldn't send message to the book owner.");
    })
});


exports = module.exports = route;