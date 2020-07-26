curl -X GET http://localhost:7000/shipment/trade-12/update_location -H "content-type: application/json" -H "authorization: Bearer ${JWT_CAR}" -d '{ "location": "DESTINATION" }' ; echo
