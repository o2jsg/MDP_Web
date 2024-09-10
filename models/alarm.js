import mongoose from "mongoose";

// 알람 스키마 정의
const alarmSchema = new mongoose.Schema({
  hour: {
    type: Number,
    required: true, // 필수 항목
    min: 1,
    max: 12, // 12시간제로 시간 설정 (1~12)
  },
  minute: {
    type: Number,
    required: true, // 필수 항목
    min: 0,
    max: 59, // 분 설정 (0~59)
  },
  ampmChecker: {
    type: String,
    enum: ["AM", "PM"], // 오전/오후 구분 (AM/PM)
    required: true, // 필수 항목
  },
  days: {
    type: [Number], // 요일 선택 (0: 일요일 ~ 6: 토요일)
    validate: {
      validator: function (v) {
        return v.every((day) => day >= 0 && day <= 6);
      },
      message: "days 필드는 0에서 6 사이의 값이어야 합니다.",
    },
    required: true, // 필수 항목
  },
  createdAt: {
    type: Date,
    default: Date.now, // 알람 생성 시 시간 기록
  },
});

// 알람 모델 생성 및 내보내기
const Alarm = mongoose.model("Alarm", alarmSchema);

export default Alarm;
