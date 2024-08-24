const Availability = require("../models/availability");
const User = require("../models/userModel");
const mongoose = require('mongoose');

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
const deleteAvailabilityWithId = async (req , res)=>{
    try{

        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid  ID' });
          }
    
          const deletedAvailability = await Availability.findByIdAndDelete(id);
    
          if (!deletedAvailability) {
            return res.status(404).json({ error: 'Availability not found' });
          }
      
          res.status(200).json({ message: 'Availability deleted successfully' });

    }catch (error) {
        console.error('Error deleting availability:', error);
        res.status(400).json({error:error.message});
    }

}


const editAvailability = async (req , res)=>{
    try{

        const { id } = req.params;
        const updatedData = req.body;
    
        // Rechercher la disponibilité par ID
        const availability = await Availability.findById(id);
        
        if (!availability) {
          return res.status(404).json({ message: 'Availability not found' });
        }
         // Mettre à jour les champs
        availability.date = updatedData.date || availability.date;
        availability.timeSlots = updatedData.timeSlots || availability.timeSlots;

        // Sauvegarder les modifications
        await availability.save();

    res.status(200).json({ message: 'Availability updated successfully', availability });
    }catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ message: 'Error updating availability' });
      }
    
}

const deleteOldAvailabilityForAllDoctors = async () => {
    try {
        const doctors = await User.find({ role: 'DOCTOR' }).populate('availabilities');

        if (!doctors || doctors.length === 0) {
            console.log('No doctors found.');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Mettre les heures à 00:00 pour comparer uniquement les dates

        for (const doctor of doctors) {
            // Filtrer les disponibilités qui sont avant aujourd'hui
            const availabilitiesToRemove = doctor.availabilities.filter(availability => {
                const availabilityDate = new Date(availability.date);
                return availabilityDate < today;
            });

            // Supprimer les disponibilités anciennes
            const availabilityIdsToRemove = availabilitiesToRemove.map(av => av._id);
            if (availabilityIdsToRemove.length > 0) {
                await Availability.deleteMany({ _id: { $in: availabilityIdsToRemove } });

                // Mettre à jour le docteur en supprimant les anciennes disponibilités de sa liste
                doctor.availabilities = doctor.availabilities.filter(av => !availabilityIdsToRemove.includes(av._id));
                await doctor.save();
                
                console.log(`Deleted old availabilities for doctor: ${doctor._id}`);
            }
        }

        console.log('Old availabilities deleted successfully for all doctors.');
    } catch (error) {
        console.error('Error deleting old availabilities:', error);
    }
};
 

module.exports ={
    createAvailibityForDoctorID,
    deleteAvailabilityWithId,
    editAvailability,
    deleteOldAvailabilityForAllDoctors
}