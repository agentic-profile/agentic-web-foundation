#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

set -a
. ../cloud.env
set +a

: "${ProjectName:?Set ProjectName in cloud.env}"
: "${NatGatewayMode:=single}"
: "${DeploymentBucketRemovalPolicy:=delete}"
: "${EmptyBucketLogRetentionDays:=14}"

aws cloudformation deploy \
  --template-file ../cloud-formation.yaml \
  --stack-name "${ProjectName}" \
  --parameter-overrides \
    ProjectName="${ProjectName}" \
    NatGatewayMode="${NatGatewayMode}" \
    DeploymentBucketRemovalPolicy="${DeploymentBucketRemovalPolicy}" \
    EmptyBucketLogRetentionDays="${EmptyBucketLogRetentionDays}" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
