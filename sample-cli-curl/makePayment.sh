curl -X POST http://localhost:5000/makePayment -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer ${JWT_IMPBANK}" -d 'tradeId=trade-12' ; echo
