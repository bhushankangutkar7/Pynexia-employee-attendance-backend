import mongoose from 'mongoose';
import systemClock from '../utils/SystemClock.js';
import genNextSequence from '../utils/GenNextSequence.js';

const EmployeeSchema = new mongoose.Schema(
  {
    emId :{
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,  
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,  
      trim: true,    
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["admin", "emp"],
      default: "emp",
    },
    password: {
      type: String,
      default: null,
      select: false,
      required: [
        function () {
          return this.role === 'admin';
        },
        "Password is required for admin role.",
      ]
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

EmployeeSchema.virtual(
  'attendanceHistory', 
  {
    ref: 'Attendance',
    localField: 'emId',
    foreignField: 'emId',
  }
);

EmployeeSchema.pre('validate', async function () {
  if (this.isNew && !this.emId) {
    this.emId = await genNextSequence('emId', this.$session());
  };
});

EmployeeSchema.pre(/^find|countDocuments/, async function () {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  };
});

EmployeeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});
EmployeeSchema.set('toObject', { 
  virtuals: true ,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }  
});

const Employee = mongoose.model("Employee", EmployeeSchema);

export default Employee;