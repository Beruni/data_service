FROM node:6.2.2
COPY ./dist/js/ /root/js/
COPY ./node_modules/ /root/node_modules/
WORKDIR /root/
CMD node ./js/src/app.min.js