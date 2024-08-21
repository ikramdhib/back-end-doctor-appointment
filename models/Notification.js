const mongoose = require('mongoose');
const type= require("./enums/NotificationType")

const notificationSchema = new mongoose.Schema({
  recipientId: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User',
      required: true
     }, // L'utilisateur qui reçoit la notification
  senderId: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User',
      required: true 
    }, // L'utilisateur qui déclenche la notification
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    required: true
 }, // Le rendez-vous concerné
  type: { 
    type: String,
    enum : Object.values(type),
      required: true }, // Type de notification
  message: {
     type: String, 
     required: true 
    }, // Message de notification
  seen: { 
    type: Boolean,
     default: false }, // Si la notification a été vue
  timestamp: {
    type: Date, 
    default: Date.now }, // Date et heure de la notification
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
