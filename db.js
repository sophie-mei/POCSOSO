import pg from 'pg';
const {Pool} = pg;

const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnAuthorized: false
    } 
}   :
    {
        user: 'postgres',
        password: 'Paris750067',
        host: 'localhost',
        PORT: '5432',
        database: 'passeport_de_competence'
    };


const pool = new Pool(poolConfig);
export default pool;

//--psql -U postgres
//--\c passeport_de_competence (se connecter à la base de données)