#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(dirname "$0")/../local-repo"
RPM_DIR="$(dirname "$0")/../src-tauri/target/release/bundle/rpm"

rpm_file=$(ls -t "$RPM_DIR"/*.rpm 2>/dev/null | head -1)
if [ -z "$rpm_file" ]; then
  echo "No .rpm found in $RPM_DIR. Run 'npm run tauri build' first." >&2
  exit 1
fi

cp "$rpm_file" "$REPO_DIR/"
createrepo_c "$REPO_DIR"
echo "Updated local repo: $(basename "$rpm_file")"
