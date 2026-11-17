$ curl -s -c cookies.txt -X POST http://localhost:5000/customer/login -H "Content-Type: application/json" -d '{"username":"arcaneyears","password":"pass123"}'
{"message":"User successfully logged in","accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoicGFzczEyMyIsImlhdCI6MTc5NDkxNjQ2NiwiZXhwIjoxNzk0OTIwMDY2fQ.Spci27g0Fdo_LKG1Gk_p3UVzTlIYTlQVUUNPFnAu8JA"}
