import * as express from 'express';
import * as httpClient from 'http';

const user_token = 'authorization';

export class AuthenticationService {
    private userToken;

    constructor(request:express.Request) {
        this.userToken = request.headers[user_token];
    }

    authenticate(response:express.Response, next:any) {
        response['authentication_service'] = this;
        var request = httpClient.request(this.userServiceGetCurrentUserParams(response), (userResponse) => {
            console.log('Got status: ' + userResponse.statusCode);
            if (userResponse.statusCode == 200) {
                userResponse.on('data', (userData) => {
                    response['userData'] = userData;
                    next();
                });
            } else {
                response.writeHead(userResponse.statusCode);
                response.end();
            }
        }).on('error', function (error) {
            console.log('Got error: ' + error.message);
            response.writeHead(403);
            if (process.env.NODE_ENV != 'production') {
                response.end(JSON.stringify(error));
            } else {
                response.end();
            }
        });
        request.end();
    }

    userServiceGetCurrentUserParams(response:express.Response) {
        var discoveryService = response['discovery_service'];
        var params = discoveryService.serviceParams('user_service');
        var hostname = params ? params['ServiceAddress'] : '127.0.0.1';
        var port = params ? params['ServicePort'] : '3001';
        return {
            method: 'GET',
            hostname: hostname,
            port: port,
            path: '/current_user',
            headers: {"authorization": this.userToken}
        };
    }
}
