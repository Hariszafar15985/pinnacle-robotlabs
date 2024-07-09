FROM python:3.11-bookworm

EXPOSE 5000

RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ bookworm-pgdg main" | tee  /etc/apt/sources.list.d/pgdg.list

RUN apt-get update
RUN apt-get -y install postgresql-client-15 vim cron unzip

RUN mkdir -p /app
WORKDIR /app
COPY ./app /app

RUN pip install --upgrade pip
RUN pip install pytest
RUN pip install pytest poetry
RUN poetry config virtualenvs.create false

RUN --mount=type=cache,target=/root/.cache/pypoetry/cache \
    --mount=type=cache,target=/root/.cache/pypoetry/artifacts \
    poetry install --no-interaction

##### ENV - Set
ARG DOMAIN
ENV DOMAIN=$DOMAIN

ARG POSTGRES_DB
ENV POSTGRES_DB=$POSTGRES_DB

ARG POSTGRES_USER
ENV POSTGRES_USER=$POSTGRES_USER

ARG POSTGRES_PASSWORD
ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# React Frontend App
ARG REACT_APP_USERS_SERVICE_URL
ENV REACT_APP_USERS_SERVICE_URL=$REACT_APP_USERS_SERVICE_URL

# Backend ENV
ARG ENV
ENV ENV=$ENV

ARG DOMAIN
ENV DOMAIN=$DOMAIN

ARG TAG
ENV TAG=$TAG

ARG PUBLIC_URL
ENV PUBLIC_URL=$PUBLIC_URL

ENV C_FORCE_ROOT true

ARG PRODUCTION
ENV PRODUCTION=$PRODUCTION

RUN echo "export PS1='\[\033[1;31m\]RobotLab BACKEND 🐳 \[\033[1;36m\]\h \[\033[1;34m\]\W\[\033[0;35m\] \[\033[1;36m\]# \[\033[0m\]'" >> ~/.bashrc

CMD /app/start.sh
