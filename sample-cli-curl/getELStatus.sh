#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

curl -X GET http://localhost:4000/el/trade-12/status -H "authorization: Bearer ${JWT_EXP}" ; echo
