const express =require("express");
const router=express.Router();
const appointementController = require("../controllers/appointmentController");
const userController = require("../controllers/userController")

router.post('/createAppointment', appointementController.createAppointment);
router.get('/appointments/:doctorID',appointementController.getAppointmentByDoctorId);
router.get('/patientAppointments/:patientID' , appointementController.getAppointmentByPatientId);
router.get('/appointments/:doctorID/status', appointementController.getAppointmentsWithStatusDoctorID);
router.get('/appointments/:doctorID/type',appointementController.getAppointmentsWithTypeAndDoctorID);
router.put('/changeAppointmentStatus/:appointmentID', appointementController.updateAppointmentStatus);
router.delete('/deleteAppointment/:appointmentID', appointementController.deleteAppointmentByID);
router.get('/appointmentDetails/:appointmentID', appointementController.getAppointmentDetails);
router.put('/postponeAppoinment/:appointmentID', appointementController.rescheduleAppointmentById);
router.put('/updateAppointment/:appointmentID' , appointementController.updateAppointmentTypeById);
router.get('/getuserDetails/:id',userController.getUserWithAvailabilities);

module.exports = router;