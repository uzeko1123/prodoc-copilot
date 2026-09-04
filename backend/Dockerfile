FROM python:3.12-slim
WORKDIR /app
ARG PIP_REQUIREMENTS=base.txt
COPY requirements/base.txt requirements/
COPY requirements/${PIP_REQUIREMENTS} requirements/
RUN pip install --no-cache-dir -r requirements/${PIP_REQUIREMENTS}
COPY . .
