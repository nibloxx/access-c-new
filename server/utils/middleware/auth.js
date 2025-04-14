// import User from "../../model/userModel";

// export const checkTeamAccess = (requiredRole) => {
//     return async (req, res, next) => {
//       const user = await User.findById(req.user.id);
//       if (user.role === requiredRole || user.team.includes(req.params.teamId)) {
//         next();
//       } else {
//         res.status(403).json({ error: 'Access denied' });
//       }
//     };
//   };