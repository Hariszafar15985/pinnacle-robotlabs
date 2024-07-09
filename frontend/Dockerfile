FROM node:14 as build
EXPOSE 9000


# set working directory
RUN mkdir /app
WORKDIR /app
# add app
COPY ./app /app


# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# add args and environment variables
ARG REACT_APP_USERS_SERVICE_URL
ARG PUBLIC_URL
ENV REACT_APP_USERS_SERVICE_URL=$REACT_APP_USERS_SERVICE_URL
ENV PUBLIC_URL=$PUBLIC_URL
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
ARG REACT_APP_EVAL_SERVICE_URL
ENV REACT_APP_EVAL_SERVICE_URL=$REACT_APP_EVAL_SERVICE_URL

ARG GOOGLE_RECAPTCHA_KEY
ENV REACT_APP_GOOGLE_RECAPTCHA_KEY=$GOOGLE_RECAPTCHA_KEY

ARG GOOGLE_RECAPTCHA_SECRET
ENV REACT_APP_GOOGLE_RECAPTCHA_SECRET=$GOOGLE_RECAPTCHA_SECRET

ARG REACT_APP_WOO_URL
ENV REACT_APP_WOO_URL=$REACT_APP_WOO_URL

RUN export

# install and cache app dependencies
ADD ./app/package.json /app/package.json

#RUN npm install npm@7.8.0

#RUN npm install --legacy-peer-deps
RUN yarn

# build react app
#RUN npm run build
RUN yarn run build


# start app
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 9000
CMD ["nginx", "-g", "daemon off;"]
