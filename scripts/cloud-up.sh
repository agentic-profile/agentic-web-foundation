#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

set -a
. ../cloud.env
set +a

: "${StackName:?Set StackName in cloud.env}"
: "${NatGatewayMode:=single}"
: "${DeploymentBucketRemovalPolicy:=delete}"
: "${EmptyBucketLogRetentionDays:=14}"

aws cloudformation deploy \
  --template-file ../cloud-formation.yaml \
  --stack-name "${StackName}" \
  --parameter-overrides \
    StackName="${StackName}" \
    NatGatewayMode="${NatGatewayMode}" \
    DeploymentBucketRemovalPolicy="${DeploymentBucketRemovalPolicy}" \
    EmptyBucketLogRetentionDays="${EmptyBucketLogRetentionDays}" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
