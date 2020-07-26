# Exporter Organization's Application
This application is hosted and maintained by an Exporter Organization bank for its users to access and guide trade workflows. Three roles are currently supported:
- `admin`: this is not used currently, but it can be used for channel management operations in the future
- `banker`: for bankers (the bank's employees) to issue letters of credit, fulfill letter of credit payment obligations, and view letter of credit and payment information
- `client`: for the exporters (the bank's clients) to accept trades (purchase of goods) and letters of credit. They can also view letter of credit, shipping, and payment information.

# Start the web server
In a terminal window:
- Run `CONFIG_PATH=<PATH-to-trade-network> npm start`
- The web server will listen for incoming HTTP requests on port 4000.
- To run the server on a different port, add the PORT environment variable like: `PORT=5000 CONFIG_PATH=<PATH-to-trade-network> npm start`
- _Note_: In a real production scenario, you should run the server only in HTTPS mode.


# REST API
You can perform the following operations (indicated below using `curl`, but you can use any web client, like Postman):   

In the list below, we only mention the output of a successful operation.

- **Register a User**:
  ```
  curl -X POST http://localhost:4000/register -H "content-type: application/x-www-form-urlencoded" -d 'registrarUser=admin&registrarPassword=adminpw&username=<user>&password=<password>&role=<role>'
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
  curl -X POST http://localhost:4000/login -H "content-type: application/x-www-form-urlencoded" -d 'username=<user>&password=<password>'
  ```
  This is meant to be run by any registered user. Unregistered users will see an authorization error if they exercise this function.   
  `<user>` and `<password>` must match what was used in the earlier registration step.   
  *Output JSON*:
  ```
  { "token":<token-value>, "success": true, "message": "Logon successful"}
  ```
  `<token-value>` will be a long string like the following (example): `eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b20iLCJleHAiOjE1ODcwMDU4ODEsImlhdCI6MTU4Njk1MTg4MX0.DE1odMcZpiIsy57n9ot8Ki3QGOrpMIrp97UB14ZCyu04msdLLNO7cAZpHf3ZhHkCl2QbKrWBKiHwbpkNkN5lpA`.

- **List Trades**:
  ```
  curl -X GET http://localhost:4000/trade -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  **NOTE**: Only works when the Peer database is set to CouchDB.  Fails otherwise.  
  Replace `<token-value>` with the output of the `login` request.   
  `client` or `banker` can invoke this transaction.  
  Returns an array of trades the exporter organization is involved with.  
  *Output JSON*:  
  ```
  [{"amount":50,"descriptionOfGoods":"Some old computers","exporterMSP":"ExporterOrgMSP","importerMSP":"ImporterOrgMSP","status":"REQUESTED","tradeID":"1593798619023"}, ...]
  ```

- **Accept a Trade**:
  ```
  curl -X GET http://localhost:4000/trade/<trade-id>/accept_trade -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *HTTP CODE*: 200

- **Request an Export License**:
  ```
  curl -X POST http://localhost:4000/el/<trade-id>/request -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *HTTP CODE*: 200

- **Prepare a Shipment**:
  ```
  curl -X POST http://localhost:4000/shipment/<trade-id>/prepare -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>" -d 'carrierMSP=<Carrier-MSP>&descriptionOfGoods=<value>&amount=<num-value>&beneficiary=<Importer-MSP>'
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  `<Carrier-MSP>` can be a string containing an MSP ID.
  `<value>` can be any string.
  `<num-value>` can be any numeral value.  
  *HTTP CODE*: 200

- **Get Trade Info**:
  ```
  curl -X GET http://localhost:4000/trade/<trade-id> -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *Output JSON*:
  ```
  { <trade-info> }
  ```
  `<trade-info>` is a JSON string containg details of the trade.

- **Get Trade Status**:
  ```
  curl -X GET http://localhost:4000/trade/<trade-id>/status -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *Output JSON*:
  ```
  {"Status": <status> }
  ```
  `<status>` can be `REQUESTED` or `ACCEPTED`.

- **Get Letter Of Credit Info**:
  ```
  curl -X GET http://localhost:4000/lc/<trade-id> -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *Output JSON*:
  ```
  { <letter-of-credit-info> }
  ```
  `<letter-of-credit-info>` is a JSON string containg details of the letter of credit.

- **Get Letter of Credit Status**:
  ```
  curl -X GET http://localhost:4000/lc/<trade-id>/status -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *Output JSON*:
  ```
  {"Status": <status> }
  ```
 `<status>` can be `REQUESTED`, `ISSUED`, or `ACCEPTED`.

- **Get Export License Info**:
  ```
  curl -X GET http://localhost:4000/el/<trade-id> -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *Output JSON*:
  ```
  { <export-license-info> }
  ```
  `<export-license-info>` is a JSON string containg details of the export license.

- **Get Export License Status**:
  ```
  curl -X GET http://localhost:4000/el/<trade-id>/status -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *Output JSON*:
  ```
  {"Status": <status> }
  ```
 `<status>` can be `REQUESTED` or `ISSUED`.

- **Get Shipment Location Info**:
  ```
  curl -X GET http://localhost:4000/shipment/<trade-id>/location -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
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
  curl -X GET http://localhost:4000/shipment/<trade-id>/bol -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  `<trade-id>` can be any string.   
  *Output JSON*:
  ```
  { <bill-of-lading-info> }
  ```
  `<bill-of-lading-info>` is a JSON string containg details of the B/L.

- **Get Account Balance**:
  ```
  curl -X GET http://localhost:4000/account_balance -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer <token-value>"
  ```
  Replace `<token-value>` with the output of the `login` request.   
  Only a user with the `client` role may perform this function.   
  *Output JSON*:
  ```
  { <account-balance-info> }
  ```
  `<account-balance-info>` is a JSON string with the following format: `{ "Balance": <balance> }`. `<balance>` is a string representation of a number.
