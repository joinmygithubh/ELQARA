import mongoose from 'mongoose';

let connectingPromise = null;

const getMongoose = () => {
  if (mongoose?.connect) return mongoose;
  if (mongoose?.default?.connect) return mongoose.default;
  return mongoose?.default || mongoose;
};

const connectDB = async () => {
  const mg = getMongoose();
  mg.set('bufferCommands', false);
  mg.set('autoIndex', false);
  mg.set('autoCreate', false);

  // If already connected, verify socket is alive before returning
  if (mg.connection && mg.connection.readyState === 1) {
    try {
      if (mg.connection.db) {
        await Promise.race([
          mg.connection.db.admin().ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('ping timeout')), 1000))
        ]);
        return mg.connection;
      }
    } catch (e) {
      console.log('[MongoDB Stale Socket Detected, refreshing connection]:', e.message);
      try {
        await mg.connection.close(false);
      } catch (_) {}
    }
  }

  // If connection is in progress, reuse promise
  if (connectingPromise) {
    return connectingPromise;
  }

  const mongoUri =
    process.env.MONGO_URI ||
    (process.env.NODE_ENV !== 'production' ? 'mongodb://127.0.0.1:27017/elqara_db' : null);

  if (!mongoUri) {
    const errMsg = '[MongoDB Error]: MONGO_URI is not defined. Please set the MONGO_URI secret/environment variable.';
    console.error(errMsg);
    throw new Error(errMsg);
  }

  connectingPromise = Promise.race([
    mg.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 8000,
      maxPoolSize: 10,
      minPoolSize: 1,
      waitQueueTimeoutMS: 5000,
      bufferCommands: false
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('MongoDB connection timeout after 6000ms')), 6000)
    )
  ])
    .then((conn) => {
      console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
      connectingPromise = null;
      return conn;
    })
    .catch((error) => {
      connectingPromise = null;
      console.error(`[MongoDB Connection Error]: ${error.message}`);
      throw error;
    });

  return connectingPromise;
};

export default connectDB;
