import express, {json} from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {origin: process.env.URL || '*'};

app.use(cors(corsOptions));
app.use(json());

app.get('/consentement_export', (req,res) => {
    res.json("Hello");
})

app.get('/passeport_de_competence/:personne', async (req,res) => {
    try {
        const personne = await pool.query("SELECT * FROM personne");
        res.json(personne.rows);
    } catch (error){
        console.log(error.message);
    }
})

app.listen(PORT, ()=> {
    console.log('Server is listening on port:${PORT}');
})