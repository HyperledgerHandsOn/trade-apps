curl -X POST http://localhost:6000/issueEL -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer ${JWT_REG}" -d 'tradeId=trade-12&elId=el-12&expirationDate=04/30/2021' ; echo
