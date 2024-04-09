if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// require("dotenv").config();

console.log(process.env.SECRET);
console.log(process.env.API_KEY);

const express = require("express");
const path = require("path");

const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const methodOverride = require("method-override");

const session = require("express-session");
const MongoStore = require("connect-mongo");

const flash = require("connect-flash");

const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

//Passport and Passport Local
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

//HELMET - for securit purpose!
const helmet = require("helmet");

//Express Mongo Sanitize - for securit purpose!
const mongoSanitize = require("express-mongo-sanitize");

const dbUrl = "mongodb://localhost:27017/yelp-camp";

//Online Server!!!
// const dbURL = process.env.DB_URL;
// mongoose.connect(dbURL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   // useCreateIndex: true, // outdated
//   // useFindAndModify: false, // outdated: to avoid deprecation error
// });

//Local Server!!!
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true, // outdated
  // useFindAndModify: false, // outdated: to avoid deprecation error
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: { secret: "thisshouldbeabettersecret!" },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

//Configuring Session here
const sessionConfig = {
  store,
  name: "session",
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //1000 milisecond, 60 seconds, 60 minutes in an hour, 24 hours in a day, and 7 days in a week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet({ contentSecurityPolicy: false }));
// app.use(helmet()); //including this breaks the CSP // HELMET VERSION 5.0.1 here is the solution!!!
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dv5vm4sqh/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dv5vm4sqh/",
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/dv5vm4sqh/",
];
const fontSrcUrls = ["https://res.cloudinary.com/dv5vm4sqh/"];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dbwlcvivd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
      childSrc: ["blob:"],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Configuring Flash Middleware
app.use((req, res, next) => {
  console.log(req.query);
  console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//Fake user/data here
app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "colttt@gmail.com", username: "colttt" });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});

// //Middleware Function
// const validateCampground = (req, res, next) => {
//   //the restructure
//   const { error } = campgroundSchema.validate(req.body);
//   if (error) {
//     const msg = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(msg, 400);
//   } else {
//     next();
//   }
//   //the restructure END
//   //JOI Schema Validations END
// };

// const validateReview = (req, res, next) => {
//   const { error } = reviewSchema.validate(req.body);
//   // console.log(error); //test if theres error
//   if (error) {
//     const msg = error.details.map((el) => el.message).join(",");
//     throw new ExpressError(msg, 400);
//   } else {
//     next();
//   }
// };

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// THIS IS MOVED TO THE ROUTES FOLDER AND PASTE ON CAMPGROUNDS.JS

// app.get(
//   "/campgrounds",
//   catchAsync(async (req, res) => {
//     const campgrounds = await Campground.find();
//     res.render("campgrounds/index", { campgrounds });
//   })
// );

// app.get("/campgrounds/new", (req, res) => {
//   res.render("campgrounds/new");
// });

// //validate campground reviews/post
// app.post(
//   "/campgrounds",
//   validateCampground,
//   catchAsync(async (req, res, next) => {
//     const campground = new Campground(req.body.campground);
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
//   })
// );

// // show reviews
// app.get(
//   "/campgrounds/:id",
//   catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id).populate(
//       "reviews"
//     );
//     res.render("campgrounds/show", { campground });
//   })
// );
// app.get(
//   "/campgrounds/:id/edit",
//   catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id);
//     res.render("campgrounds/edit", { campground });
//   })
// );
// app.put(
//   "/campgrounds/:id",
//   validateCampground,
//   catchAsync(async (req, res) => {
//     // checking if its working
//     // res.send("It Worked!")
//     const { id } = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, {
//       ...req.body.campground,
//     });
//     res.redirect(`/campgrounds/${campground._id}`);
//   })
// );

// //the 1st step: checking if saving and connected to the database
// // app.get('/makecampground', async (req, res) => {
// //     const camp = new Campground ({
// //         title: 'My Backyard',
// //         description: 'cheap camping'
// //     });
// //     await camp.save();
// //     res.send(camp)
// // })

// //Delete Campgrounds
// app.delete("/campgrounds/:id", async (req, res) => {
//   const { id } = req.params;
//   await Campground.findByIdAndDelete(id);
//   res.redirect("/campgrounds");
// });

// THIS IS MOVED TO THE ROUTES FOLDER AND PASTE ON REVIEWS.JS
//add reviews - add routes
// app.post(
//   "/campgrounds/:id/reviews",
//   validateReview,
//   catchAsync(async (req, res) => {
//     // res.send("You made it!"); //test if the routes are working
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
//   })
// );

// //Delete Review
// //use operator in mongo called $pull operator
// app.delete(
//   "/campgrounds/:id/reviews/:reviewId",
//   catchAsync(async (req, res) => {
//     // res.send("Delete Successfully!"); // Test first if working the connection first
//     const { id, reviewId } = req.params; // this is Obj Destructure
//     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     // await Review.findByIdAndDelete(req.params.reviewId); // this is not Obj Destructure
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/campgrounds/${id}`);
//   })
// );

//ExpressError
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//catchAsync Error message or ExpressError
app.use((err, req, res, next) => {
  // const { statusCode = 500, message = 'Something went wrong' } = err;
  // res.status(statusCode).send(message);

  //the restructuring
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something went wrong!";
  res.status(statusCode).render("error", { err });
  // res.send('Oh boy, Something went wrong!')
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
