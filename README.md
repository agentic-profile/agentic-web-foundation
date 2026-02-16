# Agentic Web Foundation (CloudFormation)

This repo provides a single CloudFormation template (`foundation.yaml`) plus npm scripts to deploy a **shared “foundation” stack** for agentic workloads:

- VPC with public/private subnets
- Internet gateway + routing
- NAT Gateway for private subnet egress
- S3 deployment bucket (versioned + encrypted)
- Valkey (ElastiCache Serverless) + generated password in Secrets Manager

## Prerequisites

- AWS CLI configured (`aws sts get-caller-identity` should work)
- Permissions to create VPC/EC2/S3/ElastiCache/SecretsManager/IAM resources

## Quickstart

Deploy **staging** (default):

```bash
npm run foundation:up
```

Deploy **prod**:

```bash
npm run foundation:up:prod
```

### Custom project name

All scripts accept a `PROJECT_NAME` env var (defaults to `agentic-web-foundation`):

```bash
PROJECT_NAME=myproject npm run foundation:up
PROJECT_NAME=myproject npm run foundation:up:prod
```

## Useful parameters

If you’re calling CloudFormation directly (or editing the npm scripts), these are the main knobs:

- **`ProjectName`**: lower-case identifier used in names/tags
- **`Stage`**: `staging` or `prod`

Example (staging):

```bash
aws cloudformation deploy \
  --template-file foundation.yaml \
  --stack-name myproject-staging \
  --parameter-overrides ProjectName=myproject Stage=staging \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
```
