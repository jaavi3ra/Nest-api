import mongoose from 'mongoose'

const { ObjectId } = mongoose.Schema.Types

const submissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  student: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  evaluation: {
    type: ObjectId,
    ref: 'Evaluation',
    required: true,
  },
}, { timestamps: true })

export default mongoose.model('Submission', submissionSchema)