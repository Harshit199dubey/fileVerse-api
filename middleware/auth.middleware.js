const Token = require('../models/token.model');
const cacheUtil = require('../utils/cache.util');
const jwtUtil = require('../utils/jwt.util');

module.exports = async (req, res, next) => {
    
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (token) {
        try {
            token = token.trim();
            /* ---------------------- Check For Blacklisted Tokens ---------------------- */
            const isBlackListed = await cacheUtil.get(token);
            if (isBlackListed) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            
            const decoded = await jwtUtil.verifyToken(token);
            const data = await Token.findOne({
                where:{
                    token:token
                }
            });
            if(!data){
                return res.status(401).json({ message: 'Unauthorized' });
            }
            req.user = decoded;
            console.log();
            if(decoded.isRefresh && !req.url.includes('refreshToken')){
                return res.status(404).json({ message: 'Invalid Token Provided' });
            }
            req.token = token;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } else {
        return res.status(400).json({ message: 'Authorization header is missing.' })
    }
}