const transporter = require("../config/nodemailer");

const verifyEmail = async (email,fullname,link)=>{
    return await  transporter.sendMail({
        from: '"Doctor Appoinment Agency 👻" scongresses@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Confirm your account", // Subject line
        text: "Hello world?", // plain text body
        html: `
            <div>
                <p>Dear ${fullname},</p>,
                <p>Thank you for signing up for an account ... </p>

                <p>To complete your registration , please click <a href="${link}"> here</a> </p>
            </div>
        `, // html body
      });
    
}

const restPasswordEmail = async (email,fullname,link)=>{
    return await  transporter.sendMail({
        from: '"Doctor Appoinment 👻" scongresses@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Reset Password", // Subject line
        html: `
            <div>
                <p>Dear ${fullname}</p>,
                <p>to Reset your password, please click <a href="${link}"> here</a> </p>
            </div>
        `, // html body
      });
    
}

async function sendConfirmationEmail(patientEmail, patientName, doctorName, appointmentDate, appointmentTime) {
   
    let info = await transporter.sendMail({
        from: '"Doctor Appointment Agency 👻" <scongresses@gmail.com>', 
        to: patientEmail, 
        subject: "Confirm your Appointment", 
        text: `Dear ${patientName}, This email is to inform you that your appointment with Dr. ${doctorName} has been confirmed on ${appointmentDate} at ${appointmentTime}. Thank you, Doctor Appointment Agency`, // plain text body
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <p style="font-size: 16px;">Dear <strong>${patientName}</strong>,</p>
                <p style="font-size: 14px;">
                    This email is to inform you that your appointment with Dr. <strong>${doctorName}</strong> has been confirmed on:
                </p>
                <p style="font-size: 14px;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #4caf50; margin-right: 5px; vertical-align: middle;">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 1v14M2 8h12"></path>
                    </svg>
                    <strong>Date:</strong> ${appointmentDate}
                </p>
                <p style="font-size: 14px;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #4caf50; margin-right: 5px; vertical-align: middle;">
                      <circle cx="8" cy="8" r="7" stroke="black" stroke-width="2" fill="none" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4v4l3 3"></path>
                    </svg>
                    <strong>Time:</strong> ${appointmentTime}
                </p>
                <p style="font-size: 14px;">Thank you,</p>
                <p style="font-size: 14px;"><strong>Doctor Appointment Agency</strong></p>
            </div>
        ` 
    });

    console.log("Message sent: %s", info.messageId);
}


async function sendCancelMail(patientEmail, patientName, doctorName, appointmentDate, appointmentTime) {
   
    try {
        let info = await transporter.sendMail({
            from: '"Doctor Appointment Agency 👻" <scongresses@gmail.com>', // Sender address
            to: patientEmail, // Receiver address
            subject: "Your Appointment Has Been Canceled", // Subject line
            text: `Dear ${patientName},\n\nThis email is to inform you that your appointment with Dr. ${doctorName} has been canceled on ${appointmentDate} at ${appointmentTime}.\n\nThank you,\nDoctor Appointment Agency`, // Plain text body
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p style="font-size: 16px;">Dear <strong>${patientName}</strong>,</p>
                    <p style="font-size: 14px;">This email is to inform you that your appointment with Dr. <strong>${doctorName}</strong> has been <span style="color: #e74c3c;">canceled</span> on:</p>
                    <p style="font-size: 14px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #e74c3c; margin-right: 5px; vertical-align: middle;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 1v14M2 8h12"></path>
                        </svg>
                        <strong>Date:</strong> ${appointmentDate}
                    </p>
                    <p style="font-size: 14px;">
                        <svg width="16" height="16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: #e74c3c; margin-right: 5px; vertical-align: middle;">
                            <circle cx="8" cy="8" r="7" stroke="black" stroke-width="2" fill="none"></circle>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4v4l3 3"></path>
                        </svg>
                        <strong>Time:</strong> ${appointmentTime}
                    </p>
                    <p style="font-size: 14px;">We apologize for any inconvenience this may cause. If you have any questions or need to reschedule, please contact us.</p>
                    <p style="font-size: 14px;">Thank you,</p>
                    <p style="font-size: 14px;"><strong>Doctor Appointment Agency</strong></p>
                </div>
            ` // HTML body
        });

        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}



module.exports = {verifyEmail,restPasswordEmail,sendConfirmationEmail , sendCancelMail};