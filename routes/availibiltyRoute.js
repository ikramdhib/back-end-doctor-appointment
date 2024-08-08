const express =require("express");
const router=express.Router();
const availabilityController = require("../controllers/availibiltyController");

router.post('/createAvailibility/:doctorId', availabilityController.createAvailibityForDoctorID);

module.exports = router;