# Integration Tests

The integration tests are leveraging a framework called [supertest](https://github.com/visionmedia/supertest#readme). This framework allows us to easily manage the HTTP payload and assert on the results and the HTTP status codes.  

The integration tests execute a series of transactions representing the complete life-cycle of a trade.  This is a good an easy way to exercise the network once it is all started.

## Running integration tests  

To run the integration tests, first make sures the prerequisite are met and that the network and REST servers are properly started.  Once this is done, execute the following commands:  
  
```
cd _integration
npm install
npm run e2e
```

Note: you only need to run the npm install the first time running the integration tests.  After that the `node_module` will be present, allowing you to execute the tests.

