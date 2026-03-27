FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /code

# Install tzdata for timezone support
RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /code
RUN pip install -r requirements.txt
COPY . /code/