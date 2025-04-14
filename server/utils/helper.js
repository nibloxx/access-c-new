export const checkContext = (req, res, next) => {
    const currentHour = new Date().getHours();
    if (currentHour < 9 || currentHour > 17) {
      return res.status(403).json({ error: 'Access outside work hours denied' });
    }
    next();
  };