const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review.js");

//for Passport not updated
// module.exports.isLoggedIn = (req, res, next) => {
//   // console.log("REQ.USER...", req, res); //checking the current logged in user information
//   if (!req.isAuthenticated()) {
//     req.flash("error", "You must be signed in first!");
//     return res.redirect("/login");
//   }
//   next();
// };

//Passport Updated version!!!
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// module.exports.isAuthor = async (req, res, next) => {
//   const { id } = req.params;
//   const campground = await Campground.findById(id);
//   if (!campground.author.equals(req.user._id)) {
//       req.flash('error', 'You do not have permission to do that!');
//       return res.redirect(`/campgrounds/${id}`);
//   }
//   next();
// }

//Login Middleware here!
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; //add this line
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

//ValidateCampground Middleware Function
module.exports.validateCampground = (req, res, next) => {
  //the restructure
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
  //the restructure END
  //JOI Schema Validations END
};

//Author Middleware here!
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//ValidateReview Author
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//ValidateReview Middleware Function
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  // console.log(error); //test if theres error
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
