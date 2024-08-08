const mongoose=require("mongoose")
const type= require("./enums/AppointmentType")
const Schema = mongoose.Schema;

const availabilitySchema = mongoose.Schema({
    date: {
         type: Date,
             required: true 
            },
    timeSlots: [{
        startTime: { type: String, 
            required: true 
        },
        endTime: { type: String, 
            required: true
         },
        isAvailable: { type: Boolean,
                    default: true 
                },
        mode: { type: String, 
             enum : Object.values(type),
             default: type.BOTH 
            }
    }]
});

module.exports  = mongoose.model("Availability",availabilitySchema)