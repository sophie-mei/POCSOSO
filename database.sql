CREATE DATABASE passeport_de_competence;
 
CREATE TABLE personne (
    id_personne SERIAL PRIMARY KEY,
    nom VARCHAR(30),
    prenom VARCHAR(30),
    date_de_naissance DATE,
    adresse VARCHAR(60)
);
 
SELECT * FROM personne;
 
INSERT INTO personne (nom,prenom,date_de_naissance,adresse) VALUES ('MACHINE','Kilien','1999-12-23','Antony');