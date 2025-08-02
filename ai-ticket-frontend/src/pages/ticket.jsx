import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Use a ref to track the previous status, preventing notifications on every poll
  const prevStatus = useRef(null);

  useEffect(() => {
    let intervalId;

    const fetchTicketAndPoll = async () => {
      if (!ticket) {
        setLoading(true);
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (res.ok && data.ticket) {
          setTicket(data.ticket);
          if (
            data.ticket.status === "IN_PROGRESS" ||
            data.ticket.status === "RESOLVED" ||
            data.ticket.status === "CLOSED"
          ) {
            clearInterval(intervalId);
            setLoading(false);
          }
        } else {
          toast.error(data.message || "Failed to fetch ticket");
          clearInterval(intervalId);
          setLoading(false);
        }
      } catch (err) {
        toast.error("Something went wrong during fetch/poll");
        console.error(err);
        clearInterval(intervalId);
        setLoading(false);
      }
    };

    fetchTicketAndPoll();
    intervalId = setInterval(fetchTicketAndPoll, 2000);
    return () => clearInterval(intervalId);
  }, [id, token, ticket]);

  useEffect(() => {
    if (ticket && prevStatus.current === "TODO" && ticket.status === "IN_PROGRESS") {
        toast.success(`AI processing completed! The ticket has been assigned to a moderator.`);
    }
    prevStatus.current = ticket?.status;
  }, [ticket]);

  if (loading && !ticket) {
    return <div className="text-center mt-10">Loading ticket details...</div>;
  }
  if (!ticket) {
    return <div className="text-center mt-10">Ticket not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Ticket Details</h2>
      <div className="card bg-gray-800 shadow p-4 space-y-4">
        <h3 className="text-xl font-semibold">{ticket.title}</h3>
        <p>{ticket.description}</p>
        {ticket.status && (
          <>
            <div className="divider">Metadata</div>
            <p>
              <strong>Status:</strong> {ticket.status}
            </p>
            {ticket.priority && (
              <p>
                <strong>Priority:</strong> {ticket.priority}
              </p>
            )}
            {ticket.relatedSkills?.length > 0 && (
              <p>
                <strong>Related Skills:</strong>{" "}
                {ticket.relatedSkills.join(", ")}
              </p>
            )}
            {ticket.helpfulNotes && (
              <div>
                <strong>Helpful Notes:</strong>
                <div className="prose max-w-none rounded mt-2">
                  <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                </div>
              </div>
            )}
            {ticket.assignedTo && typeof ticket.assignedTo === 'object' && ticket.assignedTo.email && (
              <p>
                <strong>Assigned To:</strong> {ticket.assignedTo.email}
              </p>
            )}
            {ticket.assignedTo && typeof ticket.assignedTo === 'string' && (
                <p><strong>Assigned To ID:</strong> {ticket.assignedTo}</p>
            )}
            {ticket.createdAt && (
              <p className="text-sm text-gray-500 mt-2">
                Created At: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
