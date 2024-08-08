const User = require ('../models/userModel')
const bcrypt = require("bcrypt");
const { randomString } = require("../utils/random");
const { verifyEmail } = require("../utils/sendEmail");
const Availability = require('../models/availability');

const getAllUsers = async (req,res)=>{
    //select users without password
    const users = await User.find().select("-password").lean()
    if(!users.length){
        res.status(400).json({message : "No Users Found"});
    }
    res.json(users)
}

const getUser = async (req, res) => {
 
  try {
  
    const user = await User.findById(req.user);
    //console.log("user fron get user", req.user)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const updateProfile = async (req, res) => {
  try {
      const { firstname,lastname,email } = req.body;
//      console.log("req.body from update user", req.body)

      const userId = req.user;
    //  console.log("user from update user", userId)
  
      const updatedUser = await User.findByIdAndUpdate(userId, { firstname,lastname,email }, { new: true });
      if (!updatedUser) {
          console.log("user update ",updatedUser)
          return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      res.status(200).json(updatedUser);
  } catch (error) {
      console.error(error);

      res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};

const createUser = async (req, res) => {

  const { firstname, lastname, email, password,role } = req.body;
  // Check if all required fields are provided
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {

    const foundUser = await User.findOne({ email: email }).exec();
    if (foundUser) {
      return res.status(401).json({ message: "User email already exists" });
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 10);
    const codeVerification = randomString(20);

    // Create a new user in the database
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
       role: role ,
      verificationCode: codeVerification,
    });
    const link = `http://localhost:5000/auth/verify?code=${codeVerification}`;
    verifyEmail(email, firstname, link);
    


    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({message : err.message || "Some error occurred while creating a create operation"
  });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.firstname) user.firstname = req.body.firstname;
    if (req.body.lastname) user.lastname = req.body.lastname;

    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    if (req.body.role) user.role = req.body.role;

    const updatedUser = await user.save();
   
    res.json(updatedUser);
  } catch (err) {
    res.status(404).json({ message : `Cannot Update user with ${id}.`})
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: "Could not delete User with id=" + id });
  }
};



//get doctor details with availibity 

const getUserWithAvailabilities = async (req, res) => {
  try {
    const {id} = req.params
      // Récupérer l'utilisateur par ID
      const user = await User.findById(id);
      if (!user) {
        return res.status(400).json({ error: 'user not found' });
      }

      // Récupérer les détails de chaque disponibilité
      const availabilities = await Availability.find({
          _id: { $in: user.availabilities }
      });

      // Retourner l'utilisateur avec les détails des disponibilités
      res.status(200).json({user , availabilities});
  } catch (error) {
      console.error('Error retrieving user with availabilities:', error);
      res.status(400).json({error:error.message});
  }
};


module.exports ={
    getAllUsers,
    getUser,
    updateProfile,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    getUserWithAvailabilities
}