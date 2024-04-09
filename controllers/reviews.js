const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  // res.send("You made it!"); //test if the routes are working
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  // res.send("Delete Successfully!"); // Test first if working the connection first
  const { id, reviewId } = req.params; // this is Obj Destructure
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  // await Review.findByIdAndDelete(req.params.reviewId); // this is not Obj Destructure
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review!");
  res.redirect(`/campgrounds/${id}`);
};
