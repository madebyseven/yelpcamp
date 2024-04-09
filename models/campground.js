const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

// https://res.cloudinary.com/dbwlcvivd/image/upload/w_300/v1711857097/Yelpcamp/s1riarlhegipaitx3ugk.jpg

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

// Mapbox here!!!
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<b><a href="/campgrounds/${
    this._id
  }">${this.title}</a></b><p>${this.description.substring(0, 20)}...</p>`;
});

// Campground Delete Middleware - Mongoose
// this is Query Middleware
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  // console.log("Deleted Campground!"); // test if this show up in the node terminal
  // console.log(doc); // test the delete if its working and at the same time it shows the details delete in the node terminal. note: the "doc" term is from the passed function
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
  console.log("Campground Successfully Deleted!");
  console.log(doc);
});

module.exports = mongoose.model("Campground", CampgroundSchema);
