// server/utils/contextDetector.js
const geoip = require('geoip-lite');

// Detect location from IP address
exports.detectLocation = (ipAddress) => {
  // Skip localhost IPs
  if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
    return 'localhost';
  }
  
  // Use geoip-lite to detect location
  const geo = geoip.lookup(ipAddress);
  
  if (geo) {
    return `${geo.city}, ${geo.country}`;
  }
  
  return 'unknown';
};

// Detect device type from user agent
exports.detectDevice = (userAgent) => {
  if (!userAgent) return 'unknown';
  
  if (/mobile|android|iphone/i.test(userAgent)) {
    return 'mobile';
  } else if (/ipad|tablet/i.test(userAgent)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

// Determine if access time is within working hours
exports.isWorkingHours = (timestamp = new Date()) => {
  const hours = timestamp.getHours();
  const day = timestamp.getDay();
  
  // Consider working hours as 9 AM to 6 PM
  const isDuringWorkHours = hours >= 9 && hours < 18;
  
  // Consider working days as Monday through Friday
  const isWorkingDay = day >= 1 && day <= 5;
  
  return isDuringWorkHours && isWorkingDay;
};