#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

curl -X GET http://localhost:5000/getAccountBalance -H "authorization: Bearer ${JWT_IMP}" ; echo
