FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install Python, build essentials, Docker, and AWS SAM CLI dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip build-essential curl unzip apt-transport-https ca-certificates gnupg lsb-release && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce docker-ce-cli containerd.io && \
    apt-get clean && \
    curl -L https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-arm64.zip -o sam-cli.zip && \
    unzip sam-cli.zip -d sam-installation && \
    ./sam-installation/install && \
    rm -rf sam-installation sam-cli.zip

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app code
COPY . .

# Build TypeScript
RUN npm run build

# Create a directory for the Lambda function
RUN mkdir -p /var/task

# Copy the built files to the Lambda directory
RUN cp -r dist/* /var/task/

# Expose the port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=development
ENV SAM_CLI_CONTAINER_CONNECTION_TIMEOUT=60

# Start the server with debug logging
CMD ["sam", "local", "start-api", "--host", "0.0.0.0", "--debug"]
