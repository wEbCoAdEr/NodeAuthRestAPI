const mongoose = require('mongoose');

const tokenSchema = mongoose.Schema(
  {
    tokens: [
      {
        type: String,
        required: true,
      }
    ],
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Token
 */
const Token = mongoose.model('FcmToken', tokenSchema);

module.exports = Token;
