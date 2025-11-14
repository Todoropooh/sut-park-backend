import Booking from "../models/bookingModel.js";

// GET /public/bookings
export const getPublicBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ isActive: true });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { name, date } = req.body;
    const booking = new Booking({ name, date });
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/bookings/:id
export const updateBooking = async (req, res) => { /* ... */ };

// DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => { /* ... */ };
