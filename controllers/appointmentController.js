const Appointment = require("../models/Appointment");
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const sendEmail = require("../utils/sendEmail");
const appointmentStatus = require("../models/enums/AppointmentStatus");
const User = require("../models/userModel");
const ObjectId = mongoose.Types.ObjectId;


// CreatAppointment API
const createAppointment = async (req , res) =>{
    try{
        const { dateTime, hourAppointment , type, doctor, patient } = req.body;

     // Combinez la date et l'heure en un seul objet Date
     const dateAppointment = moment.tz(`${dateTime} ${hourAppointment}`, 'YYYY-MM-DD HH:mm').toDate(); 

     const existingAppointment = await findAppointmentByDateTime(doctor,dateAppointment);

     if (existingAppointment) {
        return res.status(400).json({ error: 'Appointment already exists at this date and time' });
      }

        const newAppointment = new Appointment ({
            dateAppointment,
            type,
            doctor,
            patient,
        })

        const savedAppointment = await newAppointment.save();

       
        res.status(200).json(savedAppointment);
    }catch (error){
        res.status(400).json({error:error.message});
    }
}

// Fonction pour trouver un rendez-vous à une date et une heure spécifiques
const findAppointmentByDateTime = async (doctorId,dateAppointment) => {
    try {
      const appointment = await Appointment.findOne({ 
        doctor: doctorId,
        dateAppointment });
      return appointment;
    } catch (error) {
      console.error("there is an error while getting data", error);
      throw new Error('Error finding appointment');
    }
  };


  //get all apointment with doctorID 
  const getAppointmentByDoctorId = async (req , res) =>{

    try {
    const {doctorID} = req.params ;

    const appointments = await Appointment.find({
      doctor : doctorID
    })
    .populate('patient')
    .exec();

    if(!appointments.length){
      return res.status(400).json({ error: 'there is no appointments for you' });
    }

    res.status(200).json(appointments);

  } catch (error){
    console.error("there is an error while getting data", error);
    res.status(400).json({ error: error.message });
  }

  }

  //get all apontment with patientID

const getAppointmentByPatientId= async (req , res) =>{

    try {
    const {patientID} = req.params ;

    const appointments = await Appointment.find({
      patient : patientID
    }).populate('doctor').exec();

    if(!appointments.length){
      return res.status(400).json({ error: 'there is no appointments for you' });
    }

    res.status(200).json(appointments);

  } catch (error){
    console.error("there is an error while getting data", error);
    res.status(400).json({ error: error.message });
  }
  };

  //get appointments with status & doctorID

  const getAppointmentsWithStatusDoctorID = async (req , res)=>{

    try {
      const { status } = req.query;
      const {doctorID} = req.params;
  
      if (!status & !doctorID) {
        return res.status(400).json({ error: 'Status & doctor ID are required' });
      }
  
      const appointments = await Appointment.find({ 
        doctor : doctorID,
        status : status 
       })
       .populate('patient')
       .exec();
  
      if (!appointments.length) {
        return res.json({ message: 'No appointments found with this status' });
      }
  
      res.status(200).json(appointments);
    } catch (error) {
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      res.status(500).json({ error: 'An error occurred while retrieving appointments' });
    }
  }

  //get appointments with type & docotorID

  const getAppointmentsWithTypeAndDoctorID = async (req , res) =>{

    try{

      const {doctorID}=req.params;
      const {type}=req.query;

      if (!type || !doctorID) {
        return res.status(400).json({ error: 'type & doctor ID are required' });
      }

      const appointments = await Appointment.find({
        doctor : doctorID,
        type : type
      });

      if (!appointments.length) {
        return res.status(404).json({ message: 'No appointments found with this status' });
      }
  
      res.status(200).json(appointments);

    }catch (error){
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      res.status(500).json({ error: 'An error occurred while retrieving appointments' });
    }

  }

  //update appointment status
  const updateAppointmentStatus = async (req , res )=>{

    try{

      const {appointmentID} = req.params;
      const {appointmentStatus} = req.body;

      if(!appointmentID || !appointmentStatus){

        return res.status(400).json({ error: 'Appointment ID and status are required' });

      }

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentID,
        { status : appointmentStatus },
        { new: true, runValidators: true }
      ).populate('doctor')
      .populate('patient').exec();

      if (!updatedAppointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
  
      res.status(200).json(updatedAppointment);

      
      const date = updatedAppointment.dateAppointment.toISOString().split('T')[0];
      const time = updatedAppointment.dateAppointment.toISOString().split('T')[1].split('.')[0];

      if(updatedAppointment.status=="PLANIFIED"){
       const email = updatedAppointment.patient.email;
       const subject = "Confirm your Appointment";
        const html =`
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <p style="font-size: 16px;">Dear <strong>${updatedAppointment.patient.firstname} ${updatedAppointment.patient.lastname}strong>,</p>
                <p style="font-size: 14px;">
                    This email is to inform you that your appointment with Dr. <strong>${updatedAppointment.doctor.firstname} ${updatedAppointment.doctor.lastname}</strong> has been confirmed on:
                </p>
                <p style="font-size: 14px;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #4caf50; margin-right: 5px; vertical-align: middle;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 1v14M2 8h12"></path>
                    </svg>
                    <strong>Date:</strong> ${date}
                </p>
                <p style="font-size: 14px;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #4caf50; margin-right: 5px; vertical-align: middle;">
                      <circle cx="8" cy="8" r="7" stroke="black" stroke-width="2" fill="none" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4v4l3 3"></path>
                    </svg>
                    <strong>Time:</strong> ${time}
                </p>
                <p style="font-size: 14px;">Thank you,</p>
                <p style="font-size: 14px;"><strong>Doctor Appointment Agency</strong></p>
            </div>
        `  
        sendEmail.sendMails(email,subject,html);

      }else if (updatedAppointment.status=="CANCLED"){

       const email = updatedAppointment.patient.email;
       const subject = "Your Appointment Has Been Canceled";
        const html =`
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p style="font-size: 16px;">Dear <strong>${updatedAppointment.patient.firstname} ${updatedAppointment.patient.lastname}</strong>,</p>
                    <p style="font-size: 14px;">This email is to inform you that your appointment with Dr. <strong>${updatedAppointment.doctor.firstname} ${updatedAppointment.doctor.lastname}</strong> has been <span style="color: #e74c3c;">canceled</span> on:</p>
                    <p style="font-size: 14px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #e74c3c; margin-right: 5px; vertical-align: middle;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 1v14M2 8h12"></path>
                        </svg>
                        <strong>Date:</strong> ${date}
                    </p>
                    <p style="font-size: 14px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #e74c3c; margin-right: 5px; vertical-align: middle;">
                            <circle cx="8" cy="8" r="7" stroke="black" stroke-width="2" fill="none"></circle>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4v4l3 3"></path>
                        </svg>
                        <strong>Time:</strong> ${time}
                    </p>
                    <p style="font-size: 14px;">We apologize for any inconvenience this may cause. If you have any questions or need to reschedule, please contact us.</p>
                    <p style="font-size: 14px;">Thank you,</p>
                    <p style="font-size: 14px;"><strong>Doctor Appointment Agency</strong></p>
                </div>
        `  

        sendEmail.sendMails(email,subject,html);

      }

    }catch (error){
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      res.status(500).json({ error: 'An error occurred while retrieving appointments' });
    }

  }

  //Delete Appointment
  const deleteAppointmentByID = async (req , res)=>{


    try{

      const { appointmentID}= req.params;

      if (!mongoose.Types.ObjectId.isValid(appointmentID)) {
        return res.status(400).json({ error: 'Invalid appointment ID' });
      }

      const deletedAppointment = await Appointment.findByIdAndDelete(appointmentID);

      if (!deletedAppointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
  
      res.status(200).json({ message: 'Appointment deleted successfully' });

    }catch (error){
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      res.status(500).json({ error: 'An error occurred while retrieving appointments' });
    }

  }

  //get appointment details  
  const getAppointmentDetails = async (req , res)=>{

    try{

      const {appointmentID} = req.params;

      if (!mongoose.Types.ObjectId.isValid(appointmentID)) {
        return res.status(400).json({ error: 'Invalid appointment ID' });
      }

      const appointment = await Appointment.findById(appointmentID).populate('doctor').populate('patient');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json(appointment);


    }catch (error){
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      res.status(500).json({ error: 'An error occurred while retrieving appointments' });
    }

  }

  //postpone appointment 
  const rescheduleAppointmentById = async (req, res) =>{

    try{

      const {appointmentID} = req.params;
      const { date , time , type }= req.body ;

      if (!appointmentID || !date || !time || !type) {
        return res.status(400).json({ error: 'Appointment ID, date, time or type are required' });
      }

      if (!mongoose.Types.ObjectId.isValid(appointmentID)) {
        return res.status(400).json({ error: 'Invalid appointment ID' });
      }

      const dateTime = moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm').toDate(); 

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentID,
        { dateAppointment: dateTime , type : type},
        { new: true, runValidators: true }
      );

      if (!updatedAppointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
  
      res.status(200).json(updatedAppointment);

    }catch (error){
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      res.status(500).json({ error: 'An error occurred while retrieving appointments' });
    }

  }

  //update appointment type by id 
  const updateAppointmentTypeById = async (req , res)=>{

    try{

      const {appointmentID} = req.params;
      const {appointmentType} = req.body;

      if(!appointmentID || !appointmentType){

        return res.status(400).json({ error: 'Appointment ID and type are required' });

      }

      if (!mongoose.Types.ObjectId.isValid(appointmentID)) {
        return res.status(400).json({ error: 'Invalid appointment ID' });
      }

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentID,
        { type: appointmentType },
        { new: true, runValidators: true }
      );

      
      if (!updatedAppointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
  
      res.status(200).json(updatedAppointment);

    }catch (error){
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      res.status(500).json({ error: 'An error occurred while retrieving appointments' });
    }

  }

  const getTodayAppointmentForPatient = async(req , res) =>{
    try{

      const {patientID} = req.params;

      if (!mongoose.Types.ObjectId.isValid(patientID)) {
        return res.status(400).json({ error: 'Invalid patient ID' });
      }

      // Obtenir la date d'aujourd'hui sans l'heure
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Définir la fin de la journée
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      dateAppointment: {
        $gte: todayStart,
        $lte: todayEnd
      },
      status:'PLANIFIED',
      patient:patientID
    }).populate('doctor').exec();

    if (!appointments) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json(appointments);

    }catch(error){
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      res.status(500).json({ error: 'An error occurred while retrieving appointments' });
    }
  }

  const getTodayAppointmentForDoctor = async(req , res) =>{
    try{

      const {doctorID} = req.params;

      if (!mongoose.Types.ObjectId.isValid(doctorID)) {
        return res.status(400).json({ error: 'Invalid patient ID' });
      }

      // Obtenir la date d'aujourd'hui sans l'heure
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Définir la fin de la journée
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      dateAppointment: {
        $gte: todayStart,
        $lte: todayEnd
      },
      status:'PLANIFIED',
      doctor:doctorID
    }).populate('patient').exec();

    if (!appointments) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json(appointments);

    }catch(error){
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      res.status(500).json({ error: 'An error occurred while retrieving appointments' });
    }
  }

  const getAppointmentWithDoctorIDAndDate = async(req , res)=>{
    try{
      const {doctorID} = req.params;
      const {date} = req.query;
      console.log(doctorID)
      console.log(date)

      if (!doctorID || !date) {
        return res.status(400).json({ error: 'doctorId and date are required' });
      }
  
      // Convertir la date en début et fin de journée
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
  
      // Trouver les rendez-vous pour le médecin à cette date
      const appointments = await Appointment.find({
        doctor: doctorID,
        dateAppointment: { $gte: startOfDay, $lte: endOfDay }
      }).exec();

      res.json(appointments);

    }catch(error){
      console.error("Erreur lors de la récupération des rendez-vous :", error);
      res.status(500).json({ error: 'An error occurred while retrieving appointments' });
    }
  }

  const cancelAppointmentPatient = async(req, res)=>{

    try{
    const {appointmentID} = req.params;

      if(!appointmentID || !appointmentStatus){

        return res.status(400).json({ error: 'Appointment ID and status are required' });

      }

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentID,
        { status : appointmentStatus.CANCLED },
        { new: true, runValidators: true }
      ).populate('doctor')
      .populate('patient').exec();

      if (!updatedAppointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
  
      res.status(200).json(updatedAppointment);

      
      const date = updatedAppointment.dateAppointment.toISOString().split('T')[0];
      const time = updatedAppointment.dateAppointment.toISOString().split('T')[1].split('.')[0];

      const email = updatedAppointment.doctor.email;
      const subject = "Your Appointment Has Been Canceled";
       const html =`
           <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                   <p style="font-size: 16px;">Dear Dr. <strong>${updatedAppointment.doctor.firstname} ${updatedAppointment.doctor.lastname}</strong>,</p>
                   <p style="font-size: 14px;">This email is to inform you that your appointment with Ms. <strong>${updatedAppointment.patient.firstname} ${updatedAppointment.patient.lastname}</strong> has been <span style="color: #e74c3c;">canceled</span> on:</p>
                   <p style="font-size: 14px;">
                       <svg width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #e74c3c; margin-right: 5px; vertical-align: middle;">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 1v14M2 8h12"></path>
                       </svg>
                       <strong>Date:</strong> ${date}
                   </p>
                   <p style="font-size: 14px;">
                       <svg width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #e74c3c; margin-right: 5px; vertical-align: middle;">
                           <circle cx="8" cy="8" r="7" stroke="black" stroke-width="2" fill="none"></circle>
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4v4l3 3"></path>
                       </svg>
                       <strong>Time:</strong> ${time}
                   </p>
                   <p style="font-size: 14px;">We apologize for any inconvenience this may cause. If you have any questions or need to reschedule, please contact us.</p>
                   <p style="font-size: 14px;">Thank you,</p>
                   <p style="font-size: 14px;"><strong>Doctor Appointment Agency</strong></p>
               </div>
       ` ;
     sendEmail.sendMails(email,subject,html);

   }catch (error){
     console.error("Erreur lors de la récupération des rendez-vous :", error);
     res.status(500).json({ error: 'An error occurred while retrieving appointments' });
   }
  }


  const creationAppointmentWithDoctorIDandPatinetEamil = async(req , res)=>{
    try{
      const {doctor} = req.params;
      const{date , time , type , patientEmail} = req.body;

      console.log(date , "8888");

      console.log(typeof(date),"++++++++++++++++++++++++++++++");
      
      

      if(!date || !time || !type || !patientEmail){
        return res.status(404).json({ error: 'date , time , type and email patient are requested ' });
      }

      const dateAppointment = moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm').toDate(); 

      const patientObject = await User.findOne({ email: patientEmail }).exec();
      const doctorObject = await User.findById(doctor);
      const patient = patientObject._id;
      const status = appointmentStatus.PLANIFIED;


      const newAppointment = new Appointment ({
        dateAppointment,
        status,
        type,
        doctor,
        patient
    })

    const savedAppointment = await newAppointment.save();

      const subject = 'Appointment Scheduled';
      const html =`
      <p>Dear Patient,</p>
      <p>We would like to inform you that Dr. ${doctorObject.lastname}  ${doctorObject.firstname}
      has scheduled an appointment for you.</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p>If you have any questions, please feel free to contact us.</p>
      <p>Best regards,</p>
      <p>Your Medical Team</p>
    `;

      sendEmail.sendMails(patientEmail , subject  , html);
   
    res.status(200).json(savedAppointment);


    }catch (error){
     console.error("Erreur lors de la récupération des rendez-vous :", error);
     res.status(500).json({ error: 'An error occurred while retrieving appointments' });
   }
  }


  const updateDateAppointment = async (req , res)=>{
    try{

      const {appointmentID} = req.params ; 
      const {appointmentDate} = req.body;

      if(!appointmentDate || ! appointmentID){
        return res.status(400).json({ error: 'appointment ID and appointment date are required' });
      }

      const appointment = await Appointment.findById(appointmentID);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Conserver l'heure de l'ancien rendez-vous
    const oldDate = new Date(appointment.dateAppointment);
    const newDate = new Date(appointmentDate);

    const hours = oldDate.getUTCHours();
    const minutes = oldDate.getUTCMinutes();
    const seconds = oldDate.getUTCSeconds();

    // Appliquer l'heure de l'ancien rendez-vous à la nouvelle date
    newDate.setUTCHours(hours, minutes, seconds);

    // Mettre à jour la date du rendez-vous
    appointment.dateAppointment = newDate.toISOString();

    // Sauvegarder le rendez-vous mis à jour dans la base de données
    await appointment.save();

    res.status(200).json(appointment);

    }catch (error){
     console.error("Erreur lors de la récupération des rendez-vous :", error);
     res.status(500).json({ error: 'An error occurred while retrieving appointments' });
   }
  }


  const sendReminders = async () => {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
  
      // Obtenez le début et la fin de la journée de demain pour inclure tous les rendez-vous
      const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
      const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));
      
      const appointments = await Appointment.find({
        dateAppointment: {
          $gte: startOfTomorrow,
          $lte: endOfTomorrow,
        }
      }).populate('patient').exec();
  
      console.log(appointments,"***************");

      if (appointments.length === 0) {
        console.log('No appointments found for tomorrow.');
      } else {
      
      appointments.forEach((appointment) => {
         const time = appointment.dateAppointment.toISOString().split('T')[1].split('.')[0];

         const to = appointment.patient.email;
         const subject= 'Reminder of your medical appointment';
         const html = `Dear ${appointment.patient.firstname} ${appointment.patient.lastname}
         ,\n\nThis is a reminder that you have a medical appointment scheduled for tomorrow at ${time}.\n\nThank you!`
       
          sendEmail.sendMails(to , subject  , html);
  
          console.log("executeeeeee")
      });
    }
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
    }
  };


  const updateAppointmentsStatus = async () => {
    try {
        const now = new Date();

        const appointmentsToUpdate = await Appointment.updateMany(
            { 
                dateAppointment: { $lt: now }, 
                status: "PLANIFIED" 
            },
            { 
                $set: { status: "FINISHED" } 
            }
        );

        console.log(`${appointmentsToUpdate.modifiedCount} appointments updated to FINISHED`);
    } catch (error) {
        console.error('Error updating appointment statuses:', error);
    }
};

const topTenPatient=async(req,res)=>{
  try {
    const doctorId = req.params.doctorId;

    const topPatients = await Appointment.aggregate([
        { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },  // Filtrer par docteur
        {
            $group: {
                _id: "$patient",  // Grouper par patient
                visitCount: { $sum: 1 }  // Compter le nombre de visites
            }
        },
        { $sort: { visitCount: -1 } },  // Trier par nombre de visites (du plus au moins)
        { $limit: 10 }  // Limiter aux 10 patients les plus visités
    ]);

    const patientIds = topPatients.map(p => p._id);

    // Récupérer les informations des utilisateurs associés à ces IDs
    const patients = await User.find({ _id: { $in: patientIds } }, 'firstname lastname email');

    // Fusionner les données
    const result = topPatients.map(tp => {
        const patient = patients.find(p => p._id.equals(tp._id));
        return {
            patient: patient,
            visitCount: tp.visitCount
        };
    });

    res.status(200).json(result);
} catch (error) {
    console.error("Error in topTenPatients:", error);
    res.status(500).json({ message: 'Internal server error' });
}
}

module.exports ={
    createAppointment ,
    getAppointmentByDoctorId,
    getAppointmentByPatientId,
    getAppointmentsWithStatusDoctorID,
    getAppointmentsWithTypeAndDoctorID,
    updateAppointmentStatus,
    deleteAppointmentByID,
    getAppointmentDetails,
    rescheduleAppointmentById,
    updateAppointmentTypeById,
    getTodayAppointmentForPatient,
    getAppointmentWithDoctorIDAndDate,
    cancelAppointmentPatient,
    creationAppointmentWithDoctorIDandPatinetEamil,
    updateDateAppointment,
    sendReminders,
    updateAppointmentsStatus,
    getTodayAppointmentForDoctor,
    topTenPatient
}