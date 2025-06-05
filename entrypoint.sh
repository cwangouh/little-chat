#!/bin/sh

for i in $(seq 1 30); do
  nc -z db 5432 && break
  sleep 1
done

nc -z db 5432
if [ $? -ne 0 ]; then
  exit 1
fi

alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
