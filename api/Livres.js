const express = require("express");

const router = express.Router();

const knex = require("../db/knex");

const Livre = require("../Classes/Livre");
const { response } = require("express");

//CRUD Livres
router.get("/", (req, res) => {
  knex("livres")
  .join("ecrit", "livres.id_livres", "=", "ecrit.livres_id_livres")
  .join("auteur", "id_auteur", "=", "ecrit.auteur_id_auteur")
  .join("possede", "livres.id_livres", "=", "possede.livres_id_livres")
  .join("genre", "id_genre", "=", "possede.genre_id_genre")
  .select("livres.*", "auteur.prenom", "auteur.nom", "genre.libelle", "genre.genre_description")
  .select("livres.*", "auteur.prenom", "auteur.nom")
  .then((livres) => {
    res.json(livres);
  })
  .catch((err) => {
    console.error(err);
  });
});
router.get("/:id", (req, res) => {
  knex("livres")
  .select("livres.*", "auteur.prenom", "auteur.nom", "genre.libelle", "genre.genre_description")
  .where({ id_livres: req.params.id })
  .join("ecrit", "livres.id_livres", "=", "ecrit.livres_id_livres")
  .join("auteur", "id_auteur", "=", "ecrit.auteur_id_auteur")
  .join("possede", "livres.id_livres", "=", "possede.livres_id_livres")
  .join("genre", "id_genre", "=", "possede.genre_id_genre")
  .then((livre) => {
    res.json(livre);
  })
  .catch((err) => {
    console.error(err);
  });
});
router.post("/", (req, res) => {
  knex.transaction((trx) => {
    knex("livres")
    .transacting(trx)
    .insert({
      titre: req.body.titre,
      livres_description: req.body.livre_desc,
      image: req.body.image
    })
    .then((response) => {
      let idLivre = response[0];
      return knex("ecrit")
      .transacting(trx)
      .insert({livres_id_livres: idLivre, auteur_id_auteur: req.body.id_auteur})
      .then(() => {
        return knex("possede")
        .transacting(trx)
        .insert({livres_id_livres: idLivre, genre_id_genre: req.body.id_genre});  
      })
    })
    .then(trx.commit)
    .catch(trx.rollback);
  })
  .then(() => {
    res.send("Nouveau livre créé : " + req.body.titre + ".");
  })
  .catch((err) => {
    console.error(err);
  });
});
router.put("/:id", (req, res) => {
  knex.transaction((trx) => {
    knex("livres")
    .transacting(trx)
    .update({
      titre: req.body.titre,
      livres_description: req.body.livre_desc,
      image: req.body.image,
    })
    .where({ id_livres: req.params.id })
    .then(() => {
      return knex("ecrit")
      .transacting(trx)
      .update({auteur_id_auteur: req.body.id_auteur})
      .where({livres_id_livres: req.params.id})
      .then(() => {
        return knex("possede")
        .transacting(trx)
        .update({genre_id_genre: req.body.id_genre})
        .where({livres_id_livres: req.params.id})
      })
    })
    .then(trx.commit)
    .catch(trx.rollback);
  })
  .then(() => {
    res.send("Le livre n°" + req.params.id + " a bien été modifié !");
  })
  .catch((err) => {
    alert(err);
  });
});
router.delete("/:id", (req, res) => {
  knex("livres")
    .delete()
    .where({ id_livres: req.params.id })
    .then(() => {
      res.send("Le livre n°" + req.params.id + " a bien été supprimé");
    })
    .catch((err) => {
      alert(err);
    });
});

module.exports = router;
