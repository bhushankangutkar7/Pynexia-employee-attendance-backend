import mongoose from 'mongoose';
import systemClock from '../utils/SystemClock.js';
import genNextSequence from '../utils/GenNextSequence.js';

const AttendanceSchema = new mongoose.Schema(
  {
    AttendanceId: {
      type: Number,
      required: true,
      unique: true,
      default: 0
    },
    emId: {
      type: Number,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: Date,
      default: () => systemClock.now(),
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'leave'],
      default: 'present',
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

AttendanceSchema.index(
  { emId: 1, date: -1 },
  { unique: true }
);

AttendanceSchema.virtual(
  'employee',
  {
    ref: 'Employee',
    localField: 'emId',
    foreignField: 'emId',
    justOne: true,
  }
);

AttendanceSchema.pre('validate', async function () {
  if (this.isNew && !this.AttendanceId) {
    this.AttendanceId = await genNextSequence('AttendanceId', this.$session());
  };
});

AttendanceSchema.pre(/^find|countDocuments/, async function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  };
});

AttendanceSchema.set('toJSON', { virtuals: true });
AttendanceSchema.set('toObject', { virtuals: true });

const Attendance = mongoose.model('Attendance', AttendanceSchema);

export default Attendance;