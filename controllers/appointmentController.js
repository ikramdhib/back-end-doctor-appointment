const Appointment = require("../models/Appointment");
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const sendEmail = require("../utils/sendEmail")


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
        return res.status(404).json({ message: 'No appointments found with this status' });
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

        sendEmail.sendConfirmationEmail(updatedAppointment.patient.email, updatedAppointment.patient.firstname+' '
          +updatedAppointment.patient.lastname,updatedAppointment.doctor.firstname+' '+updatedAppointment.doctor.lastname ,
           date, time)
      }else if (updatedAppointment.status=="CANCLED"){

        sendEmail.sendCancelMail(updatedAppointment.patient.email, updatedAppointment.patient.firstname+' '
          +updatedAppointment.patient.lastname,updatedAppointment.doctor.firstname+' '+updatedAppointment.doctor.lastname ,
           date, time)

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

      const appointment = await Appointment.findById(appointmentID);

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

  const getTodayAppointment = async(req , res) =>{
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
      }
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
    getTodayAppointment,
    getAppointmentWithDoctorIDAndDate
}