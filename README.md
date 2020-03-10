# kpism-api
API para gerencimento de indicadores

## Variaveis de ambiente

File: `.env`

```
NODE_ENV=devolepment
PORT=expressPort
SECRET=secret
MONGO_URL=mongodb+srv://user:pass@mongoserver.com/database?retryWrites=true
EMAIL_HOST=smtp.server
EMAIL_PORT=smtpPort
EMAIL_USER=userAccount
EMAIL_PASS=userPassword
```

## REST Endpoints

### Department

Create Department
```
POST {{url}}/api/departments
    Input: {
        "department": {
		    "name":"new department",
		    "description":"department"
	    }
    }
    Output: 
```

GET {{url}}/api/departments

    Input: -

    Output:

GET {{url}}/api/departments/:departmentId

    Input: -

    Output:

PUT {{url}}/api/departments/:departmentId

    Input: {
        "department": {
		    "name":"new department name",
            ...
	    }
    }

    Output:

DEL {{url}}/api/departments/:departmentId

    Input: -

    Output:

### Periods

POST {{url}}/api/periods

    Input: {
        "periods": {
		    "name":"2020",
		    "begin":"2020-01-01",
		    "end":"2020-12-31"
	    }
    }

    Output: 

GET {{url}}/api/periods

    Input: -

    Output:

GET {{url}}/api/periods/:periodId

    Input: -

    Output:

GET {{url}}/api/periods/:periodId # Get period references by id

    Input: -

    Output:

PUT {{url}}/api/periods/:periodId

    Input: {
        "period": {
		    "name":"new period name",
            ...
	    }
    }

    Output:

DEL {{url}}/api/periods/:periodId

    Input: -

    Output:

### User

POST {{url}}/api/users

    Input: {
        "user": {
		    "name":"user name",
		    "email":"user@company.com",
		    "role":"user/supervisor/admin",
		    "department": {"id": departmentId}
	    }
    }

    Output: 

GET {{url}}/api/users

    Input: -

    Output:

GET {{url}}/api/users/:userId

    Input: -

    Output:

PUT {{url}}/api/users/:userId

    Input: {
        "user": {
		    "name":"new user name",
            ...
	    }
    }

    Output:

DEL {{url}}/api/users/:userId

    Input: -

    Output:

### Auth

POST {{url}}/api/auth/forgot_password

    Input: {
	    "email":"user@company.com"
    }

    Output:

POST {{url}}/api/auth/reset_password

    Input: {
	    "email":"user@company.com",
	    "token": token,
	    "password":"user"
    }
    
    Output:

POST {{url}}/api/auth/login

    Input: {
	    "user": {
		    "email":"user@company.com",
		    "password":"user"
	    }
    }

    Output:

GET {{url}}/api/auth

    Input: -

    Output:
