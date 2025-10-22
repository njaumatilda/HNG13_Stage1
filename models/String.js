import mongoose from "mongoose"

const stringSchema = new mongoose.Schema({
  id: {
    type: String,
    trim: true,
  },
  value: {
    type: String,
    required: true,
    trim: true,
  },
  properties: {
    length: {
      type: Number,
      trim: true,
    },
    is_palindrome: {
      type: Boolean,
      trim: true,
    },
    unique_characters: {
      type: Number,
      trim: true,
    },
    word_count: {
      type: Number,
      trim: true,
    },
    sha256_hash: {
      type: String,
      trim: true,
    },
    character_frequency_map: {
      type: Map,      // tells Mongoose it’s a key–value structure.  
      of: Number,     // values are numbers
      default: {}     // start as empty map
    },
  },
  created_at: {
    type: String,
    trim: true
  },
})

export default mongoose.model("string", stringSchema)
