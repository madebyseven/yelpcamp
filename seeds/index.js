const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

// array[Math.floor(Math.random() * array.length)]
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      // YOUR USER ID
      author: "660135fdec6898f281697aff",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      // image: `https://source.unsplash.com/collection/483251`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dbwlcvivd/image/upload/v1711896313/Yelpcamp/default-image_mmw0k0.png",
          filename: "Yelpcamp/ars6rlwjietvhnxvjrlc",
        },
        {
          url: "https://res.cloudinary.com/dbwlcvivd/image/upload/v1711811714/Yelpcamp/d3kmtifijzbapkecxifq.png",
          filename: "Yelpcamp/d3kmtifijzbapkecxifq",
        },
      ],
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias tenetur facilis soluta at repudiandae. Ex quo expedita magni placeat, laborum voluptatum veritatis dolorum sit? Hic, nobis nesciunt? Dolores, inventore ipsum.",
      price,
    });
    await camp.save();
  }

  //checking if saving and connected to the database
  // const c = new Campground({
  //     title: 'purple field'
  // });
  // await c.save();
};

seedDB().then(() => {
  mongoose.connection.close();
});
