import Movie from "../models/movie.js";

// Create Movie
export const createMovie = async (req, res) => {
  const newMovie = new Movie({
    ...req.body,
  });

  try {
    const savedMovie = await newMovie.save();
    res.status(200).json({
      success: true,
      message: "Successfully created",
      data: savedMovie,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create movie",
      error: err.message,
    });
  }
};

// Update Movie
export const updateMovie = async (req, res) => {
  const id = req.params.id;

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Successfully updated movie",
      data: updatedMovie,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update movie. Try again",
    });
  }
};

// Delete Movie
export const deleteMovie = async (req, res) => {
  const id = req.params.id;

  try {
    await Movie.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Successfully deleted movie",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete movie. Try again",
    });
  }
};

// Get One
export const getSingleMovie = async (req, res) => {
  const id = req.params.id;

  try {
    const movie = await Movie.findById(id).populate(["reviews", "category"]);
    res.status(200).json({
      success: true,
      message: "Successfully fetched movie",
      data: movie,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Movie not found!",
    });
  }
};

//Get all
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();

    if (!movies || movies.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Movies not found!" });
    }

    res.status(200).json({ success: true, count: movies.length, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch movies" });
  }
};

export const getFeaturedMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ featured: true })
      .populate(["reviews", "category"])
      .limit(8);

    res.status(200).json({
      success: true,
      message: "Successfully fetched featured movies",
      data: movies,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Featured movies not found!",
    });
  }
};

export const getMoviesCount = async (req, res) => {
  try {
    const movieCount = await Movie.estimatedDocumentCount();
    res.status(200).json({
      success: true,
      data: movieCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch movie count",
    });
  }
};
