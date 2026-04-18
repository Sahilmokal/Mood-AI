# AWS Deployment Guide

## Architecture

```
Internet
   │
   ▼
CloudFront (CDN)
   ├── /              → S3 (React SPA static files)
   └── /api/*         → ALB → EC2 (Spring Boot + FastAPI via Docker)
                               │
                               ├── Spring Boot  :8080
                               └── FastAPI ML   :8000
                                       │
                                  RDS PostgreSQL
```

## Services Used

| Service       | Purpose                              | Tier             |
|---------------|--------------------------------------|------------------|
| EC2           | Run Docker Compose (backend + ML)    | t3.medium+       |
| RDS           | PostgreSQL managed database          | db.t3.micro+     |
| S3            | Host React static files + images     | Standard         |
| CloudFront    | CDN for S3 + ALB routing             | Standard         |
| ALB           | Load balancer (HTTP → EC2)           | Standard         |
| ACM           | SSL/TLS certificate                  | Free             |
| Secrets Manager | Store API keys, DB passwords       | Standard         |
| ECR           | Store Docker images (optional)       | Standard         |

---

## Step-by-Step Deployment

### 1. Provision RDS (PostgreSQL)

```bash
aws rds create-db-instance \
  --db-instance-identifier moodrec-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16 \
  --master-username moodrec \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 20 \
  --db-name moodrec \
  --vpc-security-group-ids <SG_ID> \
  --no-publicly-accessible \
  --backup-retention-period 7 \
  --region ap-south-1
```

### 2. Store Secrets in AWS Secrets Manager

```bash
aws secretsmanager create-secret \
  --name moodrec/prod \
  --secret-string '{
    "DB_URL": "jdbc:postgresql://<RDS_ENDPOINT>:5432/moodrec",
    "DB_USER": "moodrec",
    "DB_PASS": "<RDS_PASSWORD>",
    "JWT_SECRET": "<RANDOM_64_CHAR_STRING>",
    "TMDB_API_KEY": "<YOUR_KEY>",
    "SPOTIFY_CLIENT_ID": "<YOUR_ID>",
    "SPOTIFY_CLIENT_SECRET": "<YOUR_SECRET>"
  }' \
  --region ap-south-1
```

### 3. Launch EC2 Instance

```bash
# Amazon Linux 2023, t3.medium (4GB RAM minimum for ML models)
aws ec2 run-instances \
  --image-id ami-0a0f1259dd1c90938 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids <SG_ID> \
  --subnet-id <PRIVATE_SUBNET_ID> \
  --iam-instance-profile Name=moodrec-ec2-role \
  --user-data file://ec2-userdata.sh \
  --region ap-south-1
```

**ec2-userdata.sh:**
```bash
#!/bin/bash
yum update -y
yum install -y docker git
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose v2
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone repo
cd /opt
git clone https://github.com/your-org/mood-rec-system.git
cd mood-rec-system

# Pull secrets from AWS Secrets Manager into .env
aws secretsmanager get-secret-value \
  --secret-id moodrec/prod \
  --region ap-south-1 \
  --query SecretString \
  --output text | python3 -c "
import sys, json
d = json.load(sys.stdin)
with open('.env', 'w') as f:
    for k, v in d.items():
        f.write(f'{k}={v}\n')
"

# Start production stack (no postgres — using RDS)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d \
  ml-service backend frontend
```

### 4. Deploy React Frontend to S3

```bash
# Build frontend
cd frontend
npm ci
VITE_API_URL=https://api.yourdomain.com/api/v1 npm run build

# Sync to S3
aws s3 sync dist/ s3://moodrec-assets \
  --delete \
  --cache-control "max-age=31536000,immutable" \
  --exclude "index.html"

# index.html must NOT be cached
aws s3 cp dist/index.html s3://moodrec-assets/index.html \
  --cache-control "no-cache,no-store,must-revalidate"
```

### 5. Set Up CloudFront

Create two origins:
- **S3 Origin**: Points to `moodrec-assets.s3.amazonaws.com`
  - Default behavior: forward to S3
  - Custom error pages: 403/404 → `/index.html` (for SPA routing)
- **ALB Origin**: Points to your Application Load Balancer
  - Behavior path pattern: `/api/*`
  - Cache policy: `CachingDisabled`
  - Origin request policy: `AllViewer`

```bash
# Example CloudFront distribution creation (simplified)
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### 6. Set Up Application Load Balancer

```bash
aws elbv2 create-load-balancer \
  --name moodrec-alb \
  --subnets <PUBLIC_SUBNET_1> <PUBLIC_SUBNET_2> \
  --security-groups <SG_ID> \
  --scheme internet-facing \
  --type application

# Target group pointing to EC2 :8080
aws elbv2 create-target-group \
  --name moodrec-backend-tg \
  --protocol HTTP --port 8080 \
  --vpc-id <VPC_ID> \
  --health-check-path /actuator/health
```

### 7. Security Groups

```
ALB Security Group:
  Inbound:  443 (HTTPS) from 0.0.0.0/0
  Inbound:  80  (HTTP)  from 0.0.0.0/0 → redirect to 443
  Outbound: All to EC2 SG

EC2 Security Group:
  Inbound:  8080 from ALB SG
  Inbound:  22   from your IP (SSH)
  Outbound: All  (for RDS, external APIs)

RDS Security Group:
  Inbound:  5432 from EC2 SG only
```

---

## IAM Role for EC2

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "s3:GetObject",
        "s3:PutObject",
        "ecr:GetAuthorizationToken",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Cost Estimate (Mumbai ap-south-1, monthly)

| Service         | Tier            | ~Cost/month |
|-----------------|-----------------|-------------|
| EC2 t3.medium   | On-demand       | ~$33        |
| RDS db.t3.micro | Single-AZ       | ~$15        |
| S3              | 5 GB            | ~$0.12      |
| CloudFront      | 10 GB transfer  | ~$0.85      |
| ALB             | 1 LCU           | ~$16        |
| Secrets Manager | 1 secret        | ~$0.40      |
| **Total**       |                 | **~$65/mo** |

Use Reserved Instances for 1-year commit to cut EC2+RDS by ~40%.

---

## Monitoring & Ops

```bash
# View live logs
docker-compose logs -f backend
docker-compose logs -f ml-service

# Restart a service
docker-compose restart backend

# Run DB migrations only
docker-compose run --rm backend java -jar app.jar --spring.flyway.target=latest

# Health checks
curl http://localhost:8080/actuator/health
curl http://localhost:8000/health
```
