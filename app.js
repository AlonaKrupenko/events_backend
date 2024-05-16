const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const dbURI = "mongodb://localhost/eventsdb"; // Replace with your MongoDB URI
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const ParticipantSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  birthDate: { type: String, required: true },
  source: { type: String, required: false },
});

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  organizer: { type: String, required: true },
  participants: [ParticipantSchema], // Array of participants
});

const Event = mongoose.model("Event", EventSchema);

module.exports = Event;

// Routes
// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Events Registration API!");
});

// Get all events
app.get("/api/events", async (req, res) => {
  const { page = 1, limit = 12, sort = "title", direction = "asc" } = req.query;
  const sortOrder = direction === "asc" ? 1 : -1;

  try {
    const events = await Event.find()
      .sort({ [sort]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await Event.countDocuments();

    res.json({
      events,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error in sorting events:", err);
    res.status(500).json({ message: err.message });
  }
});

//Get event buy Id
app.get("/api/events/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event); // Return only the participants array
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assuming app.js or routes.js in your Node.js/Express app
app.post("/api/events/:eventId/participants", async (req, res) => {
  const { eventId } = req.params;
  const participant = req.body; // This should be the participant data sent from the frontend

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $push: { participants: participant } },
      { new: true, runValidators: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Server Port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
