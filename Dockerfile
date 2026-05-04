FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY C:/Users/DELL/OneDrive/Desktop/portfolio/index.html /usr/share/nginx/html/index.html
COPY C:/Users/DELL/OneDrive/Desktop/portfolio/styles.css /usr/share/nginx/html/styles.css
COPY C:/Users/DELL/OneDrive/Desktop/portfolio/script.js /usr/share/nginx/html/script.js
COPY C:/Users/DELL/OneDrive/Desktop/portfolio/assets /usr/share/nginx/html/assets

EXPOSE 80