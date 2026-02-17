export const requireAuth = (req, res, next) =>{
    if(!req.session.user){
        return res.status(401).json({msg: "Not logged in"});
    }
    next();
}

export const requireRole = (...roles) =>{
    return (req, res, next) =>{
        if(!req.session.user){
            return res.status(401).json({msg: "Not logged in"});
        }

        if(!roles.includes(req.session.user.role)){
            return res.status(403).json({
                msg: "Access denied - Unauthorised role"
            });
        }

        next();
    };
};