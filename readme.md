# yo

https://in58jhw54e.execute-api.ap-southeast-2.amazonaws.com/dev/image?query={q}
https://jvb-milk-v2.s3-ap-southeast-2.amazonaws.com/recursive/{q}-montage.jpg

### Block Dupe messages:
- Redis: failed
    - there's a whole VPC thing to redis which makes it really hard to use.
    - Redis needs vpc
    - Lambda needs to be in vpc for it to work
    - Putting both in vpc meant actions to s3 failed? I dunno.


- DynamoDB: success...?
    - bad use case, not threadsafe
    - If I really wanted to avoid duplicate messages, use FIFO Queue bro
    - Even with a threadsafe redis lock or whatever, the "block" is only in place as long as the function is running. If a message is duplicated after the function has run, it will avoid the block. I don't think it would happen - but man it's another black mark haha.


https://stackoverflow.com/questions/37094695/how-should-i-connect-to-a-re﻿dis-instance-from-an-aws-lambda-function
sounds real fucky