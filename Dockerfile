FROM nginx:latest
COPY index.* /usr/share/nginx/html/
EXPOSE 80