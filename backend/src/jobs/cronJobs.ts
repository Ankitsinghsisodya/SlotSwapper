import { CronJob } from "cron";
import { prisma } from "../utilities/prisma.js";

const job = new CronJob(
  "*/5 * * * *", // Run every 5 minutes
  async function () {
    try {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      // Delete OTPs older than 5 minutes
      const deletedOTPs = await prisma.otp.deleteMany({
        where: {
          createdAt: {
            lt: fiveMinutesAgo,
          },
        },
      });

      // Delete events that ended more than 5 minutes ago
      const deletedEvents = await prisma.event.deleteMany({
        where: {
          endTime: {
            lt: fiveMinutesAgo,
          },
        },
      });

      console.log(
        `Cleanup completed: ${deletedOTPs.count} OTPs and ${deletedEvents.count} events deleted`
      );
    } catch (error) {
      console.log("error in the cronejob ", error);
    }
  }, // onTick
  null, // onComplete
  true, // start
  "Asia/Kolkata"
);

export { job };
