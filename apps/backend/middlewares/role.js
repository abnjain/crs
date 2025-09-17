// role middleware: pass allowed roles array
function role (allowed = []) {
  return function(req, res, next) {
    if (!req.user) return res.status(401).json({ error: "No user", message: "User not authenticated" });
    const userRoles = [...req.user.roles] || [];
    const ok = allowed.some(r => userRoles.includes(r));
    // console.log(userRoles,allowed)
    if (!ok) return res.status(403).json({ error: "Forbidden", message: "User does not have the required role" });
    next();
  };
};

export default role;
