import express, {json} from 'express';
import cors from 'cors';
import pool from './db.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import { SERVICE_KEY, SERVICE_SECRET_KEY, API_BASE_URL } from './config/config.js';

import consentRouter from './routes/consentRouter.js';
import dataRouter from './routes/dataRouter.js';

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {origin: process.env.URL || '*'};

app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(json());

app.get('/pole_emplois', (req,res) => {
    res.json();
})

app.get('/', async (req, res, next) => {
    res.render('index');
})

app.use('/consent', consentRouter);
app.use('/data', dataRouter);

app.get('/passeport_de_competence/:personne', async (req,res) => {
    try {
        const personne = await pool.query("SELECT * FROM personne");
        res.json(personne.rows);
    } catch (error){
        console.log(error.message);
    }
})

app.listen(PORT, ()=> {
    console.log(`Server is listening on http://localhost:${PORT}`);
})