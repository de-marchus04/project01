# Infra

Инфраструктурные артефакты проекта:
- `docker-compose.yml`
- `nginx/default.conf`
- `github/workflows/ci.yml` (копия активного workflow)
- `perf/k6-courses-catalog.js` (нагрузочный сценарий для каталога)

## Monitoring + Alerts
- Конфиги мониторинга находятся в `monitoring/`:
	- `prometheus.yml`
	- `alert_rules.yml`
	- `alertmanager.yml`
	- `blackbox.yml`
- В `docker-compose.yml` добавлены сервисы:
	- `prometheus` (порт 9090)
	- `alertmanager` (порт 9093)
	- `blackbox-exporter` (порт 9115)
	- `grafana` (порт 3000)

## Ops scripts
- `ops/backup.sh` — сделать backup PostgreSQL.
- `ops/restore.sh` — восстановить backup.
- `ops/drill.sh` — прогон backup-restore drill в временную БД.
- `ops/rotate-secrets.sh` — сгенерировать новый набор секретов.

## Secrets
- Пример переменных окружения: `.env.example`.
