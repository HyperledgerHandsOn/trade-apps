# Running an Instance of the Trade Workflow through the Four Applications
The scripts in this folder span a complete trade workflow, starting with a request for a trade with id `trade-12` for the amount of `90000` and ending with delivery and payment. Before making the trade request, users are registered and logged in to their respective applications.

# Trade Participants' User Identities
Usernames registered in the applications for the participants in the scenario are as follows:   

| Persona | Username | Application |   
| :---- | :------ | :------- |   
| Exporter        | `exporter`  | _exporter_  |   
| Exporter's Bank | `eb`        | _exporter_  |   
| Importer        | `exporter`  | _importer_  |   
| Importer's Bank | `ib`        | _importer_  |   
| Carrier         | `carrier`   | _carrier_   |   
| Regulator       | `regulator` | _regulator_ |   

# Pre-requisites: Commmands
Make sure you have the `curl` and `jq` tools installed on your machine before attempting to run the scripts.

# Pre-requisites: Applications and Ports
The scripts assume that the applications servers are running on `localhost` and listening on the following ports. For instructions and specifications for each application, click the respective links.   

| Application | Port | Instructions |
| :------ | :---- | :------- |   
| _exporter_ | 4000 | [Exporter README](../exporter/README.md) |   
| _importer_ | 5000 | [Importer README](../importer/README.md) |   
| _regulator_ | 6000 | [Regulator README](../regulator/README.md) |   
| _carrier_ | 7000 | [Carrier README](../carrier/README.md) |   

# Register Users
To register all six users, each with the password `password`, run:
```
./registerAll.sh
```

# Login Users
To login all six users, each with the password `password`, run:
```
. loginAll.sh
```

# Trade Operational Commands
Commands that change ledger state by triggering contract transactions underneath are:
- `requestTrade.sh`
- `acceptTrade.sh`
- `requestLC.sh`
- `issueLC.sh`
- `acceptLC.sh`
- `requestEL.sh`
- `issueEL.sh`
- `prepareShipment.sh`
- `acceptShipmentAndIssueBL.sh`
- `updateShipmentLocationDestination.sh`
- `requestPayment.sh`
- `makePayment.sh`

# Trade State Commands
Commands that retrieve ledger state by triggering contract queries underneath are:
- `getTrade.sh`
- `getTradeStatus.sh`
- `getLC.sh`
- `getLCStatus.sh`
- `getEL.sh`
- `getELStatus.sh`
- `getBillOfLading.sh`
- `getShipmentLocation.sh`
- `getExporterBalance.sh`
- `getImporterBalance.sh`
- `listTrades.sh`

# Trade Workflow Script
Follow this script to run a trade with id `trade-12`.   
You can change argument values in the scripts as you wish, but the trade id must be consistent across all the commands.)   
The operational commands must be run in the given sequence and using the given personas.
The state query commands can be run in any order and at any stage, and with different personas (check access control rules in each application for the lists).

- **Request a Trade as Importer**
```
./requestTrade.sh
```

- **Accept a Trade as Exporter**
```
./acceptTrade.sh
```

- **Get Trade Details as Importer**
```
./getTrade.sh
```

- **Get Trade Status as Exporter**
```
./getTradeStatus.sh
```

- **Request an L/C as Importer**
```
./requestLC.sh
```

- **Issue an L/C as Importer's Bank**
```
./issueLC.sh
```

- **Accept an L/C as Exporter's Bank**
```
./acceptLC.sh
```

- **Get L/C Details as Exporter's Bank**
```
./getLC.sh
```

- **Get L/C Status as Importer's Bank**
```
./getLCStatus.sh
```

- **Request an E/L as Exporter**
```
./requestEL.sh
```

- **Issue an E/L as Regulator**
```
./issueEL.sh
```

- **Get E/L Details as Regulator**
```
./getEL.sh
```

- **Get E/L Status as Exporter**
```
./getELStatus.sh
```

- **Prepare a Shipment as Exporter**
```
./prepareShipment.sh
```

- **Accept a Shipment and Issue a B/L as Carrier**
```
./acceptShipmentAndIssueBL.sh
```

- **Get Shipment Location as Importer**
```
./getShipmentLocation.sh
```

- **Get B/L Details as Exporter's Bank**
```
./getBillOfLading.sh
```

- **Request Payment as Exporter's Bank**
```
./requestPayment.sh
```

- **Get Account Balance as Exporter**
```
./getExporterBalance.sh
```

- **Get Account Balance as Importer**
```
./getImporterBalance.sh
```

- **Make Payment as Importer's Bank**
```
./makePayment.sh
```

- **Get Account Balance as Exporter**
```
./getExporterBalance.sh
```

- **Get Account Balance as Importer**
```
./getImporterBalance.sh
```

- **Update Shipment Location to Destination as Carrier**
```
./updateShipmentLocationDestination.sh
```

- **Get Shipment Location as Importer**
```
./getShipmentLocation.sh
```

- **Request Payment as Exporter's Bank**
```
./requestPayment.sh
```

- **Make Payment as Importer's Bank**
```
./makePayment.sh
```

- **Get Account Balance as Exporter**
```
./getExporterBalance.sh
```

- **Get Account Balance as Importer**
```
./getImporterBalance.sh
```

- **Get List of Trades on Ledger (with Details) as Importer**
```
./listTrades.sh
```

# Running Sample Trade Workflow Operations through the Fifth Application after Adding an Exporting Entity Organization to the Network
There are additional scripts to create and accept a new trade with id `trade-34` for the amount of `50000` involving the exporting entity whose organization is added through a channel update (see `trade-network/bash' for instructions). A new user is registered and logged in to its (`exportingentity`) application.

# New Trade Participant's User Identity
Username registered in the `exportingentity` application is as follows:   

| Persona | Username | Application |   
| :---- | :------ | :------- |   
| Exporting Entity | `exportingentity`  | _exporting entity_  |   

# Pre-requisites: Application and Port
The scripts assume that the `exportingentity` application servers is running on `localhost` and listening on the following port. For instructions and specifications for the application, click the link.   

| Application | Port | Instructions |
| :------ | :---- | :------- |   
| _exportingentity_ | 8000 | [Exporting Entity README](../exportingentity/README.md) |   

# Register New Organization User
To register the new user with the password `password`, run:
```
./registerNewOrg.sh
```

# Login New Organization User
To login the new user with the password `password`, run:
```
. loginExportingEntity.sh
```

# Trade Workflow Script
Follow this script to request and accept a trade with id `trade-34`.   
You can change argument values in the scripts as you wish, but the trade id must be consistent across all the commands.)   
The operational commands must be run in the given sequence and using the given personas.
The state query commands can be run in any order and at any stage, and with different personas (check access control rules in each application for the lists).

- **Request a New Trade as Importer**
```
./requestNewTrade.sh
```

- **Accept a New Trade as Exporting Entity**
```
./acceptNewTrade.sh
```

- **Get Trade Details as Exporting Entity**
```
./getNewTrade.sh
```

- **Get Trade Status as Exporting Entity**
```
./getNewTradeStatus.sh
```

- **Get Account Balance as Exporting Entity**
```
./getExportingEntityBalance.sh
```

- **Get List of Trades on Ledger (with Details) as Exporting Entity**
```
./listTradesNewOrg.sh
```
