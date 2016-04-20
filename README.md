Almost server less url shortener
===========================

Requirements

- VPC
- Redis ElastiCache
- Lambda Functions
- API Gateway

## Steps

* Create a VPC
* Create a Redis instance into the VPC
* Create the Lambda function using this project
* Create API in API Gateway
** Connect the GET or POST method to de Lambda function using a mapping like this:
```json
#set($allParams = $input.params())
{
  "url" : "$input.params('yourURLParameter')",
  "host" : "$input.params('host')",
  "redis" : {
      "host": "YourRedisEndpoint",
      "port" : "YourRedisPort"
  }
}
```
*** Create the method responses for handling response
**** Successful call
**** `NotFound` error response from Lambda
**** `InvalidUrl` error response from Lambda
** Create a resource `/{PreferredNameForKey}` and its action GET with a mapping like this:
```json
#set($inputRoot = $input.path('$'))
{
  "id" : "$input.params('PreferredNameForKey')",
  "host" : "$input.params('host')",
  "redis" : {
      "host": "YourRedisEndpoint",
      "port" : "YourRedisPort"
  }
}
```


## Usage

npm install

Create code for the shortener lambda function:
grunt build

Create code for the shortener "admin" function that can paginate throw redis:
grunt build:admin

