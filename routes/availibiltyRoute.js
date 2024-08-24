
const express =require("express");
const router=express.Router();
const availabilityController = require("../controllers/availibiltyController");

router.post('/createAvailibility/:doctorId', availabilityController.createAvailibityForDoctorID);
router.delete('/deleteAvailability/:id' , availabilityController.deleteAvailabilityWithId);
router.put('/editAvailability/:id' , availabilityController.editAvailability);

module.exports = router;