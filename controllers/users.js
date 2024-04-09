const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  //   res.send(req.body); //note: testing here if the data are posting from form
  try {
    const { email, username, password } = req.body; //Destructuring assignment here
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    //checking here who is currently logged in
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      const { username } = req.body;
      req.flash("success", `Welcome to Yelp Camp! ${username}`);
      res.redirect("/campgrounds");
    });
    // console.log(registeredUser); //test if this working
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
  // console.log(registeredUser);
  // req.flash("success", "Welcome to Yelp Camp!");
  // res.redirect("/campgrounds");
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  const { username } = req.body;
  req.flash("success", `Welcome back, ${username}`);
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  // res.redirect("/campgrounds");
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    const { username } = req.body;
    req.flash("success", `Goodbye, ${username}`);
    res.redirect("/campgrounds");
  });
};

// router.get("/logout", (req, res) => {
//   const { username } = req.body;
//   req.logout();
//   req.flash("success", `Goodbye, ${username}`);
//   res.redirect("/campgrounds");
// });
