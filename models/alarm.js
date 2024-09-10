import mongoose from "mongoose";

const alarmSchema = new mongoose.Schema({
  hour: Number,
  minute: Number,
  ampmChecker: String,
  days: [Number],
});

export const Alarm = mongoose.model("Alarm", alarmSchema);
