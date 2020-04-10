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

2 processes: blues
Duration: 39202.90 ms	Billed Duration: 39300 ms	Memory Size: 3000 MB	Max Memory Used: 1176 MB	Init Duration: 284.94 ms	

1 process: jazz
Duration: 35483.56 ms	Billed Duration: 35500 ms	Memory Size: 3000 MB	Max Memory Used: 797 MB	Init Duration: 290.77 ms	
1 process: blues
Duration: 35483.56 ms	Billed Duration: 35500 ms	Memory Size: 3000 MB	Max Memory Used: 797 MB	Init Duration: 290.77 ms	

chunk - 1 process
Duration: 24449.31 ms	Billed Duration: 24500 ms	Memory Size: 3000 MB	Max Memory Used: 1340 MB	Init Duration: 276.84

Duration: 25104.61 ms Billed Duration: 25200 ms Memory Size: 3000 MB Max Memory Used: 1233 MB Init Duration: 274.07 ms

Duration: 35883.42 ms	Billed Duration: 35900 ms	Memory Size: 2000 MB	Max Memory Used: 685 MB	Init Duration: 280.86 ms