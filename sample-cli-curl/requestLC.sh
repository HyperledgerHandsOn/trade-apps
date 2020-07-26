curl -X POST http://localhost:5000/requestLC -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer ${JWT_IMP}" -d 'tradeId=trade-12' ; echo
