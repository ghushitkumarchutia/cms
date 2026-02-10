const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpschema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    expiresAt: Date,
  },
  { timestamps: true },
);

otpschema.pre("save", async function () {
  if (!this.isModified("otp")) return;
  this.otp = await bcrypt.hash(this.otp, 10);
});

module.exports = mongoose.model("OTP", otpschema);

// explain line by line in detailed and simple way , not in brief:

// This line imports the mongoose library, which is an Object Data Modeling (ODM) tool for MongoDB and Node.js. It allows us to define schemas and interact with the MongoDB database in a more structured way.

// This line imports the bcryptjs library, which is used for hashing passwords (or in this case, OTPs) securely. It provides functions to hash and compare hashed values.

// This line defines a new Mongoose schema called 'otpschema'. A schema is a blueprint for the structure of documents in a MongoDB collection. It specifies the fields and their types that each document will have.

// The 'email' field is defined as a String. This will store the email address associated with the OTP.

// The 'otp' field is also defined as a String. This will store the one-time password (OTP) that is generated for the user.

// The 'expiresAt' field is defined as a Date. This will store the expiration time for the OTP, indicating when it will no longer be valid.

// The second argument to the schema definition is an options object. Here, we set 'timestamps: true', which tells Mongoose to automatically add 'createdAt' and 'updatedAt' fields to the schema. These fields will store the timestamps of when each document was created and last updated, respectively.

// This line defines a pre-save middleware function for the 'otpschema'. The 'pre' method allows us to execute a function before a document is saved to the database. In this case, we want to hash the OTP before saving it.

// Inside the pre-save function, we first check if the 'otp' field has been modified. If it hasn't been modified, we return early and do not hash it again. This is important to avoid re-hashing an already hashed OTP when the document is updated without changing the OTP.

// If the 'otp' field has been modified, we use bcrypt's 'hash' function to hash the OTP with a salt factor of 10. This means that the hashing algorithm will be applied 10 times, making it more secure against brute-force attacks.

// Finally, we export the Mongoose model for the OTP schema. The model is created using 'mongoose.model', which takes two arguments: the name of the model ('OTP') and the schema ('otpschema'). This model will allow us to interact with the 'OTP' collection in the MongoDB database, enabling us to create, read, update, and delete OTP documents.
