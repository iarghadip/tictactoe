FROM heroiclabs/nakama:latest

ARG SERVER_KEY

COPY nakama-config.yml /nakama/data/local.yml
RUN sed -i "s|nakama@localhost|root@cockroachdb|g" /nakama/data/local.yml
RUN sed -i "s/server_key:.*/server_key: \"${SERVER_KEY}\"/g" /nakama/data/local.yml

COPY data/modules/src /nakama/data/modules/src