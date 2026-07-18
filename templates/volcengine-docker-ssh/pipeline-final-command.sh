#!/usr/bin/env bash
set -euo pipefail

DEPLOY_IMAGE_TAG="${SCM_COMMIT_ID}-${DATETIME}" bash scripts/deploy-from-volcengine.sh
