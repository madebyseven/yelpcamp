const express = require("express");
const router = express.Router();

const campgrounds = require("../controllers/campgrounds");

const catchAsync = require("../utils/catchAsync");
// const ExpressError = require("../utils/ExpressError"); //need this to move in the middleware file

//Middleware here
// const { campgroundSchema } = require("../schemas.js"); //need this to move in the middleware file
const {
  isLoggedIn,
  validateCampground,
  isAuthor,
  validateReview,
} = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudinary");
// const upload = multer({ dest: "uploads/" }); //local storage
const upload = multer({ storage });

const Campground = require("../models/campground");
// const campground = require("../models/campground");

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );
// .post(upload.array("image"), (req, res) => {
//   // res.send(req.body, req.file); // deprecated
//   console.log(req.body, req.files);
//   res.send("IT WORKED!");
// });

//Campgrounds New Form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// router.get("/", (req, res) => {
//   res.render("home");
// });
// router.get("/", catchAsync(campgrounds.index));

//validate campground post/reviews
// router.post(
//   "/",
//   isLoggedIn,
//   validateCampground,
//   catchAsync(campgrounds.createCampground)
// );

// show campgrounds and reviews
// router.get("/:id", catchAsync(campgrounds.showCampground));

//Edit Campground
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

//edit reviews, note: you can use here a "put" or "patch"
// router.put(
//   "/:id",
//   isLoggedIn,
//   isAuthor,
//   validateCampground,
//   catchAsync(campgrounds.updateCampground)
// );

//Delete Campgrounds
// router.delete(
//   "/:id",
//   isLoggedIn,
//   isAuthor,
//   catchAsync(campgrounds.deleteCampground)
// );

module.exports = router;
