#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

curl -X GET http://localhost:7000/shipment/trade-12/accept_and_issue_bill -H "content-type: application/json" -H "authorization: Bearer ${JWT_CAR}" -d '{ "tradeId": "trade-12", "blId": "bl-12", "expirationDate": "03/05/2021", "sourcePort": "Mumbai", "destinationPort": "LosAngeles" }' ; echo
