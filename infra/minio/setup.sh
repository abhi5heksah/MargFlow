#!/bin/bash

set -e

echo "Waiting for MinIO to be ready..."
until mc alias set local http://localhost:9000 minioadmin minioadmin 2>/dev/null; do
  echo "Still waiting..."
  sleep 1
done

echo "Creating bucket..."
mc mb local/margflow-screenshots --ignore-existing 2>/dev/null || true

echo "Setting bucket policy to public for development..."
mc anonymous set download local/margflow-screenshots 2>/dev/null || true

echo "MinIO setup complete!"