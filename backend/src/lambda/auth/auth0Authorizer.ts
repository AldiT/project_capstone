import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, APIGatewayAuthorizerHandler } from "aws-lambda";
import 'source-map-support/register';

import axios from 'axios';
import { verify } from 'jsonwebtoken';
import {createLogger} from '../../utils/logger';
import { getToken } from "../../utils/authUtils";
import { JwtPayload } from "src/types/JwtPayload";

const jwksUrl: string = 'https://dev-ak43slxn.us.auth0.com/.well-known/jwks.json';

const logger = createLogger("Authenticator");


export const handler: APIGatewayAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    try{
        logger.debug(`Authentication event: \n${event}`)
        const certificate = await getCertificateFromKey()
        const token = getToken(event);
        const verifiedToken = verify(token, certificate, {algorithms: ['RS256']}) as JwtPayload;
        logger.info(`User ${verifiedToken.sub} was authenticated successfully!`)
        return {
            principalId: verifiedToken.sub,
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
        logger.error(`Error during authentication: ${e}`);
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