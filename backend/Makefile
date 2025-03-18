
install:
	uv sync --all-extras

build:
	docker build -t crop-backend .

run: build
	docker  run --rm -p 8000:8000 --name face-detection-cropping-backend crop-backend

serve:
	uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test: install
	uv run pytest tests
