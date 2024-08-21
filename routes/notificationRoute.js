const express =require("express");
const router=express.Router();
const notificationController = require("../controllers/notificationController");

router.post('/newNotification' , notificationController.addNewNotification);
router.put('/seenNotification/:id' , notificationController.markNotificationAsSeen);
router.get('/allNotifications/:userId' , notificationController.getNotificationsForUserNotSeen);
router.get('/notifications/:userId' , notificationController.getAllNotificationUserID);
router.delete('/deleteAllNotification/:userId' , notificationController.deleteAllNotifications);

module.exports = router;