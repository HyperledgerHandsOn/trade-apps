# Trading Apps Repository  
  
[![Build Status](https://travis.ibm.com/Hyperledger-Book-2nd-Edition/trade-apps.svg?token=sQbGqm1RNTX4ZceCsxf9&branch=master)](https://travis.ibm.com/Hyperledger-Book-2nd-Edition/trade-apps)

This repository contains the REST servers used to transact and query the trade network.  

It contains:  
  
* [Integration tests](_integration) - Covering the basic life-cycle of a trade from creation to delivery invoking each REST server.  
* [Exporter REST server](exporter) - REST server implemented with **JavaScript** and providing the transactions specific to an exporter (like accept trade) or exporter's bank (like request payment).  
* [Importer REST server](importer) - REST server implemented with **Java** and providing the transactions specific to an importer (like request trade) or importer's bank (like issue letter of credit).
* [Regulator REST server](regulator) - REST server implemented with **Java** and providing the transactions specific to a regulator (like issue export license).  
* [Carrier REST server](carrier) - REST server implemented with **JavaScript** and providing the transactions specific to an exporter (like accept shipment). 
* [Exporting Entity REST server](carrier) - REST server implemented with **Java** and providing the transactions specific to an exporting entity (like accept trade). 
* [Sample CLI Scripts](sample-cli-curl) - Command-line scripts using **curl** to manually create user accounts, run trade life-cycle operations, and view ledger info, through the REST servers. 

Each of those folder contains additional details pertaining to each REST server.  
  
## Prerequisite  
  
Code has been tested on macOS Catalina and Ubuntu 18.04.  
While it should run on other platform like Windows, it does not include the convenience scripts.

In addition, the system requires:
* VSCode
* Docker Community - v19.03+
* docker-compose 1.25+
* Node 12.13+
* npm 6.12
* Java JDK 11
* Gradle 6.4+
* Make - latest
* curl - latest
* jq - latest

Before starting the REST servers, you need to make sure the network is running, the chaincode is installed and the connection profile are created.  Instructions can be found in the [trade-network](https://github.ibm.com/Hyperledger-Book-2nd-Edition/trade-network) repository.  

## Building the REST servers
  
A convenience shell script is provided in the root of this repository:
`./makeAll.sh`  
  
This script will invoke `make all` within each sub-repository and will build and tag a docker image. This can be used when testing the REST server as containerized application residing on the same local/logical network as the Hyperledger Fabric Trade Network.  

Manual build of the **Java** REST servers(importer/regulator):  
  
1. Change directory (`cd`) into the REST server you want to build.  
2. Run `gradle build`  
3. To test the REST server run `gradle test`
  
Manual build of the **JavaScript** REST servers(exporter/carrier):  
  
1. Change directory (`cd`) into the REST server you want to build.  
2. Run `npm install`  
3. To test the REST server run `npm test`
  
## Running the REST servers

### Starting as containers  
  
Once containers are built, make sure the network is running, the chaincode is installed and the connection profile are created

To create the connection profile:  
  
```
cd trade-networks/bash/utils
./generateAllProfiles.sh
```

To start the rest docker containers:  
  
```
docker run -p 4000:4000 --network="net_trade" --name exporter-rest -v $(pwd)/../../trade-network/:/config --rm -d exporter-rest:latest  
```
```
docker run -p 5000:8080 --network="net_trade" --name importer-rest -v $(pwd)/../../trade-network/:/config --rm importer-rest:latest
```
```
docker run -p 6000:8080 --network="net_trade" --name regulator-rest -v $(pwd)/../../trade-network/:/config --rm regulator-rest:latest
```
```
docker run -p 7000:8080 --network="net_trade" --name carrier-rest -v $(pwd)/../../trade-network/:/config --rm carrier-rest:latest
```

### Starting as local process  
  
Since the process is not running within the local docker trade_net, the REST servers will not have automatic visibility of the Hyperledger Fabric nodes (CA, Peers, Orderer).  As such you will need to add to your /etc/hosts, the following list of hostname, all pointing to `127.0.0.1`:
  
  * ca.exporterorg.trade.com
  * ca.importerorg.trade.com
  * ca.regulatororg.trade.com
  * ca.carrierorg.trade.com
  * peer0.exporterorg.trade.com
  * peer0.importerorg.trade.com
  * peer0.regulatororg.trade.com
  * peer0.carrierorg.trade.com
  * orderer.trade.com  
    
To start the **Java** REST servers (importer/regulator):  
`./gradlew bootRun`

To start the **JavaScript** REST servers (exporter/carrier):  
`npm start`

## Running integration tests
  
Refer to the instructions provided here: [Integration tests](_integration)  
  
## Running manual tests
  
Refer to the instructions provided here: [Sample CLI scripts](sample-cli-curl)  

