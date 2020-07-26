curl -X POST http://localhost:8000/acceptTrade -H "content-type: application/x-www-form-urlencoded" -H "authorization: Bearer ${JWT_EXPENT}" -d 'tradeId=trade-34' ; echo
