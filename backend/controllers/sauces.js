const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    if (verifyInput(req)) {
        const thingObject = JSON.parse(req.body.sauce);
        delete thingObject._id;
        const sauce = new Sauce({
            ...thingObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes:0,
            usersLiked: [],
            usersDisliked: []
        });
        sauce.save()
            .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
            .catch(error => res.status(500).json({ error }));
    }
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    if (verifyInput(req)) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                if (req.file) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => { });
                }
                const thingObject = req.file ?
                {
                    ...JSON.parse(req.body.sauce),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                } : { ...req.body };
                Sauce.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(501).json({ error }));
    }
    
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (req.body.like === 1) {
                if (!sauce.usersLiked.includes(req.body.userId)){
                    sauce.usersLiked.push(''+req.body.userId);
                    sauce.likes = sauce.usersLiked.length;
                    sauce.dislikes = sauce.usersDisliked.length;
                }
            } else if (req.body.like === 0) {
                if (sauce.usersLiked.includes(req.body.userId)){
                    for (let i=0; i<sauce.usersLiked.length; i++) {
                        if (sauce.usersLiked[i] === req.body.userId) {
                            sauce.usersLiked.splice(i,1);
                            sauce.likes = sauce.usersLiked.length;
                            sauce.dislikes = sauce.usersDisliked.length;
                        }
                    }
                } else if (sauce.usersDisliked.includes(req.body.userId)){
                    for (let i=0; i<sauce.usersDisliked.length; i++) {
                        if (sauce.usersDisliked[i] === req.body.userId) {
                            sauce.usersDisliked.splice(i,1);
                            sauce.likes = sauce.usersLiked.length;
                            sauce.dislikes = sauce.usersDisliked.length;
                        }
                    }
                }
            } else if (req.body.like === -1) {
                if (!sauce.usersDisliked.includes(req.body.userId)){
                    sauce.usersDisliked.push(''+req.body.userId);
                    sauce.likes = sauce.usersLiked.length;
                    sauce.dislikes = sauce.usersDisliked.length;
                }
            }
            // Sauce.updateOne({ _id: req.params.id }, { sauce, _id: req.params.id })
            Sauce.updateOne({ _id: req.params.id }, { sauce, _id: req.params.id, likes: sauce.likes, dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked, usersLiked: sauce.usersLiked })
                .then(() => res.status(200).json({ message: "sauce modifiée" }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => console.log(error));
}

function verifyInput (req) {
    const test = /[A-Za-z éèçàêëñöùä\-]/;
    if (
        test.test(req.body.name) &&
        test.test(req.body.manufacturer) &&
        test.test(req.body.description) &&
        test.test(req.body.mainPepper) 
    ) {
        return true;
    } else {
        return false;
    }
}