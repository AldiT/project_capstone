import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import 'source-map-support/register';

import axios from 'axios';

const jwksUrl: string = 'https://dev-ak43slxn.us.auth0.com/.well-known/jwks.json'

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    try{


        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement:  [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }

    }catch(e){
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement:  [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}

async function getCertificateFromKey(): Promise<string> {
    const key = await retrieveJWTK(jwksUrl);
  
    const cert: string = "-----BEGIN CERTIFICATE-----\n" + key.x5c[0] + "\n-----END CERTIFICATE-----";
  
    return cert;
  }
  
  async function retrieveJWTK(url: string){
    try{
      const result = await axios.get(url);
      console.log("Retrieved data: \n", result.data);
      return result.data.keys[0];
    }catch(e){
      logger.error(e);
    }
  }