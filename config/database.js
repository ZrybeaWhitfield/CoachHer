const mongoose = require("mongoose")

const configDB = async () => {
  try{
    const conn = await mongoose.connect(process.env.DB_STRING, {
      useNewUrlParser: true,
      useInifiedTopology: true,
      useFindAndModify: false,
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

module.exports = configDB
