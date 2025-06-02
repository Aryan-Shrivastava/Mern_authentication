// This middleware checks if the user is authenticated by verifying a JWT token stored in cookies.


import JWT from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const {token} = req.cookies;

    if (!token) {
        return res.json({ success: false, message: "Unauthorized access" });
    }

    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        if(decoded.id){
            req.body.userId = decoded.id;
        }
        else{
            return res.json({ success: false, message: "Not authorized, login again" });
        }
        next();
    } 
    catch (error) {
        return res.json({ success: false, message: "Invalid token" });
    }
}

export default userAuth;