import * as dotenv from 'dotenv';
import * as envalid from 'envalid';

// Load environment variables from a .env file into process.env
dotenv.config();

// Destructure the str validator from envalid
const { str } = envalid;

// Validate and clean the environment variables
export const env = envalid.cleanEnv(process.env, {
    SUPABASE_URL: str(), 
    SUPABASE_KEY: str(),
    AWS_REGION: str({ default: 'ap-southeast-1' }),
    SES_SENDER_EMAIL: str({ default: 'integreatapi@gmail.com' }),
    PHIL_SMS_API_URL: str({
      default: 'https://app.philsms.com/api/v3',
      desc: 'Base URL for PHIL SMS API'
    }),
    PHIL_SMS_API_KEY: str(),
});