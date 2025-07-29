import { Inngest } from "inngest";

console.log("DEBUG: Inngest Client Init - Checking Environment Variables");
console.log("DEBUG: INNGEST_EVENT_KEY (first 5 chars):", process.env.INNGEST_EVENT_KEY ? process.env.INNGEST_EVENT_KEY.substring(0, 5) : "NOT SET");
console.log("DEBUG: INNGEST_SIGNING_KEY (first 5 chars):", process.env.INNGEST_SIGNING_KEY ? process.env.INNGEST_SIGNING_KEY.substring(0, 5) : "NOT SET");
console.log("DEBUG: INNGEST_BASE_URL:", process.env.INNGEST_BASE_URL || "NOT SET");


export const inngest = new Inngest({ id: "ticketing-system" });
