const mongoose = require("mongoose");

const walletTransactionSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
      },

      category: {
        type: String,
        enum: [
          "AdminCredit",
          "AdminDebit",
          "PlanPurchase",
          "MaturityReturn",
          "Refund",
          "ReferralBonus",
          "Other",
        ],
        default: "Other",
      },
      
      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      createdBy: {
        type: String,
        default: "System",
      },

      subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        default: null,
      },

      /*
       * Prevents duplicate maturity credit.
       * unique + sparse means only documents that actually
       * set a referenceId are checked for uniqueness — normal
       * transactions with no referenceId (null) can coexist.
       * Example:
       * MATURITY_RETURN_64f123...
       */
      referenceId: {
        type: String,
        unique: true,
        sparse: true,
        default: null,
      },
    },
    {
      timestamps: true,
    },
  );

module.exports = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema,
);