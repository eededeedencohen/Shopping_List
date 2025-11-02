import { useCallback } from 'react';

/**
 * Hook מותאם אישית לשימוש ב-Web Vibration API.
 * הערה: עובד רק בדפדפנים תומכים (בעיקר אנדרואיד).
 *
 * @returns {function(number | number[]): void} פונקציה להפעלת רטט.
 */
const useVibrate = () => {
  // useCallback מבטיח שהפונקציה לא נוצרת מחדש בכל רינדור
  const vibrate = useCallback((ms = 50) => {
    // 1. בדיקת תמיכה ב-Vibration API
    if ('vibrate' in navigator) {
      navigator.vibrate(ms);
    } else {
      // (אופציונלי) להצגה ב-console כשאין תמיכה
      // console.log("Vibration API not supported."); 
    }
  }, []); // התלות הריקה מבטיחה שהפונקציה נוצרת רק פעם אחת

  return vibrate;
};

export default useVibrate;