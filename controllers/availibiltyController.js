const Availability = require("../models/availability");
const User = require("../models/userModel");

const createAvailibityForDoctorID = async (req , res)=>{
    
    try {

        const {doctorId}  = req.params;
        const { date, timeSlots } = req.body;

        if(!doctorId){

            return res.status(400).json({ error: 'Doctor ID is required' });
    
          }
          const newAvailiblity = new Availability ({
            date, 
            timeSlots
        })
        
          const savedAvailibilty = await newAvailiblity.save();

        // Assigner l'ID de la nouvelle disponibilité au docteur
        const doctor = await User.findById(doctorId);
        if (!doctor) {
            return res.status(400).json({ error: 'Doctor not found' });
        }

        doctor.availabilities.push(savedAvailibilty._id);
        await doctor.save();

        res.status(200).json(savedAvailibilty);
    } catch (error) {
        console.error('Error creating and assigning availability:', error);
        res.status(400).json({error:error.message});
    }
}

module.exports ={
    createAvailibityForDoctorID,
}