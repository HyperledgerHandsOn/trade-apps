#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

curl -X GET http://localhost:6000/getEL?tradeId=trade-12 -H "authorization: Bearer ${JWT_REG}" ; echo
