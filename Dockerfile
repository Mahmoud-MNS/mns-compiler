FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ default-jdk-headless mono-mcs mono-runtime \
    && rm -rf /var/lib/apt/lists/*