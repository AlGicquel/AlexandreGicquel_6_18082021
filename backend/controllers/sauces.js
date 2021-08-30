const Sauce = require('../models/Sauce');
const fs = require('fs');

// Fonction de création de sauce
exports.createSauce = (req, res, next) => {
    // vérification des input pour empécher les injections
    if (verifyInput(req)) {
        // Création de l'objet Sauce
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
        // Enregistrement dans la DB
        sauce.save()
            .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
            .catch(error => res.status(500).json({ error }));
    }
};

// Fonction de récupération d'une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// Fonction de récupération d'un sauce
exports.modifySauce = (req, res, next) => {
    // Vérification des input
    if (verifyInput(req)) {
        // On récupère déja l'objet qu'on veut modifer pour pouvoir supprimer l'image qui lui est associée s'il faut la changer
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                // Si l'image a changé, on supprime la précédante
                if (req.file) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => { });
                }
                // Si l'image a changé, on upload la nouvelle sur le serveur
                const thingObject = req.file ?
                {
                    ...JSON.parse(req.body.sauce),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                } : { ...req.body };
                // On met a jour l'objet sur la base de données
                Sauce.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(501).json({ error }));
    }
    
}

// Fonction de suppression de sauce
exports.deleteSauce = (req, res, next) => {
    // On fait d'abord un findOne pour supprimer l'image sur le serveur
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        // On supprime l'image
        fs.unlink(`images/${filename}`, () => {
            // Puis on supprime l'objet de la DB
            Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// Fonction pour récupérer toutes les sauce sur de la DB
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// Fonction qui gère les likes et dislikes
exports.likeSauce = (req, res, next) => {
    // On fait d'abord un findOne pour récupérer la sauce à modifer
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            // Si l'utilisateur like une sauce
            if (req.body.like === 1) {
                // On vérifie d'abord si son userId ne l'a pas déjà liké
                if (!sauce.usersLiked.includes(req.body.userId)){
                    // Si ce n'est pas le cas on push son userId a la liste et on met à jour le nombre de likes et dislikes
                    sauce.usersLiked.push(''+req.body.userId);
                    sauce.likes = sauce.usersLiked.length;
                    sauce.dislikes = sauce.usersDisliked.length;
                }
            // On fait la même chose en cas de dislike
            } else if (req.body.like === -1) {
                if (!sauce.usersDisliked.includes(req.body.userId)){
                    sauce.usersDisliked.push(''+req.body.userId);
                    sauce.likes = sauce.usersLiked.length;
                    sauce.dislikes = sauce.usersDisliked.length;
                }
            // Si l'utilisateur enlève son like ou dislike
            } else if (req.body.like === 0) {
                // On vérifie que sont userId est bien inclus dans la liste correspondante
                if (sauce.usersLiked.includes(req.body.userId)){
                    // On boucle sur la list pour localiser son userId et le supprimer, puis on recalcule les likes et dislikes
                    for (let i=0; i<sauce.usersLiked.length; i++) {
                        if (sauce.usersLiked[i] === req.body.userId) {
                            sauce.usersLiked.splice(i,1);
                            sauce.likes = sauce.usersLiked.length;
                            sauce.dislikes = sauce.usersDisliked.length;
                        }
                    }
                // Même chose pour les dislikes
                } else if (sauce.usersDisliked.includes(req.body.userId)){
                    for (let i=0; i<sauce.usersDisliked.length; i++) {
                        if (sauce.usersDisliked[i] === req.body.userId) {
                            sauce.usersDisliked.splice(i,1);
                            sauce.likes = sauce.usersLiked.length;
                            sauce.dislikes = sauce.usersDisliked.length;
                        }
                    }
                }
            }
            // Sauce.updateOne({ _id: req.params.id }, { sauce, _id: req.params.id })
            Sauce.updateOne({ _id: req.params.id }, { sauce, _id: req.params.id, likes: sauce.likes, dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked, usersLiked: sauce.usersLiked })
                .then(() => res.status(200).json({ message: "sauce modifiée" }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => console.log(error));
}

// Fonction de cérification des dislikes
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