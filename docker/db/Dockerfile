FROM postgres

ENV POSTGRES_PASSWORD docker
ENV POSTGRES_DB db
ENV POSTGRES_USER docker

# Copy SQL initialization scripts
COPY database/init.sql /docker-entrypoint-initdb.d/