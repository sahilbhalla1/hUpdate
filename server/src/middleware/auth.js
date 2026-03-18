const { verifyAccess } = require('../utils/jwt');
// module.exports = function (req, res, next) {
function authMiddleware(req, res, next) {
    let token;

    // ✅ From cookie
    if (req.cookies?.token) {
        token = req.cookies.token;
    }

    // ✅ From Authorization header
    if (!token && req.headers.authorization) {
        const [type, value] = req.headers.authorization.split(' ');
        if (type !== 'Bearer') {
            return res.status(401).json({ message: 'Invalid auth type' });
        }
        token = value;
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const payload = verifyAccess(token);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
