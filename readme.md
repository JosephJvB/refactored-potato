# yo

https://in58jhw54e.execute-api.ap-southeast-2.amazonaws.com/dev/image?query={q}

### Todos:
1. Can I restrict access to HTTP endpoint like Azure: `AuthorizationLevel.Function`?
    - I think the way to do it in AWS is VPC, which is much harder than an Enum setting haha.
    - Could put EC2 + Lambda in the same VPC, or something like that
2. How to handle env vars? When function deploys, env vars that I add manually from Console, are wiped.
    - I assume I have to define them in the .yml - but surely you dont write your secrets in the yml. How to handle that