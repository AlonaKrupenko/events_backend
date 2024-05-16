const mongoose = require('mongoose');
const Event = require('./app');

const populateEvents = async () => {
  const sampleParticipants = [
    {
      fullName: "John Doe",
      email: "john.doe@example.com",
      birthDate: "25.01.2000",
      source: "ololol",
    },
    {
      fullName: "Jane Doe",
      email: "jane.doe@example.com",
      birthDate: "22.04.2010",
      source: "PLPLPL",
    },
  ];

  for (let i = 1; i <= 15; i++) {
    const newEvent = new Event({
      title: `Event ${i}`,
      description: `Description for Event ${i}`,
      date: new Date(2024, 0, i), // January i, 2024
      organizer: `Organizer ${i}`,
      participants: sampleParticipants, // Add sample participants to each event
    });

    try {
      await newEvent.save();
      console.log(`Event ${i} saved successfully!`);
    } catch (error) {
      console.error("Error saving event:", error);
    }
  }
};

populateEvents();
