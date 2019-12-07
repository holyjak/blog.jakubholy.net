---
title: "AWS Fargate: Troubleshooting the dreaded 'service .. is unhealthy'"
category: "SW development"
tags: [DevOps]
---

So you have just deployed your Docker container to AWS Fargate but it keeps on restarting with the _event_ "service XYZ (..) is unhealthy .." and you have no idea why. I have spent many bloody hours here and will gladly share my insights with you. The 3 key questions to ask are:

1. Do requests for `/` return `200 OK`?
2. Do they return quickly enough?
3. Does the service start responding quickly enough after a start?

(+ a bonus question and more troubleshooting tips)

<!--more-->

## 1. Do requests for `/` return `200 OK`?

By default, `/` is the URL the target group's health check tries to access and it needs to return `200 OK` five times in a row for the service to be considered healthy. This Even indicated that it was not returning 200:

> service my-awesome-service (port 8081) is unhealthy in target-group my-custer-my-awesome-service due to (reason Health checks failed with these codes: [502]).

(In this case my service was hardcoded to return 200. The 502 was there likely because the service was too slow to start, see below.)

Our request handling has a top-level [middleware]() that handles this when called by the health check:

```clojure
(defn wrap-health-check
  "Add healthcheck for the AWS load balancer to use"
  [handler]
  (fn [req]
    (let [user-agent (get-in req [:headers "user-agent"] "")]
      (if (str/starts-with? user-agent "ELB-HealthChecker/")
        {:status 200}
        (handler req)))))
```

(It might be a good idea to change the default path from `/` to something like `/health` but the [Fargate CLI](https://github.com/awslabs/fargatecli) doesn't support it (yet) and we want to keep it simple.)

(NOTE: You can modify the health check's _Success codes_ to include also other status codes, for example "200-599".)

## 2. Do they return quickly enough?

The response must reach the requester by default within 5 seconds. If your server takes longer than that (f.ex. under heavy load), increase the health check Timeout (and perhaps also the check Interval), e.g. using the [aws elbv2 modify-target-group](https://docs.aws.amazon.com/cli/latest/reference/elbv2/modify-target-group.html) CLI. Something like:

    aws elbv2 modify-target-group --target-group-arn "arn:aws:elasticloadbalancing:eu-west-1:123456789012:targetgroup/main-my-service-xy/1500573009bb0447" \
      --health-check-timeout-seconds 30 \
      --health-check-interval-seconds 200

Notice that the interval may not be smaller than the timeout. You can also change the port, path, protocol, thresholds.

## 3. Does the service start responding quickly enough after a start?

The health checks start firing ± as soon as the service is deployed. If it needs a while before it can respond, the target group might deem it unhealthy and kill it before it has time to get ready. (True story!) In that case, increase the default grace period from 0s to e.g. 5 min using the [aws ecs update-service](https://docs.aws.amazon.com/cli/latest/reference/ecs/update-service.html) CLI:

    aws ecs update-service --cluster main --service $SERVICE_NAME \
      --health-check-grace-period-seconds 36

## 4. Bonus question: Are all connections correct and open?

Does the listener try to contact the service on a port where it is actually running, using the correct protocol? (The event shown at the start of this article includes the port the health check uses.) Does the [service's security group allow the load balancer's](https://serverfault.com/a/868668) security group to access the port?

## Other tips

You can completely disable the health check so that the service gets time to start up and you can interact with it undisturbed, using the `modify-target-group` command with `--no-health-check-enabled`.

You can also try to `curl` the service on the given port (using its private IP) from an EC2 node in the same subnet (remember to ensure that their respective security group allow the connection).

And a word of warning: It has happened to me that a service was working just fine and then suddenly started experiencing this problem. A while later it disappeared again. I suspect that something in the infrastructure or the services it depended on for initialization got slower for a while. So make sure that your actual values are not too close to the the grace period and health check limits and that you have a sufficient safety buffer there.

See also:

* [Amazon: How do I troubleshoot unhealthy Application Load Balancer health checks in Amazon ECS?](https://aws.amazon.com/premiumsupport/knowledge-center/troubleshoot-unhealthy-checks-ecs/)
