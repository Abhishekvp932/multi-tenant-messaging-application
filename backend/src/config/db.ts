import mongoose from 'mongoose';

const connectDB = async():Promise<void>=>{
    try {
        const mongoURL = process.env.MONGO_URL;

        if(!mongoURL){
            throw new Error('mongo url is not in env file');
        }
        const conn = await mongoose.connect(mongoURL);
    } catch (error) {
    }
}


export default connectDB;