import mongoose from 'mongoose';
import systemClock from '../utils/SystemClock.js';

const CountSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      enum: ["emId","AttendanceId"],
    },
    seq : {
      type: Number,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      currentTime: () => systemClock.now(),
    }
  }
);

const Count = mongoose.model("Count", CountSchema);

export default Count;