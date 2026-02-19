# Agentic Web Foundation (CloudFormation)

This repo provides a single CloudFormation template (`cloud-formation.yaml`) plus npm scripts to deploy a **shared “foundation” stack** for agentic workloads:

- VPC with public/private subnets
- Internet gateway + routing
- NAT Gateway for private subnet egress
- S3 deployment bucket (versioned + encrypted)
- Valkey (ElastiCache Serverless) + generated password in Secrets Manager

## Prerequisites

- AWS CLI configured (`aws sts get-caller-identity` should work)
- Permissions to create VPC/EC2/S3/ElastiCache/SecretsManager/IAM resources

## Quickstart

1. Make sure you have done the prerequisites

2. Create a `cloud.env` file.

```bash
StackName=agentic-web-foundation
```

3. Deploy the stack:

```bash
npm run cloud:up
```

4. Write stack outputs to an env file for other projects/scripts:

```bash
npm run results
```

5. Copy the resulting `foundation-results.env` into your other projects.


## Package scripts

These are the scripts defined in `package.json`:

- **Deploy**
  - **`npm run cloud:up`**: deploy CloudFormation stack named `${StackName}` using `cloud-formation.yaml`
- **Delete**
  - **`npm run cloud:down`**: delete CloudFormation stack named `${StackName}`
- **Status**
  - **`npm run status`**: print stack status for `${StackName}` (or `STACK_DELETED`)
- **Recent events**
  - **`npm run events`**: show 5 most recent stack events for `${StackName}`
- **Write outputs to env file**
  - **`npm run results`**: write CloudFormation Outputs to `foundation-results.env`

`foundation-results.env` is generated output. You probably want it ignored by git.


## Useful parameters

If you’re calling CloudFormation directly (or editing the npm scripts), these are the main knobs:

- **`StackName`**: lower-case identifier used in names/tags and used as the CloudFormation stack name
- The deployment bucket is always emptied during stack deletion so it can be deleted cleanly

The outputs writer also supports a stage concept (it defaults to `staging` when run directly):

```bash
node scripts/write-formation-results.js --stage=prod --out=foundation-results.env
```

Example (staging):

```bash
aws cloudformation deploy \
  --template-file cloud-formation.yaml \
  --stack-name myproject \
  --parameter-overrides StackName=myproject \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
```
