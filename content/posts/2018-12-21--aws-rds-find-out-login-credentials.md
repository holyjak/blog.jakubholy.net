---
title: "AWS RDS: How to find out login credentials to the database"
category: "[Dev]Ops"
tags: [aws]
---

To log in to your AWS RDS database (Oracle in my case) you need login credentials, but what are these for a newly created DB?
The password is the [master user password](https://aws.amazon.com/premiumsupport/knowledge-center/reset-master-user-password-rds/)
you entered during DB creation and which you can change via the Console.

To find out the master user name:

<!--more-->

```bash
aws rds describe-db-instances --output table --query 'DBInstances[*].DBInstanceIdentifier'
```

and then

```bash
aws rds describe-db-instances --db-instance-identifier <an identifier from the previous table> \
  --query 'DBInstances[*].MasterUsername'
```
