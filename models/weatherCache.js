// models/WeatherCache.js
import mongoose from "mongoose";

const WeatherCacheSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true,
  },
  lon: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["current", "air_quality", "weekly_forecast"],
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: { expires: "1h" }, // TTL 인덱스를 사용하여 1시간 후 자동 삭제
  },
});

WeatherCacheSchema.index({ lat: 1, lon: 1, type: 1 }, { unique: true });

export const WeatherCache = mongoose.model("WeatherCache", WeatherCacheSchema);
