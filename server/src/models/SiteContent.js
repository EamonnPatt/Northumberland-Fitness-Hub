import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    image: { type: String, required: true },
  },
  { _id: false },
);

const hoursRowSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    hours: { type: String, required: true },
  },
  { _id: false },
);

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    day: { type: String, required: true },
    time: { type: String, required: true },
    instructor: { type: String, default: "" },
  },
  { _id: false },
);

const pricingTierSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "site" },
    hero: { type: [heroSlideSchema], default: [] },
    hours: { type: [hoursRowSchema], default: [] },
    classes: { type: [classSchema], default: [] },
    pricing: { type: [pricingTierSchema], default: [] },
  },
  { timestamps: true },
);

export const SiteContent = mongoose.model("SiteContent", siteContentSchema);

export const DEFAULT_CONTENT = {
  hero: [
    {
      title: "Feel Better. Move Better.\nLive Stronger",
      subtitle: "Premium Equipment. Safe Environment. Supportive Community",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Progress Starts The Moment You Show Up",
      subtitle: "Your Journey. Your Pace. Your Progress.",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Push Past Limits.\nBuild What Lasts.",
      subtitle: "Every Repetition Builds the Future you Want",
      image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop",
    },
  ],
  hours: [
    { day: "Monday", hours: "6:00 AM — 10:00 PM" },
    { day: "Tuesday", hours: "6:00 AM — 10:00 PM" },
    { day: "Wednesday", hours: "6:00 AM — 10:00 PM" },
    { day: "Thursday", hours: "6:00 AM — 10:00 PM" },
    { day: "Friday", hours: "6:00 AM — 10:00 PM" },
    { day: "Saturday", hours: "6:00 AM — 10:00 PM" },
    { day: "Sunday", hours: "6:00 AM — 10:00 PM" },
  ],
  classes: [
    { name: "HIIT Blast", day: "Monday", time: "6:00 PM", instructor: "TBD" },
    { name: "Spin", day: "Wednesday", time: "7:00 AM", instructor: "TBD" },
    { name: "Mobility & Core", day: "Friday", time: "5:30 PM", instructor: "TBD" },
  ],
  pricing: [
    { id: "basic", name: "Basic", price: "$29/mo", description: "Access to gym floor" },
    { id: "premium", name: "Premium", price: "$49/mo", description: "Gym floor & classes" },
    { id: "elite", name: "Elite", price: "$79/mo", description: "All access + personal training" },
  ],
};

export async function getOrCreateSiteContent() {
  let content = await SiteContent.findOne({ key: "site" });
  if (!content) {
    content = await SiteContent.create({ key: "site", ...DEFAULT_CONTENT });
  }
  return content;
}
