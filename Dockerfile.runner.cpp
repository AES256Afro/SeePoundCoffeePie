FROM docker.io/cloudflare/sandbox@sha256:6d741713aef266e8ae0831a5709c6f2d7b77b4952ac79b549f4f4e380af86fbe

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3=3.10.6-1~22.04.1 \
        libseccomp2=2.5.3-2ubuntu3~22.04.1 \
        python3-seccomp=2.5.3-2ubuntu3~22.04.1 \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        g++=4:11.2.0-1ubuntu1 \
        clang-14=1:14.0.0-1ubuntu1.1 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --uid 10001 --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin cadet \
    && install -d -m 0755 /opt/runner /workspace \
    && chmod 1777 /tmp \
    && chmod 0755 /var/tmp /dev/shm \
    && chmod 0700 /workspace

COPY runner/supervisor.py /opt/runner/supervisor.py
COPY runner/CppCollectionsAnalyzer.py /opt/runner/CppCollectionsAnalyzer.py

RUN chmod 0555 /opt/runner/supervisor.py \
    && chmod 0500 /opt/runner/CppCollectionsAnalyzer.py \
    && find /opt/runner -type d -exec chmod 0555 {} + \
    && g++ --version | head -1 \
    && clang++-14 --version | head -1
