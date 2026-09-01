import mongoose from "mongoose";

const SEX_OPTIONS = ["male", "female", "other", "prefer_not_to_say"];
const AGE_RANGE_OPTIONS = ["under_18", "18_24", "25_34", "35_44", "45_54", "55_64", "65_plus"];
const MEMBERSHIP_OPTIONS = ["basic", "premium", "elite"];
const ROLE_OPTIONS = ["member", "admin"];

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true, default: "" },
    membership: { type: String, enum: MEMBERSHIP_OPTIONS, default: "basic" },
    sex: { type: String, enum: SEX_OPTIONS, required: true },
    ageRange: { type: String, enum: AGE_RANGE_OPTIONS, default: null },
    role: { type: String, enum: ROLE_OPTIONS, default: "member" },
  },
  { timestamps: true },
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
export { SEX_OPTIONS, AGE_RANGE_OPTIONS, MEMBERSHIP_OPTIONS, ROLE_OPTIONS };
