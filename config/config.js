import mongoose from "mongoose";

export const connectMongoDB = () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MongoDB URI가 설정되지 않았습니다. .env 파일을 확인하세요."
    );
  }

  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("MongoDB에 성공적으로 연결되었습니다.");
    })
    .catch((err) => {
      console.error("MongoDB 연결 중 오류 발생:", err);
    });
};
