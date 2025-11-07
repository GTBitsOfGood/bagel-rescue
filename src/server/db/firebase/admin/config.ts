import { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// Define the service account object with the correct types and camel-cased properties
const serviceAccount: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
};

// Export the service account configuration
export default serviceAccount;
