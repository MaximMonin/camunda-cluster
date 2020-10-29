FROM camunda/camunda-bpm-platform:tomcat-latest
RUN rm -r webapps/camunda-invoice webapps/examples webapps/h2
COPY cfg/web.xml /camunda/webapps/engine-rest/WEB-INF/web.xml
COPY cfg/bpm-platform.xml /camunda/conf/bpm-platform.xml:ro
COPY cfg/postgresql-42.2.16.jar /camunda/lib/postgresql-9.4.1212.jar
