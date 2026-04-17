const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED EXCEPTION! 💥 Shutting Down....');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

//Connecting to Database
const Db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(Db).then(() => {
  console.log('Database Connected Successfully');
});

const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting Down....');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('Server Closing');
  server.close(() => {
    console.log('Server is Closed 🫡');
    process.exit(0);
  });
});
process.on('SIGINT', () => {
  console.log('Interrupted');

  server.close(() => {
    console.log('Server is Closed 🫡');
    process.exit(0);
  });
});
