# AWS Elastic Load Balancer (ELB) Setup Guide

This guide provides a comprehensive walkthrough for setting up an Application Load Balancer (ALB) for your Node.js microservices on AWS.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Step 1: Create Target Groups](#1-create-target-groups)
4. [Step 2: Create Application Load Balancer](#2-create-application-load-balancer)
5. [Step 3: Configure Listeners and Rules](#3-configure-listeners-and-rules)
6. [Step 4: Register EC2 Instances](#4-register-ec2-instances)
7. [Step 5: Set Up SSL/TLS with ACM](#5-set-up-ssltls-with-acm)
8. [Step 6: Configure Security Groups](#6-configure-security-groups)
9. [Step 7: Test Your Setup](#7-test-your-setup)
10. [Step 8: Monitoring and Logging](#8-monitoring-and-logging)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

## Prerequisites

- AWS account with appropriate IAM permissions
- EC2 instances running your Node.js services
- Registered domain (recommended for HTTPS)
- Basic understanding of AWS services (EC2, VPC, IAM)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Internet Users                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Application Load Balancer                   │
│  ┌──────────────┐  ┌──────────────┐   ┌───────────────────┐ │
│  │  Listener    │  │  Listener    │   │  Target Groups    │ │
│  │  HTTP (80)   │  │  HTTPS (443) ├──►  - auth-service    │ │
│  └──────────────┘  └──────────────┘   |  - image-service  │ │
│                                       |  - coin-service   │ │
└───────────────────────────────────────|  - sub-service    │─┘
                                        └───────────────────┘
                                                 │
    ┌────────────────────────────────────────────┼─────────────────────────────┐
    │                                            │                             │
    ▼                                            ▼                             ▼
┌───────────┐                              ┌───────────┐                ┌───────────┐
│  EC2      |                              |  EC2      |                |  EC2      |
│  Instance |                              |  Instance |      ...       |  Instance |
│  (auth)   |                              |  (image)  |                |  (sub)    |
└───────────┘                              └───────────┘                └───────────┘
```

## 1. Create Target Groups

### For each service (auth, image, coin, subscription):

1. **Open AWS Console** → **EC2** → **Target Groups**
2. Click **Create target group**
3. Choose **Instances** as target type
4. Configure basic settings:
   - **Target group name**: `{service-name}-tg` (e.g., `auth-service-tg`)
   - **Protocol**: HTTP
   - **Port**: Service port (e.g., 3001 for auth)
   - **VPC**: Select your VPC
   - **Protocol version**: HTTP1

5. **Health check settings**:
   - Health check path: `/health`
   - Healthy threshold: 2
   - Unhealthy threshold: 2
   - Timeout: 5 seconds
   - Interval: 30 seconds
   - Success codes: 200

6. Click **Next** and **Create target group**

## 2. Create Application Load Balancer

1. **EC2 Console** → **Load Balancers** → **Create Load Balancer**
2. Select **Application Load Balancer**
3. Configure basic settings:
   - Name: `ai-image-app-alb`
   - Scheme: `internet-facing`
   - IP address type: `IPv4`
   - VPC: Select your VPC
   - Mappings: Select at least 2 subnets in different AZs

4. **Security groups**:
   - Create new or select existing
   - Allow HTTP (80) and HTTPS (443) from anywhere
   - Allow SSH (22) from your IP only

5. **Listeners and routing**:
   - HTTP:80 → Forward to a temporary target group (we'll update later)
   - HTTPS:443 → Forward to a temporary target group

6. Click **Create load balancer**

## 3. Configure Listeners and Rules

### HTTPS Listener (Port 443)

1. Select your ALB → **Listeners** → **View/Edit rules** for HTTPS:443
2. Delete the default rule
3. Click **Add rule** and configure:
   ```
   IF
     Path is /auth/*
   THEN
     Forward to auth-service-tg
   ```
4. Repeat for other services:
   ```
   IF
     Path is /image/*
   THEN
     Forward to image-service-tg
   
   IF
     Path is /coin/*
   THEN
     Forward to coin-service-tg
   
   IF
     Path is /subscription/*
   THEN
     Forward to subscription-service-tg
   ```
5. Set default action to return 404

### HTTP Listener (Port 80)

1. Select your ALB → **Listeners** → **View/Edit rules** for HTTP:80
2. Add a rule to redirect HTTP to HTTPS:
   ```
   IF
     All traffic
   THEN
     Redirect to https://#{host}:443/#{path}?#{query}
     Status code: HTTP_301
   ```

## 4. Register EC2 Instances

For each target group:

1. Go to **Target Groups** → Select your target group → **Targets** tab
2. Click **Edit**
3. Select the EC2 instance(s) for this service
4. Set the port (e.g., 3001 for auth service)
5. Click **Add to registered**
6. Click **Save**

## 5. Set Up SSL/TLS with ACM

1. **Request a certificate**:
   - Open AWS Certificate Manager (ACM)
   - Click **Request a certificate**
   - Add your domain (e.g., `api.yourdomain.com`)
   - Add a wildcard (e.g., `*.yourdomain.com`) if needed
   - Choose DNS validation
   - Complete validation by adding the CNAME records to your DNS provider

2. **Update ALB listener**:
   - Go to your ALB → **Listeners**
   - Select HTTPS:443 → **Edit**
   - Select your certificate from ACM
   - Security policy: ELBSecurityPolicy-TLS-1-2-2017-01
   - Save changes

## 6. Configure Security Groups

### ALB Security Group (Inbound Rules)
```
Type           Protocol  Port Range  Source
HTTP (80)      TCP       80          0.0.0.0/0
HTTPS (443)    TCP       443         0.0.0.0/0
Custom TCP     TCP       3000-3010   Your IP (for testing)
```

### EC2 Instance Security Group (Inbound Rules)
```
Type           Protocol  Port Range  Source
SSH (22)       TCP       22          Your IP
Custom TCP     TCP       3001        ALB Security Group
Custom TCP     TCP       3002        ALB Security Group
Custom TCP     TCP       3003        ALB Security Group
Custom TCP     TCP       3004        ALB Security Group
```

## 7. Test Your Setup

1. Get your ALB DNS name from the EC2 console
2. Test each endpoint:
   ```bash
   # Health check
   curl -v http://your-alb-dns/
   
   # Test auth service
   curl -v http://your-alb-dns/auth/health
   
   # Test with custom domain (HTTPS)
   curl -v https://api.yourdomain.com/auth/health
   ```

## 8. Monitoring and Logging

### Enable Access Logs
1. Go to your ALB → **Attributes**
2. Click **Edit attributes**
3. Enable access logs
4. Select an S3 bucket for logs
5. Click **Save**

### CloudWatch Metrics
1. Go to CloudWatch → **Metrics** → **ELB**
2. Monitor key metrics:
   - RequestCount
   - HTTPCode_Target_2XX_Count
   - HTTPCode_Target_4XX_Count
   - HTTPCode_Target_5XX_Count
   - TargetResponseTime
   - UnHealthyHostCount

## Troubleshooting

### Common Issues
1. **Health check failures**:
   - Verify security groups allow traffic from ALB to instances
   - Check if your service is running and responding on the expected port
   - Verify health check path is correct

2. **502 Bad Gateway**:
   - Check if targets are healthy
   - Verify security group rules
   - Check application logs on EC2 instances

3. **SSL/TLS issues**:
   - Verify certificate is issued and validated in ACM
   - Check if certificate is associated with the correct listener
   - Ensure security policy is compatible

## Best Practices

1. **High Availability**:
   - Deploy instances across multiple AZs
   - Use Auto Scaling groups for each service

2. **Security**:
   - Enable WAF (Web Application Firewall)
   - Use AWS Shield for DDoS protection
   - Rotate SSL certificates before expiration

3. **Performance**:
   - Enable connection draining
   - Configure idle timeout (default 60s)
   - Enable cross-zone load balancing

4. **Cost Optimization**:
   - Delete unused load balancers
   - Use Application Load Balancer instead of Classic
   - Monitor and clean up unused target groups

## Next Steps

1. Set up Auto Scaling for your services
2. Configure CloudFront for CDN
3. Implement WAF rules for security
4. Set up CloudWatch Alarms for monitoring

## Additional Resources

- [AWS ELB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/)
- [Best Practices for ELB](https://aws.amazon.com/elasticloadbalancing/features/)
- [Troubleshooting ELB](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html)
