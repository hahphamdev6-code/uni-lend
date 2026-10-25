#!/bin/bash
# Script baseline Flyway cho MySQL database đã tồn tại
# Chạy từ thư mục backend/

echo "=== UniLend Flyway Baseline Script ==="
echo ""
echo "Script này tạo bảng flyway_schema_history và đánh dấu V1 đã chạy."
echo "Dùng khi database MySQL đã được tạo schema thủ công (không qua Flyway)."
echo ""
echo "Chạy: cd backend && ./mvnw flyway:baseline -Dflyway.baselineVersion=1"
