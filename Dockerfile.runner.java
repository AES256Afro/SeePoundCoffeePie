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
        openjdk-21-jdk-headless=21.0.11+10-1~22.04.2 \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --uid 10001 --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin cadet \
    && install -d -m 0755 /opt/runner /workspace \
    && chmod 1777 /tmp \
    && chmod 0755 /var/tmp /dev/shm \
    && chmod 0700 /workspace

COPY runner/supervisor.py /opt/runner/supervisor.py
COPY runner/JavaProjectAnalyzer.java /opt/runner/JavaProjectAnalyzer.java

RUN chmod 0555 /opt/runner/supervisor.py \
    && install -d -m 0555 /opt/runner/java/analyzer /opt/runner/java/empty-classpath \
    && /usr/bin/javac \
        --release 21 \
        -encoding UTF-8 \
        -proc:none \
        -d /opt/runner/java/analyzer \
        /opt/runner/JavaProjectAnalyzer.java \
    && rm /opt/runner/JavaProjectAnalyzer.java \
    && find /opt/runner -type d -exec chmod 0555 {} + \
    && find /opt/runner -type f -exec chmod 0444 {} + \
    && chmod 0555 /opt/runner/supervisor.py \
    && /usr/bin/java \
        -Xms16m \
        -Xmx384m \
        -XX:MaxMetaspaceSize=128m \
        -XX:+UseSerialGC \
        -XX:ActiveProcessorCount=1 \
        -XX:CICompilerCount=2 \
        -cp /opt/runner/java/analyzer \
        JavaProjectAnalyzer \
        /nonexistent \
        >/dev/null \
    && javac -version
