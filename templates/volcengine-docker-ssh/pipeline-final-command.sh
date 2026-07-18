#!/usr/bin/env bash
set -euo pipefail

DEPLOY_IMAGE_TAG="${SCM_COMMIT_ID}-${PIPELINE_RUN_ID}" bash scripts/deploy-from-volcengine.sh

