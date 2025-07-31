
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true); 

  const token = localStorage.getItem("token");

  useEffect(() => {
    let intervalId; 
    const fetchTicketAndPoll = async () => {
      if (!ticket || ticket.status === "TODO") {
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
            clearInterval(intervalId); // Stop polling
            setLoading(false); // Hide loading when processing is complete
          }
        } else {
          alert(data.message || "Failed to fetch ticket");
          clearInterval(intervalId); // Stop polling on error
          setLoading(false); // Hide loading on error
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong during fetch/poll");
        clearInterval(intervalId); // Stop polling on error
        setLoading(false); // Hide loading on error
      }
    };
    // Initial fetch
    fetchTicketAndPoll();
    // Start polling every 2 seconds (adjust as needed)
    intervalId = setInterval(fetchTicketAndPoll, 2000);
    // Cleanup function: Clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, [id, token, ticket]); 
  // If no ticket data has been fetched yet AND we are still in a loading state, show "Loading..."
  if (loading && !ticket) {
    return <div className="text-center mt-10">Loading ticket details...</div>;
  }
  // If ticket is null after loading (e.g., 404 from backend), show "Ticket not found"
  if (!ticket) {
    return <div className="text-center mt-10">Ticket not found</div>;
  }

  // If we have a ticket, render its details immediately,
  // the metadata will appear as 'ticket' state updates via polling.
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