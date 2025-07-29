// ai-ticket-assistant/inngest/functions/on-ticket-create.js

import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";
import mongoose from "mongoose"; // Ensure mongoose is imported for ObjectId if needed for ticket._id

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // STEP 1: Fetch Ticket from DB
      const ticket = await step.run("fetch-ticket", async () => {
        // Ensure ticketId is a valid ObjectId for Mongoose
        if (!mongoose.Types.ObjectId.isValid(ticketId)) {
            throw new NonRetriableError(`Invalid ticket ID: ${ticketId}`);
        }
        const ticketObject = await Ticket.findById(ticketId).lean(); // Ensure .lean()
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      // STEP 2: AI Processing
      const aiResponse = await analyzeTicket(ticket);

      // STEP 3: Update Ticket with AI Data
      // This step returns the `relatedSkills` array for the next step.
      const relatedSkills = await step.run("update-ticket-with-ai-data", async () => {
        let skills = [];
        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            $set: {
              priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
              helpfulNotes: aiResponse.helpfulNotes,
              status: "IN_PROGRESS",
              relatedSkills: aiResponse.relatedSkills,
            }
          });
          skills = aiResponse.relatedSkills;
        } else {
          console.warn(`AI analysis failed for ticket ${ticket._id}. Skipping AI-based updates.`);
        }
        return skills; // Return skills for the next step
      });

      // STEP 4: Assign Moderator
      // This step returns the assigned User object.
      const assignedModerator = await step.run("assign-moderator", async () => {
        // Construct regex pattern safely
        const skillsRegexPattern = relatedSkills.length > 0 ? relatedSkills.join("|") : null;

        let userToAssign = null;

        if (skillsRegexPattern) {
          // Attempt to find a moderator with matching skills
          userToAssign = await User.findOne({
            role: "moderator",
            skills: {
              $elemMatch: {
                $regex: skillsRegexPattern,
                $options: "i",
              },
            },
          }).lean(); // Ensure .lean()
        }

        if (!userToAssign) {
          // Fallback: If no skill-matching moderator found, find an admin
          userToAssign = await User.findOne({
            role: "admin",
          }).lean(); // Ensure .lean()
        }

        // Update the ticket with the assigned user's ID
        await Ticket.findByIdAndUpdate(ticket._id, {
          $set: {
            assignedTo: userToAssign?._id || null,
          },
        });

        return userToAssign; // Return the assigned user object
      });

      // STEP 5: Send Email Notification
      await step.run("send-email-notification", async () => {
        if (assignedModerator) { // Use 'assignedUser' returned from the previous step
          const finalTicket = await Ticket.findById(ticket._id).lean(); // Ensure .lean()
          await sendMail(
            assignedModerator.email, // Use email from assignedUser
            "Ticket Assigned",
            `A new ticket is assigned to you: ${finalTicket.title}`
          );
        } else {
          console.warn(`No user assigned to ticket ${ticket._id}. Skipping email notification.`);
        }
      });

      return { success: true }; // Indicate overall success
    } catch (err) {
      console.error("❌ Error in onTicketCreated function:", err.message);
      // If a NonRetriableError is thrown from a step, Inngest won't retry.
      // Otherwise, it will retry based on 'retries' config.
      return { success: false }; // Indicate overall failure
    }
  }
);