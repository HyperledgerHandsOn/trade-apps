#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

curl -X GET http://localhost:4000/trade/trade-12/accept_trade -H "authorization: Bearer ${JWT_EXP}" ; echo
