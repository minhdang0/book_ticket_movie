import express from "express";
import {
  createMovie,
  updateMovie,
  deleteMovie,
  getSingleMovie,
  getAllMovies,
} from "../controllers/movieController.js";

const router = express.Router();

// Create new movie (không cần upload file nữa)
router.post("/", createMovie);

// Update movie (không cần upload file nữa)
router.put("/:id", updateMovie);

// Delete movie
router.delete("/:id", deleteMovie);

// Get single movie
router.get("/:id", getSingleMovie);

// Get all movies by page
router.get("/", getAllMovies);

export default router;
