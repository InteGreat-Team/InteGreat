/**
 * Auth trigger to only allow the email "integreatapi@gmail.com"
 * Deletes any accounts with different emails after creation
 */
const { admin, functionsV1 } = require('../../config/firebase');

/**
 * On Create Trigger: Delete the user if the email is not "integreatapi@gmail.com"
 * This approach creates and then deletes unauthorized accounts
 */
exports.deleteNonIntegreatUsers = functionsV1.auth.user().onCreate(async (user) => {
    const { uid, email } = user;
    console.log("New user created:", email);
    
    // Allow only approved emails
    const allowedEmails = ["integreatapi@gmail.com", "apdiaz@ust.edu.ph", "jgcatubag@ust.edu.ph"];
    if (allowedEmails.includes(email)) {
        console.log("Approved account creation for:", email);
        return null;
    }
    
    // Delete accounts with non-approved emails
    try {
        console.log("Deleting non-approved user:", email);
        await admin.auth().deleteUser(uid);
        console.log("Successfully deleted non-approved user:", email);
    } catch (error) {
        console.error(`Failed to delete non-approved user (${email}):`, error);
    }
    
    return null;
});