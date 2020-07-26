#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

curl -X GET http://localhost:4000/shipment/trade-12/bol -H "authorization: Bearer ${JWT_EXPBANK}" ; echo
