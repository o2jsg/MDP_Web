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
    // TTL 인덱스 제거
  },
});

WeatherCacheSchema.index({ lat: 1, lon: 1, type: 1 }, { unique: true });

export const WeatherCache = mongoose.model("WeatherCache", WeatherCacheSchema);
