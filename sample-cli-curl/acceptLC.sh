#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

curl -X GET http://localhost:4000/loc/trade-12/accept_letter -H "authorization: Bearer ${JWT_EXPBANK}" ; echo
