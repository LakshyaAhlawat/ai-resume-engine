import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      default: 'Uploaded Candidate',
    },
    email: {
      type: String,
      default: 'N/A',
    },
    role: {
      type: String,
      default: 'Full Stack Engineer',
    },
    job_description: {
      type: String,
      default: 'No job description provided',
    },
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: 'Review',
    },
    analysis: {
      type: Object,
      default: {},
    },
    extracted_data: {
      type: Object,
      default: {},
    },
    resume_url: {
      type: String,
    },
    resume_name: {
      type: String,
    },
    chat_history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);
