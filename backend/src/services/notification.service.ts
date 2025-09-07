import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";

import { SECRET_VARIABLES } from "../config/secret-variable.js";

// Create a queue for notifications
const connection = {
  host: SECRET_VARIABLES.redis_host,
  port: SECRET_VARIABLES.redis_port,
};
const notificationQueue = new Queue("notificationQueue", { connection });

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: SECRET_VARIABLES.brevo_server,
  port: SECRET_VARIABLES.brevo_port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: SECRET_VARIABLES.brevo_username,
    pass: SECRET_VARIABLES.brevo_password,
  },
});

// Worker to process the queue jobs
new Worker(
  "notificationQueue",
  async (job) => {
    const { type, data } = job.data;

    if (type === "email") {
      await transporter.sendMail({
        from: SECRET_VARIABLES.brevo_email,
        to: data.email,
        subject: data.subject,
        html: data.body,
      });
      console.log(`Email sent to ${data.email}`);
    }
  },
  { connection }
);

// Function to add a notification job to the queue
export const sendNotification = async (userId: string, email: string, subject: string, body: string) => {
  try {
    await notificationQueue.add("sendEmail", {
      type: "email",
      data: { userId, email, subject, body },
    });
    console.log(`Notification job added to queue for user ${userId}`);
  } catch (error) {
    console.error(`Failed to add notification job for user ${userId}:`, error);
  }
};
