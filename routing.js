const express = require('express')
const routing = express.Router()
const postgres = require('./postgres');
const controller = require('./controller');

routing.use(async (req, res, next) => {
    const token = req.headers.authorization;
    const path = req.originalUrl;
    const body = req.body
    const noAuthRoutes = ['/createTables', '/registeruser', '/login']
    if (!noAuthRoutes.includes(path)) {
        let tokenExpiry;
        if (token) {
            const tokenValidationResult = await postgres.getToken(token);
            const tokenValidation = tokenValidationResult.rows;
            if (tokenValidation.length > 0) {
                tokenExpiry = tokenValidation[0].expiry;
                const date = new Date().getTime();
                const tokenDate = Number(tokenExpiry);
                if (body.uidstudent !== tokenValidation[0].uid) {
                    res.send('Token Mismatch');
                }
                else if (date > tokenDate) {
                    res.send('Token Expired');
                } else {
                    next();
                }
            } else {
                res.send('Token Error');
            }
        } else {
            res.send('No Token Found');
        }
    } else {
        next();
    }
}); 

routing.get('/createTables', async (req, res, next) => {
    // const resp1 = await postgres.createSlotInfo();
    // const resp2 = await postgres.createTokenTable();
    // const resp3 = await postgres.createUser();
    res.send('Tables Created');
});
  
routing.post('/registeruser', async (req, res, next) => {
    try {
        const body = req.body;
        const result = await controller.registerUser(body);
        res.send(result);
    } catch (err) {
        res.send('Error')
    }
});

routing.post('/login', async (req, res, next) => {
    try {
        const response = await controller.loginUser(req.body);
        res.set("Authorization", response.token);
        res.send(response);
    } catch (err) {
        res.send('Error')
    }
});
 
routing.post('/bookslot', async (req, res, next) => {
    try {
        const response = await controller.insertSlotInfo(req.body);
        res.send(response);
    } catch (err) {
        res.send('Error')
    }
});

routing.post('/checkslot', async (req, res, next) => {
    try {
        const response = await controller.getSlotInfo(req.body);
        res.send(response);
    } catch (err) {
        res.send('Error')
    }
});

module.exports = routing
