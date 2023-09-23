const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dummy',
    password: 'postgres',
    dialect: 'postgres',
    port: 5432
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error(
            'Error acquiring client', err.stack)
    }
    client.query('SELECT NOW()', (err, result) => {
        release()
        if (err) {
            return console.error(
                'Error executing query', err.stack)
        }
        console.log("Connected to Database !")
    })
})

const createUser = async () => {
    pool.query("CREATE TABLE reguser(uid text, password text, role text)", 
    (err, res) => {
    console.log('Create Table Register');
    console.log(err, res);
    });
}

const insertUser = async (uid, password, role) => {
    const result = await pool.query(
        `INSERT INTO "reguser" ("uid", "password", "role")  
         VALUES ($1, $2, $3)`, [uid, password, role]);
    return result;
}

const getUser = async (uid, password) => {
    return pool.query('Select * from reguser WHERE uid = $1 AND password = $2 LIMIT 1', [uid, password]);
}

const existUser = async (uid) => {
    return pool.query('Select * from reguser WHERE uid = $1', [uid]);
}

const createTokenTable = async () => {
    pool.query("CREATE TABLE tokentable(token text, uid text, expiry numeric)", 
    (err, res) => {
    console.log('Create Token Table');
    console.log(err, res);
    });
}

const insertTokenTable = async (token, uid, expiry) => {
    const result = await pool.query(
        `INSERT INTO "tokentable" ("token", "uid", "expiry")  
         VALUES ($1, $2, $3)`, [token, uid, expiry]);
    return result;
}

const getToken = async (token) => {
    const result = await pool.query('Select * from tokentable WHERE token = $1', [token]);
    return result;
}

const createSlotInfo = async () => {
    pool.query("CREATE TABLE slotinfo(uidstudent text, uiddean text, time numeric)", 
    (err, res) => {
    console.log('Create SlotInfo');
    console.log(err, res);
    });
}

const insertSlotInfo = async (uidstudent, uiddean, time) => {
    const result = await pool.query(
        `INSERT INTO "slotinfo" ("uidstudent", "uiddean", "time")  
         VALUES ($1, $2, $3)`, [uidstudent, uiddean, time]);
    return result;
}

const getSlotInfoDean = async (uiddean, time) => {
    return pool.query('Select * from slotinfo WHERE uiddean = $1 AND time >= $2', [uiddean, time]);
}

const getSlotInfoStudent = async (uidstudent, time) => {
    return pool.query('Select * from slotinfo WHERE uidstudent = $1 AND time >= $2', [uidstudent, time]);
}

const getFun = async () => {
    return pool.query('Select * from TokenTable1');
}

exports.createUser = createUser;
exports.getUser = getUser;
exports.insertUser = insertUser;
exports.existUser = existUser;

exports.createTokenTable = createTokenTable;
exports.insertTokenTable = insertTokenTable;
exports.getToken = getToken;

exports.createSlotInfo = createSlotInfo ;
exports.insertSlotInfo = insertSlotInfo ;
exports.getSlotInfoDean = getSlotInfoDean ;
exports.getSlotInfoStudent = getSlotInfoStudent ;

exports.getFun = getFun;