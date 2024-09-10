import mongoose from "mongoose";
import dotenv from "dotenv";

// 환경 변수 설정
dotenv.config();

// MongoDB 연결 함수
export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MongoDB URI가 설정되지 않았습니다.");
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB 연결 성공");
  } catch (err) {
    console.error("MongoDB 연결 오류:", err);
    process.exit(1);
  }
};
