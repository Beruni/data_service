import * as express from 'express';
import * as httpClient from 'http';

export class NodeDiscoveryService {
  discoveryDataCache;
  fetchNodeServers(response:express.Response, next: any) {
    response['discovery_service'] = this;
    if(!this.discoveryDataCache && process.env.DISCOVERY_SERVICE_HOST) {
      var request = httpClient.request(this.getNodeServerUrlParams(),function(discoveryResponse){
        if(discoveryResponse.statusCode == 200) {
          discoveryResponse.on('data', function(discoveryData) {
            console.log('Discovery Data: ' + discoveryData);
            response['discovery_service'].discoveryDataCache = JSON.parse(discoveryData);
            next();
          });
        } else {
          next();
        }
      }).on('error', function(error) {
          console.log('Got discovery error: ' + error.message);
          next();
      });
      request.end();
    } else {
      next();
    }
  }

  getNodeServerUrlParams() {
    return {method: 'GET', hostname: process.env.DISCOVERY_SERVICE_HOST, port: 8500, path: '/v1/catalog/service/node'};
  }

  clearDiscoveryDataCache() {
    this.discoveryDataCache = [];
  }

  serviceParams(serviceName: string) {
    return this.discoveryDataCache.find(function(entry: JSON) {
      return entry['ServiceID'].match(serviceName);
    });
  }
}

