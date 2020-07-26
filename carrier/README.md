# Carrier Organization's Application
This application is hosted and maintained by an Carrier Organization for its users to access and guide trade workflows. Three roles are currently supported:
- `admin`: this is not used currently, but it can be used for channel management operations in the future
- `client`: for the carrier to accept shipments and issue bill of lading. They can also view shipping information.

# Start the web server
In a terminal window:
- Run `CONFIG_PATH=<PATH-to-trade-network> npm start`
- The web server will listen for incoming HTTP requests on port 7000.
- To run the server on a different port, add the PORT environment variable like: `PORT=5000 CONFIG_PATH=<PATH-to-trade-network> npm start`
- _Note_: In a real production scenario, you should run the server only in HTTPS mode., but you can use any web client, like Postman):   

In the list below, we only mention the output of a successful operation.

- **Register a User**:
  ```
  curl -X POST http://localhost:7000/register -H "content-type: application/x-www-form-urlencoded" -d 'registrarUser=admin&registrarPassword=adminpw&username=<user>&password=<password>&role=<role>'
  ```
  This is meant to be run by a site administrator who knows the `registrarUser` and `registrarPassword` (in our case, we use the same credentials a Fabric CA registrar does.)   
  `<user>` and `<password>` can be any strings.   
  `<role>` MUST be either `client`, `banker`, or `admin`.   
  *Output JSON*:
  ```
  { true }
  ```
  If the request is successful, the server returns true.

- **Login a User**:
  ```
  curl -X POST http://localhost:7000/login -H "content-type: application/x-www-form-urlencoded" -d 'username=<user>&password=<password>'
  ```
  This is meant to be run by any registered user. Unregistered users will see an authorization error if they exercise this function.   
  `<user>` and `<password>` must match what was used in the earlier registration step.   
  *Output JSON*:
  ```
  { "token":<token-value>, "success": true, "message": "Logon successful"}
  ```
  `<token-value>` will be a long string like the following (example): `eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b20iLCJleHAiOjE1ODcwMDU4ODEsImlhdCI6MTU4Njk1MTg4MX0.DE1odMcZpiIsy57n9ot8Ki3QGOrpMIrp97UB14ZCyu04msdLLNO7cAZpHf3ZhHkCl2QbKrWBKiHwbpkNkN5lpA`.

- **Get Shipment Location Info**:
  ```
  curl -X GET http://localhost:7000/shipment/<trade-id>/location -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *Output JSON*:
  ```
  { "Location": <location> }
  ```
  `<location>` is a string.

- **Get Bill of Lading Info**:
  ```
  curl -X GET http://localhost:7000/shipment/<trade-id>/bol -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *Output JSON*:
  ```
  { <bill-of-lading-info> }
  ```
  `<bill-of-lading-info>` is a JSON string containg details of the B/L.

**Accept a Shipment and Issue a BL**:
  ```
  curl -X GET http://localhost:7000/shipment/<trade-id>/accept_and_issue_bill -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>" -d 'blId=<blId>&expirationDate=<expirationDate>&sourcePort=<sourcePort>&destinationPort=<destinationPort>'
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.     
  `blId` can be any string.  
  `expirationDate` is in the format `MM/DD/YYYY`.  
  `sourcePort` can be any string.  
  `destinationPort` can be any string.  

  *HTTP CODE*: 200

- **Update a shipment location**:
  ```
  curl -X POST http://localhost:7000//shipment/<trade-id>/update_location -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>" -d 'location=<location>'
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  `<location>` can be any string.   

  *HTTP CODE*: 200