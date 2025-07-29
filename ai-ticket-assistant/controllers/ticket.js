import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";
import mongoose from "mongoose"; // Import mongoose for ObjectId conversion

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });
    // Ensure newTicket is converted to plain object before sending
    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket.toObject(), // Added .toObject()
    });
  } catch (error) {
    console.error("❌ Error creating ticket:", error.message); // Added console.error
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];
    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 })
        .lean(); // CRITICAL: Ensure .lean() is here
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 })
        .lean(); // CRITICAL: Ensure .lean() is here
    }

    // Diagnostic log: Check the structure of 'tickets' right before sending
    console.log("Tickets being sent (first 2):", JSON.stringify(tickets.slice(0, 2), null, 2));

    return res.status(200).json({ tickets });
  } catch (error) {
    console.error("❌ Error fetching tickets (getTickets):", error.message); // Specific log
    // Log the full error object to see circular path details
    console.error("Full error details (getTickets):", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id)
        .populate("assignedTo", ["email", "_id"])
        .lean(); // CRITICAL: Ensure .lean() is here
    } else {
      ticket = await Ticket.findOne({
        createdBy: user._id,
        _id: req.params.id,
      }).select("title description status createdAt priority helpfulNotes relatedSkills assignedTo")
        .lean(); // CRITICAL: Ensure .lean() is here
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    // Ensure ticket is a plain JS object
    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("❌ Error fetching single ticket (getTicket):", error.message); // Specific log
    console.error("Full error details (getTicket):", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};