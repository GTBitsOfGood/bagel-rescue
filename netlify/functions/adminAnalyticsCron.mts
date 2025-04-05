import { updateAdminAnalytics } from "../../src/server/db/actions/adminAnalytics";
import type { Config } from "@netlify/functions";

const handler = async () => {
    let retryCount = 0;
    let success = false;
    
    while (!success && retryCount < 1) {
        try {
            
            await updateAdminAnalytics();
            success = true;
            console.log("Admin analytics cron executed successfully.");
     
            return { statusCode: 200 };
        } catch (error) {
        console.error("Error in admin analytics cron:", error);
        retryCount++;
        }
    }
    
    return { statusCode: 500 };
}

export { handler };
